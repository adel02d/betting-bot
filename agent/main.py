# agent/main.py — Servidor FastAPI + Webhook de WhatsApp para EnergixCu
# Basado en whatsapp-agent-kit de alanjmr21, adaptado para Jose
# Versión 2.1 — Optimizado para uso solo con teléfono + actualización catálogo por mensaje

import os
import logging
import json
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, Form
from fastapi.responses import PlainTextResponse, JSONResponse, HTMLResponse
from dotenv import load_dotenv

from agent.brain import generar_respuesta, es_admin_phone
from agent.memory import inicializar_db, guardar_mensaje, obtener_historial
from agent.providers import obtener_proveedor
from agent.catalog import (
    listar_catalogo_completo,
    actualizar_catalogo_desde_texto_admin,
    cargar_catalogo_json
)

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
log_level = logging.DEBUG if ENVIRONMENT == "development" else logging.INFO
logging.basicConfig(level=log_level, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("energixcu-agent")

try:
    proveedor = obtener_proveedor()
    proveedor_nombre = proveedor.__class__.__name__
except Exception as e:
    logger.warning(f"No se pudo inicializar proveedor: {e} — usando modo simulación")
    proveedor = None
    proveedor_nombre = "Simulado"

PORT = int(os.getenv("PORT", 8000))
TICKETS_DIR = Path("./data/pedidos")
TICKETS_DIR.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await inicializar_db()
        logger.info("Base de datos inicializada")
    except Exception as e:
        logger.error(f"Error inicializando DB: {e}")
    logger.info(f"⚡ Servidor EnergixCu (Jose) corriendo en puerto {PORT}")
    logger.info(f"Proveedor WhatsApp: {proveedor_nombre}")
    logger.info(f"Empresa: EnergixCu | Agente: Jose")
    logger.info(f"ADMIN_PHONE: {os.getenv('ADMIN_PHONE','no configurado')}")
    yield
    logger.info("Apagando servidor...")

app = FastAPI(
    title="EnergixCu — WhatsApp AI Agent (Jose)",
    description="Asesor virtual de ventas de EnergixCu — Energía inteligente para Cuba — Optimizado para teléfono",
    version="2.1.0",
    lifespan=lifespan
)

# ---------- HELPERS ----------
async def notificar_admin_nuevo_pedido(ticket_texto: str, telefono_cliente: str, nombre_cliente: str):
    """Cuando se crea un pedido, envía el ticket por WhatsApp al ADMIN_PHONE."""
    admin_phones_raw = os.getenv("ADMIN_PHONE", "") + "," + os.getenv("ADMIN_IDS", "")
    if not admin_phones_raw.strip(", "):
        logger.info("ADMIN_PHONE no configurado, no se envía notificación de pedido")
        return

    if proveedor is None:
        logger.warning("Proveedor no configurado, no se puede notificar admin")
        return

    # Si el ticket es vacío, no enviar
    if "TICKET DE PEDIDO - ENERGIXCU" not in ticket_texto:
        return

    # Mensaje para admin
    mensaje_admin = (
        f"🔔 *¡NUEVO PEDIDO ENERGIXCU!* 🔔\n\n"
        f"{ticket_texto}\n\n"
        f"📞 Cliente WhatsApp: {telefono_cliente}\n"
        f"👤 Nombre contacto: {nombre_cliente}\n"
        f"🕐 Fecha: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        f"✅ Acción requerida: Contactar al cliente para coordinar entrega.\n"
        f"Puedes ver todos los pedidos en: /admin/pedidos"
    )

    admin_list = []
    for admin in admin_phones_raw.split(","):
        admin = admin.strip()
        if not admin:
            continue
        # Normalizar
        admin_norm = admin.replace(" ", "").replace("-", "")
        # Evitar enviar al mismo cliente si coincide
        if normalize_phone_simple(admin_norm)[-8:] == normalize_phone_simple(telefono_cliente)[-8:]:
            logger.info(f"No notificar admin {admin_norm} porque es el mismo cliente")
            continue
        admin_list.append(admin_norm)

    for admin_phone in admin_list:
        try:
            enviado = await proveedor.enviar_mensaje(admin_phone, mensaje_admin)
            if enviado:
                logger.info(f"📤 Ticket enviado a admin {admin_phone}")
            else:
                logger.error(f"❌ Fallo enviando ticket a admin {admin_phone}")
        except Exception as e:
            logger.error(f"Error notificando admin {admin_phone}: {e}")

def normalize_phone_simple(phone: str) -> str:
    if not phone:
        return ""
    return phone.replace("whatsapp:", "").replace(" ", "").replace("-", "")

def detectar_actualizacion_catalogo_por_mensaje(texto: str) -> bool:
    """Detecta si el mensaje intenta actualizar catálogo - optimizado teléfono."""
    lower = texto.lower()
    import re
    keywords = [
        "productos nuevos del dia",
        "productos nuevos del día",
        "productos nuevos",
        "actualizacion de catalogo",
        "actualización de catálogo",
        "actualiza catalogo",
        "actualiza catálogo",
        "nuevo producto",
        "agregar producto",
        "nueva bateria",
        "nuevo panel",
        "nuevo inversor",
        "actualizar precio",
        "precio nuevo",
        "admin:",
        "admin catalogo",
        "catalogo nuevo",
        "nuevo catalogo",
        "agregar al catalogo"
    ]
    for kw in keywords:
        if kw in lower:
            return True

    # Detectar lista con guiones y precio
    lineas = texto.split("\n")
    count = 0
    for linea in lineas:
        l = linea.strip().lower()
        if l.startswith(("-", "•", "*", "–", "—")) and ("$" in l or "cup" in l or "usd" in l):
            count += 1
    if count >= 1:
        return True

    # Una sola línea tipo producto con precio
    if len(lineas) == 1 and "$" in texto and any(p in lower for p in ["panel", "bateria", "batería", "inversor", "kit", "estacion", "controlador"]):
        return True

    return False

# ---------- ENDPOINTS BÁSICOS ----------

@app.get("/")
async def health_check():
    return {
        "status": "ok",
        "service": "energixcu-agent",
        "agent": "Jose",
        "company": "EnergixCu",
        "provider": proveedor_nombre,
        "environment": ENVIRONMENT,
        "admin_phone": os.getenv("ADMIN_PHONE", "no configurado"),
        "endpoints": {
            "webhook": "/webhook",
            "admin_panel": "/admin",
            "catalog": "/catalog",
            "pedidos": "/pedidos",
            "pedidos_html": "/admin/pedidos",
            "test_chat": "/test-chat"
        },
        "telefono_solo": "Puedes usar todo desde tu teléfono en /admin"
    }

@app.get("/webhook")
async def webhook_verificacion(request: Request):
    if proveedor is None:
        return {"status": "ok", "mode": "simulado"}
    try:
        resultado = await proveedor.validar_webhook(request)
        if resultado is not None:
            return PlainTextResponse(str(resultado))
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error validación webhook: {e}")
        return {"status": "ok"}

@app.post("/webhook")
async def webhook_handler(request: Request):
    if proveedor is None:
        try:
            body = await request.json()
            logger.info(f"[SIMULADO] Webhook recibido: {body}")
        except:
            try:
                form = await request.form()
                logger.info(f"[SIMULADO] Webhook form: {dict(form)}")
            except Exception as e:
                logger.info(f"[SIMULADO] Webhook error: {e}")
        return {"status": "ok", "mode": "simulado"}

    try:
        mensajes = await proveedor.parsear_webhook(request)
        if not mensajes:
            logger.info("Webhook sin mensajes válidos")
            return {"status": "ok", "messages": 0}

        for msg in mensajes:
            if msg.es_propio or not msg.texto:
                continue

            logger.info(f"📥 Mensaje de {msg.telefono} ({msg.nombre}): {msg.texto[:120]}...")

            # ---------- LÓGICA ESPECIAL PARA ADMIN POR TELÉFONO ----------
            # Si es admin y parece actualización de catálogo, procesar directamente
            if es_admin_phone(msg.telefono) and detectar_actualizacion_catalogo_por_mensaje(msg.texto):
                try:
                    agregados = actualizar_catalogo_desde_texto_admin(msg.texto)
                    if agregados:
                        # Guardar en memoria también
                        historial = await obtener_historial(msg.telefono)
                        respuesta_admin = f"✅ ¡Catálogo actualizado con {len(agregados)} producto(s) nuevos! 📦\n\n"
                        for prod in agregados[:5]:
                            respuesta_admin += f"• {prod['modelo']}\n"
                        if len(agregados) > 5:
                            respuesta_admin += f"...y {len(agregados)-5} más\n"
                        respuesta_admin += f"\nYa están activos para clientes. Total nuevos hoy: {len(cargar_catalogo_json().get('productos_nuevos',[]))} 🆕\n¿Quieres agregar más?"

                        await guardar_mensaje(msg.telefono, "user", msg.texto)
                        await guardar_mensaje(msg.telefono, "assistant", respuesta_admin)
                        await proveedor.enviar_mensaje(msg.telefono, respuesta_admin)
                        logger.info(f"Catálogo actualizado por admin {msg.telefono}: {len(agregados)} productos")
                        continue  # No pasar a IA, ya respondimos
                    else:
                        # Si no se pudo parsear pero es admin intentando actualizar, dar instrucciones
                        respuesta_ayuda = (
                            "Parece que intentas actualizar el catálogo pero no pude extraer productos. 📝\n\n"
                            "Formato correcto desde tu teléfono:\n\n"
                            "*Productos Nuevos del Día:*\n"
                            "- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1\n"
                            "- Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.6kWh\n\n"
                            "Cada producto en una línea empezando con '-' y menciona precio. ¿Puedes reenviarlo así? ⚡"
                        )
                        await guardar_mensaje(msg.telefono, "user", msg.texto)
                        await guardar_mensaje(msg.telefono, "assistant", respuesta_ayuda)
                        await proveedor.enviar_mensaje(msg.telefono, respuesta_ayuda)
                        continue
                except Exception as e:
                    logger.error(f"Error actualización catálogo admin {msg.telefono}: {e}")

            # ---------- FLUJO NORMAL CLIENTE ----------
            historial = await obtener_historial(msg.telefono)
            respuesta = await generar_respuesta(
                mensaje=msg.texto,
                historial=historial,
                telefono=msg.telefono,
                nombre_contacto=msg.nombre
            )

            await guardar_mensaje(msg.telefono, "user", msg.texto)
            await guardar_mensaje(msg.telefono, "assistant", respuesta)

            enviado = await proveedor.enviar_mensaje(msg.telefono, respuesta)
            if enviado:
                logger.info(f"📤 Respuesta a {msg.telefono}: {respuesta[:100]}...")
            else:
                logger.error(f"❌ Fallo enviando a {msg.telefono}")

            # ---------- NOTIFICACIÓN ADMIN SI ES TICKET ----------
            # Si la respuesta contiene ticket, enviar copia a ADMIN_PHONE por WhatsApp
            if "TICKET DE PEDIDO - ENERGIXCU" in respuesta:
                try:
                    await notificar_admin_nuevo_pedido(respuesta, msg.telefono, msg.nombre)
                except Exception as e:
                    logger.error(f"Error notificando admin de pedido: {e}")

        return {"status": "ok", "processed": len(mensajes)}

    except Exception as e:
        logger.error(f"Error en webhook: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# ---------- CATÁLOGO Y PEDIDOS API ----------

@app.get("/catalog")
async def get_catalog():
    try:
        catalog_text = listar_catalogo_completo()
        catalog_json = cargar_catalogo_json()
        return {
            "catalog_text": catalog_text,
            "catalog_json": catalog_json,
            "total_base": len(catalog_json.get("productos", [])),
            "total_nuevos": len(catalog_json.get("productos_nuevos", []))
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/pedidos")
async def listar_pedidos():
    try:
        if not TICKETS_DIR.exists():
            return {"pedidos": []}
        archivos = sorted(TICKETS_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:30]
        pedidos = []
        for arch in archivos:
            try:
                with open(arch, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    pedidos.append(data)
            except:
                continue
        return {"pedidos": pedidos, "total": len(pedidos)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/admin/catalogo-nuevo")
async def admin_agregar_producto(request: Request):
    """Admin API: acepta JSON o form (para uso desde teléfono)."""
    try:
        # Intentar JSON primero
        texto = ""
        try:
            body = await request.json()
            texto = body.get("texto", "") or body.get("productos", "") or body.get("mensaje", "")
        except:
            # Intentar form
            try:
                form = await request.form()
                texto = form.get("texto", "") or form.get("productos", "")
            except Exception as e:
                logger.error(f"Error leyendo body admin: {e}")

        if not texto:
            return JSONResponse(status_code=400, content={"error": "Texto vacío. Envía {\"texto\": \"Productos Nuevos del Día:\\n- ...\"}"})

        agregados = actualizar_catalogo_desde_texto_admin(texto)

        return {
            "status": "ok",
            "agregados": len(agregados),
            "productos": agregados,
            "total_nuevos_hoy": len(cargar_catalogo_json().get("productos_nuevos", []))
        }
    except Exception as e:
        logger.error(f"Error admin catalogo: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------- TEST CHAT ----------
@app.post("/test-chat")
async def test_chat(request: Request):
    try:
        body = await request.json()
        telefono = body.get("telefono", "test-local")
        mensaje = body.get("mensaje", "")
        nombre = body.get("nombre", "Test")

        if not mensaje:
            return JSONResponse(status_code=400, content={"error": "Mensaje vacío"})

        # Si es admin intentando actualizar, procesar directo
        if es_admin_phone(telefono) and detectar_actualizacion_catalogo_por_mensaje(mensaje):
            agregados = actualizar_catalogo_desde_texto_admin(mensaje)
            if agregados:
                return {
                    "admin": True,
                    "accion": "catalogo_actualizado",
                    "agregados": len(agregados),
                    "productos": agregados
                }

        historial = await obtener_historial(telefono)
        respuesta = await generar_respuesta(mensaje, historial, telefono, nombre)

        await guardar_mensaje(telefono, "user", mensaje)
        await guardar_mensaje(telefono, "assistant", respuesta)

        return {
            "telefono": telefono,
            "mensaje_usuario": mensaje,
            "respuesta_jose": respuesta,
            "historial_len": len(historial)
        }
    except Exception as e:
        logger.error(f"Error test-chat: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------- PANEL ADMIN HTML PARA TELÉFONO ----------
@app.get("/admin", response_class=HTMLResponse)
async def admin_panel():
    """Panel admin optimizado para teléfono — actualizar catálogo sin PC."""
    try:
        catalog = cargar_catalogo_json()
        total_base = len(catalog.get("productos", []))
        total_nuevos = len(catalog.get("productos_nuevos", []))
        catalog_text = listar_catalogo_completo()

        # Listar pedidos recientes
        pedidos_html = "<p>No hay pedidos aún</p>"
        try:
            if TICKETS_DIR.exists():
                archivos = sorted(TICKETS_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:5]
                if archivos:
                    pedidos_html = ""
                    for arch in archivos:
                        try:
                            with open(arch, "r", encoding="utf-8") as f:
                                data = json.load(f)
                                pedidos_html += f"""
                                <div style="border:1px solid #ddd;padding:10px;margin:5px 0;border-radius:8px;background:#f9f9f9;">
                                    <b>Cliente:</b> {data.get('cliente')}<br>
                                    <b>Producto:</b> {data.get('producto')} x{data.get('cantidad')}<br>
                                    <b>Dirección:</b> {data.get('direccion')[:60]}...<br>
                                    <b>Pago:</b> {data.get('forma_pago')} | <b>Tel:</b> {data.get('telefono')}<br>
                                    <small>{data.get('fecha')}</small>
                                </div>
                                """
                        except:
                            continue
        except Exception as e:
            pedidos_html = f"<p>Error pedidos: {e}</p>"

        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EnergixCu Admin - Jose</title>
    <style>
        body {{ font-family: Arial; margin:0; padding:15px; background:#f5f5f5; }}
        .card {{ background:white; padding:15px; border-radius:12px; margin-bottom:15px; box-shadow:0 2px 5px rgba(0,0,0,0.1); }}
        h1 {{ color:#FF6B00; font-size:22px; }}
        h2 {{ font-size:18px; color:#333; }}
        textarea {{ width:100%; height:140px; padding:10px; border-radius:8px; border:1px solid #ccc; font-size:14px; }}
        button {{ background:#FF6B00; color:white; border:none; padding:12px 20px; border-radius:8px; font-size:16px; width:100%; margin-top:10px; }}
        button:active {{ background:#e55a00; }}
        .info {{ background:#e8f5e9; padding:10px; border-radius:8px; font-size:13px; }}
        pre {{ white-space: pre-wrap; font-size:12px; background:#f9f9f9; padding:10px; border-radius:8px; max-height:300px; overflow-y:auto; }}
        a {{ color:#FF6B00; text-decoration:none; }}
    </style>
</head>
<body>
    <h1>⚡ EnergixCu — Panel Admin (Teléfono)</h1>
    
    <div class="card">
        <h2>📊 Estado</h2>
        <b>Agente:</b> Jose<br>
        <b>Proveedor:</b> {proveedor_nombre}<br>
        <b>Catálogo base:</b> {total_base} productos<br>
        <b>Nuevos del día:</b> {total_nuevos} productos<br>
        <b>Admin Phone:</b> {os.getenv('ADMIN_PHONE','No configurado')}<br>
    </div>

    <div class="card">
        <h2>🆕 Actualizar Catálogo desde Teléfono</h2>
        <p style="font-size:13px;">Pega aquí tu lista de productos nuevos. Cada producto en una línea con "-".</p>
        <div class="info">
            <b>Formato ejemplo:</b><br>
            Productos Nuevos del Día:<br>
            - Panel Solar 600W Bifacial - $320 USD / 80000 CUP - Tier1 600W<br>
            - Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.6kWh<br>
            - Inversor Growatt 6000W - $900 USD - MPPT 100A WiFi
        </div>
        <form action="/admin/catalogo-nuevo" method="post" id="formCatalog">
            <textarea name="texto" id="texto" placeholder="Productos Nuevos del Día:
- Panel Solar 600W...
- Batería..."></textarea>
            <button type="submit">✅ Actualizar Catálogo</button>
        </form>
        <p style="font-size:12px; color:#666;">También puedes actualizar enviando un mensaje WhatsApp a tu número de bot con este mismo formato, si tu número es ADMIN_PHONE.</p>
    </div>

    <div class="card">
        <h2>📦 Catálogo Actual</h2>
        <pre>{catalog_text[:2000]}</pre>
        <a href="/catalog">Ver catálogo completo JSON</a>
    </div>

    <div class="card">
        <h2>🧾 Últimos 5 Pedidos</h2>
        {pedidos_html}
        <a href="/admin/pedidos">Ver todos los pedidos</a> | <a href="/pedidos">JSON pedidos</a>
    </div>

    <div class="card">
        <h2>📱 Guía Rápida Teléfono</h2>
        <p style="font-size:13px;">
            <b>1. Actualizar catálogo por WhatsApp:</b><br>
            Desde tu número admin, envía mensaje a tu bot:<br>
            <i>Productos Nuevos del Día: - Panel ... - Batería ...</i><br><br>
            <b>2. Ver pedidos:</b><br>
            Entra a <a href="/admin/pedidos">/admin/pedidos</a> desde tu teléfono<br><br>
            <b>3. Probar Jose:</b><br>
            Entra a <a href="/admin/test">/admin/test</a>
        </p>
    </div>

    <script>
        document.getElementById('formCatalog').addEventListener('submit', async function(e) {{
            e.preventDefault();
            const texto = document.getElementById('texto').value;
            if (!texto.trim()) {{ alert('Escribe productos'); return; }}
            const res = await fetch('/admin/catalogo-nuevo', {{
                method: 'POST',
                headers: {{'Content-Type': 'application/json'}},
                body: JSON.stringify({{texto: texto}})
            }});
            const data = await res.json();
            if (data.status === 'ok') {{
                alert('✅ Catálogo actualizado con ' + data.agregados + ' productos!');
                location.reload();
            }} else {{
                alert('Error: ' + JSON.stringify(data));
            }}
        }});
    </script>
</body>
</html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error admin panel: {e}</h1>", status_code=500)

@app.get("/admin/pedidos", response_class=HTMLResponse)
async def admin_pedidos_html():
    try:
        if not TICKETS_DIR.exists():
            return HTMLResponse("<h2>No hay pedidos</h2><a href='/admin'>Volver</a>")

        archivos = sorted(TICKETS_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:30]

        rows = ""
        for arch in archivos:
            try:
                with open(arch, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    rows += f"""
                    <tr>
                        <td>{data.get('fecha','')[:19]}</td>
                        <td><b>{data.get('cliente')}</b><br><small>{data.get('telefono')}</small></td>
                        <td>{data.get('producto')} x{data.get('cantidad')}</td>
                        <td>{data.get('direccion')}</td>
                        <td>{data.get('forma_pago')}</td>
                    </tr>
                    """
            except:
                continue

        html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pedidos - EnergixCu</title>
<style>
body {{ font-family:Arial; padding:10px; font-size:13px; }}
table {{ width:100%; border-collapse:collapse; }}
th, td {{ border:1px solid #ddd; padding:8px; text-align:left; }}
th {{ background:#FF6B00; color:white; }}
tr:nth-child(even) {{ background:#f9f9f9; }}
a {{ color:#FF6B00; }}
</style>
</head>
<body>
<h2>🧾 Pedidos EnergixCu — {len(archivos)} recientes</h2>
<a href="/admin">⬅ Volver Admin</a><br><br>
<table>
<tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Dirección</th><th>Pago</th></tr>
{rows if rows else "<tr><td colspan=5>No hay pedidos</td></tr>"}
</table>
</body>
</html>
        """
        return HTMLResponse(content=html)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error: {e}</h1>", status_code=500)

@app.get("/admin/test", response_class=HTMLResponse)
async def admin_test_html():
    html = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Probar Jose - EnergixCu</title>
<style>
body { font-family:Arial; padding:15px; background:#f5f5f5; }
.card { background:white; padding:15px; border-radius:12px; margin-bottom:15px; }
input, textarea { width:100%; padding:10px; border-radius:8px; border:1px solid #ccc; margin:5px 0; }
button { background:#25D366; color:white; border:none; padding:12px; border-radius:8px; width:100%; font-size:16px; }
#chat { height:300px; overflow-y:auto; border:1px solid #ddd; padding:10px; border-radius:8px; background:#fff; }
.user { text-align:right; color:#075E54; margin:5px; }
.assistant { text-align:left; color:#000; background:#e5ddd5; padding:8px; border-radius:8px; margin:5px; }
</style>
</head>
<body>
<h2>💬 Probar a Jose (sin WhatsApp)</h2>
<div id="chat"></div>
<div class="card">
<input id="telefono" placeholder="Tu teléfono (ej: +5350000000)" value="test-telefono">
<textarea id="mensaje" placeholder="Escribe como cliente: Hola, que paneles tienen?" rows="3"></textarea>
<button onclick="enviar()">Enviar a Jose</button>
</div>
<a href="/admin">⬅ Volver Admin</a>
<script>
async function enviar(){
    const telefono=document.getElementById('telefono').value;
    const mensaje=document.getElementById('mensaje').value;
    if(!mensaje.trim()){alert('Escribe mensaje');return;}
    const chat=document.getElementById('chat');
    chat.innerHTML+='<div class=user><b>Tú:</b> '+mensaje+'</div>';
    document.getElementById('mensaje').value='';
    const res=await fetch('/test-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({telefono:telefono,mensaje:mensaje,nombre:'Test Telefono'})});
    const data=await res.json();
    const resp=data.respuesta_jose || JSON.stringify(data);
    chat.innerHTML+='<div class=assistant><b>Jose:</b> '+resp.replace(/\\n/g,'<br>')+'</div>';
    chat.scrollTop=chat.scrollHeight;
}
</script>
</body>
</html>
    """
    return HTMLResponse(content=html)
