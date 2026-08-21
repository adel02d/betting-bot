# agent/catalog.py — Gestión del catálogo de EnergixCu
# Versión 2.1 — Optimizada para actualización por mensaje de WhatsApp desde teléfono

import os
import json
import re
import yaml
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

CATALOG_JSON_PATH = Path("./data/catalog.json")
BUSINESS_YAML_PATH = Path("./config/business.yaml")

def cargar_catalogo_json():
    try:
        if CATALOG_JSON_PATH.exists():
            with open(CATALOG_JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error cargando catalog.json: {e}")
    return {"productos": [], "productos_nuevos": [], "last_updated": str(datetime.now())}

def guardar_catalogo_json(data):
    try:
        CATALOG_JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
        data["last_updated"] = datetime.now().isoformat()
        with open(CATALOG_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error guardando catalog.json: {e}")
        return False

def cargar_business_yaml():
    try:
        if BUSINESS_YAML_PATH.exists():
            with open(BUSINESS_YAML_PATH, "r", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
    except Exception as e:
        print(f"Error cargando business.yaml: {e}")
    return {}

def listar_catalogo_completo(formato="texto"):
    business = cargar_business_yaml()
    catalog_json = cargar_catalogo_json()
    catalogo_base = business.get("catalogo_base", [])

    if formato == "texto":
        texto = "📦 *CATÁLOGO ENERGIXCU* - Actualizado hoy ⚡\n\n"
        for cat in catalogo_base:
            categoria = cat.get("categoria", "")
            texto += f"*{categoria}*:\n"
            for prod in cat.get("productos", [])[:6]:
                modelo = prod.get("modelo", "")
                precio_usd = prod.get("precio_usd", "?")
                precio_cup = prod.get("precio_cup", "?")
                texto += f"• {modelo} — *${precio_usd} USD / {precio_cup} CUP*\n"
            texto += "\n"

        nuevos = catalog_json.get("productos_nuevos", [])
        if nuevos:
            texto += "🆕 *PRODUCTOS NUEVOS DEL DÍA*:\n"
            for prod in nuevos[-15:]:
                precio_usd = prod.get('precio_usd')
                precio_str = f"${precio_usd} USD" if precio_usd else "Precio a consultar"
                if prod.get('precio_cup'):
                    precio_str += f" / {prod.get('precio_cup')} CUP"
                texto += f"• {prod.get('modelo')} — *{precio_str}*\n"
                if prod.get("descripcion") and len(prod.get("descripcion","")) < 100:
                    texto += f"  {prod.get('descripcion')}\n"
            texto += "\n"

        texto += f"_Total base: {len(catalog_json.get('productos',[]))} | Nuevos hoy: {len(nuevos)} | Actualizado: {catalog_json.get('last_updated','')[:10]}_"
        return texto

    return catalogo_base

def buscar_producto(query: str):
    query_lower = query.lower()
    business = cargar_business_yaml()
    resultados = []
    for cat in business.get("catalogo_base", []):
        for prod in cat.get("productos", []):
            modelo = prod.get("modelo", "").lower()
            if query_lower in modelo or any(query_lower in str(v).lower() for v in prod.values()):
                resultados.append(prod)
    catalog_json = cargar_catalogo_json()
    for prod in catalog_json.get("productos_nuevos", []):
        if query_lower in prod.get("modelo", "").lower():
            resultados.append(prod)
    return resultados

def extraer_precios_de_texto(texto: str):
    """
    Extrae precios USD y CUP de texto libre usando regex.
    Ej: "$320 USD / 80000 CUP", "$320", "80000 CUP", "400k CUP"
    """
    precio_usd = None
    precio_cup = None
    
    # Buscar $XXX USD
    usd_patterns = [
        r"\$\s*(\d+(?:[.,]\d+)?)\s*(?:USD|usd|\$)",
        r"(\d+(?:[.,]\d+)?)\s*USD",
        r"\$\s*(\d+(?:[.,]\d+)?)",
    ]
    for pat in usd_patterns:
        m = re.search(pat, texto)
        if m:
            try:
                val = m.group(1).replace(",", ".")
                precio_usd = float(val)
                break
            except:
                continue
    
    # Buscar CUP
    cup_patterns = [
        r"(\d+(?:[.,]?\d+)?)\s*CUP",
        r"(\d+)k?\s*CUP",
        r"/\s*(\d+)\s*CUP",
    ]
    for pat in cup_patterns:
        m = re.search(pat, texto, re.IGNORECASE)
        if m:
            try:
                val = m.group(1).replace(",", "").replace(".", "")
                # Manejar k
                if "k" in texto.lower() and "cup" in texto.lower():
                    # Buscar número con k
                    mk = re.search(r"(\d+(?:[.,]\d+)?)k\s*CUP", texto, re.IGNORECASE)
                    if mk:
                        precio_cup = float(mk.group(1)) * 1000
                        break
                precio_cup = float(val)
                break
            except:
                continue
    
    return precio_usd, precio_cup

def agregar_producto_nuevo(modelo: str, categoria: str = "Novedades", precio_usd: float = None, precio_cup: float = None, descripcion: str = "", stock: bool = True):
    """Agrega producto nuevo del día al catálogo dinámico - optimizado teléfono."""
    catalog = cargar_catalogo_json()

    # Intentar extraer precios si no vienen separados pero están en modelo
    if precio_usd is None and precio_cup is None:
        usd, cup = extraer_precios_de_texto(modelo + " " + descripcion)
        if usd:
            precio_usd = usd
        if cup:
            precio_cup = cup

    # Limpiar modelo: si contiene precio, intentar extraer solo nombre
    # Pero mantener modelo completo como nombre para simplicidad teléfono
    modelo_limpio = modelo.strip()
    # Si modelo es muy largo >120 chars, recortar descripción
    if len(modelo_limpio) > 120:
        # Intentar separar descripción
        if " - " in modelo_limpio:
            partes = modelo_limpio.split(" - ")
            if len(partes) >= 2:
                modelo_limpio = partes[0].strip()
                if not descripcion:
                    descripcion = " - ".join(partes[1:])[:200]

    nuevo = {
        "id": f"nuevo-{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
        "modelo": modelo_limpio[:150],
        "categoria": categoria,
        "precio_usd": precio_usd,
        "precio_cup": precio_cup,
        "descripcion": descripcion[:300] if descripcion else f"Agregado por admin desde teléfono el {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "stock": stock,
        "fecha_agregado": datetime.now().isoformat()
    }

    if "productos_nuevos" not in catalog:
        catalog["productos_nuevos"] = []

    catalog["productos_nuevos"].append(nuevo)
    guardar_catalogo_json(catalog)
    return nuevo

def parsear_productos_nuevos_del_mensaje(mensaje: str):
    """
    Parsea mensaje de admin enviado desde teléfono - muy robusto.
    Soporta:
    - Productos Nuevos del Día:
      - Panel 600W $320
    - Con viñetas -, •, *, números
    - Sin encabezado, solo lista
    - Una sola línea: Panel Solar 600W $320 USD
    """
    productos = []
    lineas = mensaje.split("\n")
    
    # Detectar si hay encabezado
    tiene_encabezado = any(k in mensaje.lower() for k in [
        "productos nuevos", "actualizacion", "actualización", "nuevo producto",
        "admin", "catalogo nuevo", "agregar"
    ])
    
    # Si no tiene guiones, pero es una sola línea con producto y precio, tratar como un producto
    if len(lineas) == 1 and ("$" in mensaje or "cup" in mensaje.lower()):
        # Una sola línea tipo "Panel Solar 600W $320"
        if any(p in mensaje.lower() for p in ["panel", "bateria", "batería", "inversor", "kit", "estacion", "controlador"]):
            productos.append({
                "modelo": mensaje.strip(),
                "raw": mensaje.strip()
            })
            return productos

    capturando = False
    if tiene_encabezado:
        capturando = True
    else:
        # Si no hay encabezado pero mensaje tiene guiones, capturar desde inicio si parece lista productos
        # Chequear si al menos una línea empieza con - y tiene $ o cup
        for linea in lineas:
            if linea.strip().startswith(("-", "•", "*")) and ("$" in linea or "cup" in linea.lower()):
                capturando = True
                break

    for i, linea in enumerate(lineas):
        original = linea.strip()
        if not original:
            continue
        
        lower = original.lower()
        
        # Saltar encabezados
        if any(k in lower for k in ["productos nuevos del dia", "productos nuevos del día", "actualizacion de catalogo", "actualización de catálogo", "admin:"]):
            capturando = True
            continue
        
        # Si estamos capturando
        if capturando:
            # Línea que empieza con -, •, *, número.
            if original.startswith(("-", "•", "*", "–", "—")) or re.match(r"^\d+[\.\)]\s*", original):
                texto = re.sub(r"^[-•*–—\d\.\)\s]+", "", original).strip()
                # Limpiar texto que sigue siendo válido
                if texto and len(texto) > 5:
                    productos.append({
                        "modelo": texto,
                        "raw": texto
                    })
            # También línea sin guión pero que parece producto (si ya estamos capturando y tiene $ o es larga)
            elif len(original) > 15 and ("$" in original or "cup" in lower) and any(p in lower for p in ["panel", "bateria", "batería", "inversor", "kit", "estacion", "controlador", "cable", "proteccion"]):
                productos.append({
                    "modelo": original,
                    "raw": original
                })
        else:
            # Si no estamos capturando pero línea parece producto individual
            if original.startswith("-") and len(original) > 10:
                texto = original.lstrip("- ").strip()
                if texto:
                    productos.append({"modelo": texto, "raw": texto})

    # Si aún no hay productos pero mensaje largo y parece lista sin guiones (copiado de notas)
    if not productos and len(mensaje) > 20:
        # Último intento: dividir por saltos y tomar líneas que parezcan productos
        for linea in lineas:
            l = linea.strip()
            if len(l) > 20 and any(p in l.lower() for p in ["panel", "bateria", "inversor", "kit"]) and ("$" in l or "cup" in l.lower()):
                productos.append({"modelo": l, "raw": l})

    return productos

def actualizar_catalogo_desde_texto_admin(texto_admin: str):
    """Proceso completo: recibe texto del admin desde teléfono y lo integra."""
    productos = parsear_productos_nuevos_del_mensaje(texto_admin)
    agregados = []

    for p in productos:
        modelo_raw = p["modelo"]
        # Extraer categoría heurística
        lower = modelo_raw.lower()
        categoria = "Novedades"
        if "panel" in lower:
            categoria = "Paneles Solares"
        elif "bateria" in lower or "batería" in lower:
            categoria = "Baterías"
        elif "inversor" in lower:
            categoria = "Inversores"
        elif "estacion" in lower or "estación" in lower or "ecoflow" in lower or "powerstation" in lower:
            categoria = "Estaciones"
        elif "kit" in lower:
            categoria = "Kits Solares"
        elif "controlador" in lower or "mppt" in lower or "cable" in lower or "proteccion" in lower:
            categoria = "Accesorios"
        
        # Extraer precios
        precio_usd, precio_cup = extraer_precios_de_texto(modelo_raw)

        nuevo = agregar_producto_nuevo(
            modelo=modelo_raw,
            categoria=categoria,
            precio_usd=precio_usd,
            precio_cup=precio_cup,
            descripcion=f"Agregado por admin desde teléfono el {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )
        agregados.append(nuevo)

    # Si no se pudo parsear pero texto largo, agregar como un producto genérico
    if not agregados and len(texto_admin.strip()) > 15:
        # Evitar agregar encabezados solos
        if "productos nuevos" not in texto_admin.lower() or len(texto_admin) > 30:
            # Si texto no es solo encabezado
            if len(texto_admin.strip().split("\n")) == 1:
                # Una sola línea
                if any(p in texto_admin.lower() for p in ["panel", "bateria", "inversor", "kit"]):
                    nuevo = agregar_producto_nuevo(
                        modelo=texto_admin[:120],
                        categoria="Novedades",
                        descripcion=texto_admin
                    )
                    agregados.append(nuevo)

    return agregados

def limpiar_productos_nuevos():
    """Limpia productos nuevos del día (útil fin de día)."""
    catalog = cargar_catalogo_json()
    count = len(catalog.get("productos_nuevos", []))
    catalog["productos_nuevos"] = []
    guardar_catalogo_json(catalog)
    return count

def eliminar_producto_nuevo_por_id(producto_id: str):
    """Elimina producto nuevo por ID."""
    catalog = cargar_catalogo_json()
    originales = catalog.get("productos_nuevos", [])
    nuevos = [p for p in originales if p.get("id") != producto_id]
    catalog["productos_nuevos"] = nuevos
    guardar_catalogo_json(catalog)
    return len(originales) - len(nuevos)

def obtener_info_zonas():
    business = cargar_business_yaml()
    return business.get("zonas_entrega", {})

def obtener_metodos_pago():
    business = cargar_business_yaml()
    pagos = business.get("metodos_pago", {})
    if isinstance(pagos, dict):
        return pagos.get("lista", [])
    return pagos if isinstance(pagos, list) else []
