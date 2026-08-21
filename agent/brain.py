# agent/brain.py — Cerebro del agente Jose de EnergixCu
# Versión 3.0 — 100% GRATIS SIN TARJETA: Soporta Groq (gratis), OpenRouter (gratis), Anthropic (pago)
# Basado en whatsapp-agent-kit de alanjmr21

import os
import yaml
import json
import logging
import re
from pathlib import Path
from dotenv import load_dotenv

from agent.tools import TOOL_DEFINITIONS, ejecutar_herramienta, TOOL_DEFINITIONS_OPENAI

load_dotenv()
logger = logging.getLogger("energixcu-agent")

# ---------- ADMIN DETECTION ----------
def normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    return phone.replace("whatsapp:", "").replace(" ", "").replace("-", "").replace("+", "")

def es_admin_phone(telefono: str) -> bool:
    admin_phones_raw = os.getenv("ADMIN_PHONE", "") + "," + os.getenv("ADMIN_IDS", "")
    if not admin_phones_raw.strip(", "):
        return True  # Si no hay admin configurado, permitir (para pruebas gratis)

    norm_tel = normalize_phone(telefono)
    for admin in admin_phones_raw.split(","):
        admin_norm = normalize_phone(admin.strip())
        if not admin_norm:
            continue
        if len(norm_tel) >= 8 and len(admin_norm) >= 8:
            if norm_tel[-8:] == admin_norm[-8:]:
                return True
        if norm_tel == admin_norm:
            return True
    return False

def detectar_intento_actualizacion_catalogo(mensaje: str) -> bool:
    lower = mensaje.lower()
    keywords = [
        "productos nuevos del dia", "productos nuevos del día", "productos nuevos",
        "actualizacion de catalogo", "actualización de catálogo", "actualiza catalogo", "actualiza catálogo",
        "nuevo producto", "agregar producto", "nueva bateria", "nuevo panel", "nuevo inversor",
        "actualizar precio", "precio nuevo", "admin:", "admin catalogo", "catalogo nuevo", "nuevo catalogo", "agregar al catalogo"
    ]
    for kw in keywords:
        if kw in lower:
            return True
    lineas = mensaje.split("\n")
    count = sum(1 for linea in lineas if linea.strip().startswith(("-", "•", "*", "–", "—")) and ("$" in linea.lower() or "cup" in linea.lower()))
    if count >= 1:
        return True
    if len(lineas) == 1 and "$" in mensaje and any(p in lower for p in ["panel", "bateria", "batería", "inversor", "kit"]):
        return True
    return False

# ---------- PROMPT ----------
def cargar_config_prompts() -> dict:
    try:
        with open("config/prompts.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/prompts.yaml no encontrado")
        return {}

def cargar_system_prompt() -> str:
    config = cargar_config_prompts()
    base_prompt = config.get("system_prompt", "Eres Jose de EnergixCu. Responde en español.")

    knowledge_text = ""
    knowledge_dir = Path("./knowledge")
    if knowledge_dir.exists():
        for file in knowledge_dir.glob("*.md"):
            try:
                with open(file, "r", encoding="utf-8") as f:
                    content = f.read()
                    if len(content) > 5000:
                        content = content[:5000] + "\n...[recortado]"
                    knowledge_text += f"\n\n--- Conocimiento de {file.name} ---\n{content}"
            except Exception as e:
                logger.warning(f"No se pudo leer {file}: {e}")

    catalog_json_path = Path("./data/catalog.json")
    nuevos_text = ""
    if catalog_json_path.exists():
        try:
            with open(catalog_json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                nuevos = data.get("productos_nuevos", [])
                if nuevos:
                    nuevos_text = "\n\n🆕 PRODUCTOS NUEVOS DEL DÍA (actualizados hoy, ofrecer activamente):\n"
                    for prod in nuevos[-30:]:
                        nuevos_text += f"- {prod.get('modelo')} | ${prod.get('precio_usd')} USD / {prod.get('precio_cup')} CUP | {prod.get('descripcion','')}\n"
        except Exception as e:
            logger.warning(f"Error leyendo catalog.json: {e}")

    full_prompt = base_prompt + knowledge_text + nuevos_text
    full_prompt += """
## INSTRUCCIONES DE HERRAMIENTAS (100% gratis):
- Si cliente pregunta productos disponibles, usa listar_catalogo
- Si pregunta modelo específico, busca en catálogo interno con buscar_producto_catalogo
- Si no está en catálogo o pide ficha técnica/imagen real, usa buscar_producto_en_web y buscar_imagen_producto
- Si admin envía lista productos nuevos con viñetas, usa agregar_producto_nuevo o actualizar_catalogo_desde_texto
- Cuando cliente da los 5 datos de compra, OBLIGATORIO usar generar_ticket_pedido
- Si cliente dice qué quiere alimentar, usa calcular_kit_solar
- Nunca inventes precios; busca en catálogo o web
"""
    return full_prompt

def obtener_mensaje_error() -> str:
    config = cargar_config_prompts()
    return config.get("error_message", "Lo siento, problemas técnicos. Intenta de nuevo. 🔧")

def obtener_mensaje_fallback() -> str:
    config = cargar_config_prompts()
    return config.get("fallback_message", "Disculpa, no entendí. ¿Buscas paneles, baterías o kit? ⚡")

def get_llm_provider():
    """Detecta qué proveedor LLM usar, priorizando gratis sin tarjeta que funcione en Cuba con VPN una vez."""
    explicit = os.getenv("LLM_PROVIDER", "").lower().strip()
    if explicit in ["groq", "openrouter", "anthropic", "free", "ollama", "huggingface", "hf"]:
        return explicit
    
    # Auto-detectar por keys disponibles, priorizando gratis y humano (Gemma)
    if os.getenv("GROQ_API_KEY"):
        return "groq"
    if os.getenv("OLLAMA_API_URL") or os.getenv("OLLAMA_MODEL"):
        return "ollama"
    if os.getenv("HF_API_KEY") or os.getenv("HUGGINGFACE_API_KEY"):
        return "huggingface"
    if os.getenv("OPENROUTER_API_KEY"):
        return "openrouter"
    if os.getenv("ANTHROPIC_API_KEY") and "sk-ant-..." not in os.getenv("ANTHROPIC_API_KEY"):
        return "anthropic"
    
    # Si no hay ninguna key, modo free sin IA (solo catálogo) - 100% gratis sin API, funciona en Cuba
    return "free"

# ---------- ANTHROPIC ----------
async def generar_respuesta_anthropic(mensaje: str, historial: list[dict], system_prompt: str) -> str:
    from anthropic import AsyncAnthropic
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY no configurada")
    
    client = AsyncAnthropic(api_key=api_key)
    
    mensajes = []
    for msg in historial[-20:]:
        mensajes.append({"role": msg["role"], "content": msg["content"][:2000]})
    mensajes.append({"role": "user", "content": mensaje})

    response = await client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        system=system_prompt,
        messages=mensajes,
        tools=TOOL_DEFINITIONS
    )

    iteraciones = 0
    while iteraciones < 5:
        iteraciones += 1
        tool_uses = []
        texto_respuesta = ""
        for block in response.content:
            if block.type == "text":
                texto_respuesta += block.text
            elif block.type == "tool_use":
                tool_uses.append(block)

        if not tool_uses:
            return texto_respuesta if texto_respuesta.strip() else obtener_mensaje_fallback()

        mensajes.append({"role": "assistant", "content": response.content})
        tool_results = []
        for tool_use in tool_uses:
            try:
                resultado = await ejecutar_herramienta(tool_use.name, tool_use.input)
            except Exception as e:
                resultado = f"Error ejecutando {tool_use.name}: {e}"
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_use.id,
                "content": str(resultado)[:5000]
            })
        mensajes.append({"role": "user", "content": tool_results})
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            system=system_prompt,
            messages=mensajes,
            tools=TOOL_DEFINITIONS
        )

    return obtener_mensaje_fallback()

# ---------- GROQ (100% GRATIS SIN TARJETA) CON GEMMA - HUMANO ----------
async def generar_respuesta_groq(mensaje: str, historial: list[dict], system_prompt: str) -> str:
    """Usa Groq gratis sin tarjeta con Gemma - https://console.groq.com/keys - Modelo Gemma 2 9B para hablar como persona"""
    try:
        from groq import AsyncGroq
    except ImportError:
        logger.error("groq no instalado, instala con pip install groq")
        raise

    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or "gsk_" not in api_key:
        raise ValueError("GROQ_API_KEY no configurada. Ve a https://console.groq.com/keys es gratis sin tarjeta")

    client = AsyncGroq(api_key=api_key)

    # Groq usa formato OpenAI para tools - Prompt mejorado para humano
    system_humano = system_prompt + """
    
    IMPORTANTE PARA SONAR HUMANO (cliente debe creer que habla con persona real, no bot mecánico):
    - Usa lenguaje natural, contracciones, expresiones cubanas suaves sin exagerar
    - Varía tus respuestas, no repitas siempre misma plantilla
    - Haz preguntas naturales, muestra empatía, ej: 'Entiendo, con los apagones está dura la cosa...'
    - Usa 1-2 emojis max, no exageres, como persona real: ⚡ ☀️ a veces
    - Si cliente dice algo personal (ej: 'tengo bebé', 'vivo con mi mamá mayor'), responde empático
    - No digas 'como IA' ni 'como modelo', di 'soy Jose de EnergixCu'
    - Mantén respuestas cortas 2-3 párrafos pero con calor humano
    - Si no sabes algo, di 'déjame verificarte eso con el equipo' no 'no tengo esa información'
    """

    mensajes = [{"role": "system", "content": system_humano}]
    for msg in historial[-20:]:
        role = msg["role"]
        if role not in ["user", "assistant"]:
            role = "user"
        mensajes.append({"role": role, "content": msg["content"][:2000]})
    mensajes.append({"role": "user", "content": mensaje})

    # Modelo Gemma 2 9B - Google Gemma, más humano y natural, como pediste - 100% gratis en Groq
    model = os.getenv("GROQ_MODEL", "gemma2-9b-it")  # Gemma 2 9B Instruct de Google - humano, natural

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=mensajes,
            tools=TOOL_DEFINITIONS_OPENAI,
            tool_choice="auto",
            max_tokens=1500,
            temperature=0.7
        )
    except Exception as e:
        # Si modelo no existe, probar fallback
        logger.warning(f"Error Groq con modelo {model}: {e}, probando llama-3.1-8b-instant")
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=mensajes,
            tools=TOOL_DEFINITIONS_OPENAI,
            tool_choice="auto",
            max_tokens=1500,
            temperature=0.7
        )

    iteraciones = 0
    while iteraciones < 5:
        iteraciones += 1
        choice = response.choices[0]
        message = choice.message

        # Si no hay tool calls, retornar contenido
        if not message.tool_calls:
            return message.content or obtener_mensaje_fallback()

        # Hay tool calls
        mensajes.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                } for tc in message.tool_calls
            ]
        })

        for tool_call in message.tool_calls:
            nombre = tool_call.function.name
            try:
                args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
            except:
                args = {}

            try:
                resultado = await ejecutar_herramienta(nombre, args)
            except Exception as e:
                resultado = f"Error ejecutando {nombre}: {e}"

            mensajes.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(resultado)[:5000]
            })

        response = await client.chat.completions.create(
            model=model,
            messages=mensajes,
            tools=TOOL_DEFINITIONS_OPENAI,
            tool_choice="auto",
            max_tokens=1500,
            temperature=0.7
        )

    return obtener_mensaje_fallback()

# ---------- OPENROUTER (100% GRATIS SIN TARJETA) ----------
async def generar_respuesta_openrouter(mensaje: str, historial: list[dict], system_prompt: str) -> str:
    """Usa OpenRouter gratis - https://openrouter.ai/keys - modelos con :free"""
    try:
        from openai import AsyncOpenAI
    except ImportError:
        raise

    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY no configurada")

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1"
    )

    mensajes = [{"role": "system", "content": system_prompt}]
    for msg in historial[-20:]:
        role = msg["role"]
        if role not in ["user", "assistant"]:
            role = "user"
        mensajes.append({"role": role, "content": msg["content"][:2000]})
    mensajes.append({"role": "user", "content": mensaje})

    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct:free")

    response = await client.chat.completions.create(
        model=model,
        messages=mensajes,
        tools=TOOL_DEFINITIONS_OPENAI,
        tool_choice="auto",
        max_tokens=1500
    )

    iteraciones = 0
    while iteraciones < 5:
        iteraciones += 1
        choice = response.choices[0]
        message = choice.message

        if not message.tool_calls:
            return message.content or obtener_mensaje_fallback()

        mensajes.append({
            "role": "assistant",
            "content": message.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments
                    }
                } for tc in message.tool_calls
            ]
        })

        for tool_call in message.tool_calls:
            try:
                args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
            except:
                args = {}
            try:
                resultado = await ejecutar_herramienta(tool_call.function.name, args)
            except Exception as e:
                resultado = f"Error {e}"
            mensajes.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(resultado)[:5000]
            })

        response = await client.chat.completions.create(
            model=model,
            messages=mensajes,
            tools=TOOL_DEFINITIONS_OPENAI,
            tool_choice="auto",
            max_tokens=1500
        )

    return obtener_mensaje_fallback()

# ---------- OLLAMA LOCAL (100% GRATIS OFFLINE, GEMMA LOCAL) ----------
async def generar_respuesta_ollama(mensaje: str, historial: list[dict], system_prompt: str) -> str:
    """Usa Ollama local con Gemma 2 2B/9B - 100% gratis offline, sin tarjeta, sin internet, funciona en Cuba"""
    import httpx

    ollama_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "gemma2:2b")  # gemma2:2b, gemma2:9b, llama3.1:8b

    # Construir mensajes formato Ollama/OpenAI
    mensajes = [{"role": "system", "content": system_prompt}]
    for msg in historial[-15:]:
        role = msg["role"]
        if role not in ["user", "assistant"]:
            role = "user"
        mensajes.append({"role": role, "content": msg["content"][:1500]})
    mensajes.append({"role": "user", "content": mensaje})

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            # Llamada a Ollama /api/chat
            r = await client.post(
                f"{ollama_url}/api/chat",
                json={
                    "model": model,
                    "messages": mensajes,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 800
                    }
                }
            )
            if r.status_code != 200:
                logger.error(f"Error Ollama {r.status_code}: {r.text[:500]}")
                raise Exception(f"Ollama error {r.status_code}")

            data = r.json()
            content = data.get("message", {}).get("content", "") or data.get("response", "")
            if not content:
                return obtener_mensaje_fallback()

            # Intentar detectar tool calls en texto (Ollama no soporta tools nativo bien, usamos prompt)
            # Si el contenido parece querer usar herramienta, ejecutar
            lower = content.lower()
            if "listar_catalogo" in lower or "catálogo" in lower or "catalogo" in lower:
                from agent.catalog import listar_catalogo_completo
                try:
                    cat = listar_catalogo_completo()
                    return f"{content}\n\n{cat[:1000]}"
                except:
                    pass

            return content

    except Exception as e:
        logger.error(f"Error Ollama local {model}: {e}")
        # Fallback a free
        return generar_respuesta_free(mensaje)

# ---------- HUGGINGFACE INFERENCE (100% GRATIS SIN TARJETA, GEMMA) ----------
async def generar_respuesta_huggingface(mensaje: str, historial: list[dict], system_prompt: str) -> str:
    """Usa Hugging Face Inference API gratis con Gemma 2 2B - https://huggingface.co/settings/tokens"""
    import httpx

    api_key = os.getenv("HF_API_KEY") or os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN")
    if not api_key:
        raise ValueError("HF_API_KEY no configurada. Ve a https://huggingface.co/settings/tokens es gratis sin tarjeta")

    model = os.getenv("HF_MODEL", "google/gemma-2-2b-it")  # Gemma 2 2B Instruct - humano, gratis

    # Hugging Face Inference API
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Construir prompt completo
    prompt = f"{system_prompt}\n\nHistorial:\n"
    for msg in historial[-10:]:
        role = "Usuario" if msg["role"] == "user" else "Asistente"
        prompt += f"{role}: {msg['content'][:500]}\n"
    prompt += f"Usuario: {mensaje}\nAsistente:"

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(
                url,
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 500,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "return_full_text": False
                    }
                }
            )
            if r.status_code != 200:
                logger.error(f"Error HF {r.status_code}: {r.text[:500]}")
                # Si modelo no cargado, intentar con modelo más pequeño
                if r.status_code == 503:
                    return f"⏳ El modelo {model} se está cargando, intenta en 20 segundos. Mientras, aquí tienes catálogo:\n\n{__import__('agent.catalog', fromlist=['listar_catalogo_completo']).listar_catalogo_completo()[:1000]}"
                raise Exception(f"HF error {r.status_code}")

            data = r.json()
            if isinstance(data, list) and len(data) > 0:
                content = data[0].get("generated_text", "")
            elif isinstance(data, dict):
                content = data.get("generated_text", "") or data.get("content", "")
            else:
                content = str(data)

            # Limpiar prompt si lo repite
            if prompt in content:
                content = content.replace(prompt, "").strip()

            return content[:1500] or obtener_mensaje_fallback()

    except Exception as e:
        logger.error(f"Error HuggingFace {model}: {e}")
        return generar_respuesta_free(mensaje)

# ---------- FREE (SIN IA, SOLO CATALOGO) - 100% GRATIS SIN API, FUNCIONA EN CUBA ----------
def intentar_extraer_datos_ticket(texto: str):
    """Intenta extraer los 5 datos del ticket desde texto libre (modo gratis sin IA)."""
    import re
    datos = {
        "nombre_cliente": "",
        "producto_modelo": "",
        "cantidad": 0,
        "direccion": "",
        "forma_pago": ""
    }

    # Normalizar texto
    texto_lower = texto.lower()

    # Buscar con etiquetas explícitas
    patrones = {
        "nombre_cliente": [r"(?i)nombre\s*(?:completo)?\s*[:\-]\s*(.+)", r"(?i)cliente\s*[:\-]\s*(.+)"],
        "producto_modelo": [r"(?i)producto\s*(?:y modelo)?\s*[:\-]\s*(.+)", r"(?i)modelo\s*[:\-]\s*(.+)"],
        "cantidad": [r"(?i)cantidad\s*[:\-]\s*(\d+)", r"(?i)unidades?\s*[:\-]?\s*(\d+)", r"(\d+)\s*(?:unidades?|paneles?|baterias?|kits?)"],
        "direccion": [r"(?i)direcci[oó]n\s*[:\-]\s*(.+)", r"(?i)direccion\s*exacta\s*[:\-]\s*(.+)", r"(?i)entrega\s*[:\-]\s*(.+)"],
        "forma_pago": [r"(?i)forma\s*de\s*pago\s*[:\-]\s*(efectivo|transferencia)", r"(?i)pago\s*[:\-]\s*(efectivo|transferencia)", r"\b(efectivo|transferencia)\b"]
    }

    for campo, lista_patrones in patrones.items():
        for pat in lista_patrones:
            m = re.search(pat, texto, re.MULTILINE | re.IGNORECASE)
            if m:
                valor = m.group(1).strip()
                # Limitar longitud y limpiar
                if campo == "cantidad":
                    try:
                        datos[campo] = int(re.findall(r'\d+', valor)[0])
                    except:
                        datos[campo] = 0
                    # También buscar número en texto si patrón cantidad falló
                    if datos[campo] == 0:
                        nums = re.findall(r'\b(\d+)\b', texto)
                        if nums:
                            # Tomar primer número pequeño como cantidad si <20
                            for n in nums:
                                if int(n) < 20 and int(n) > 0:
                                    datos[campo] = int(n)
                                    break
                elif campo == "forma_pago":
                    lower_val = valor.lower()
                    if "efectivo" in lower_val:
                        datos[campo] = "Efectivo"
                    elif "transfer" in lower_val:
                        datos[campo] = "Transferencia"
                    else:
                        # Buscar en texto completo
                        if "efectivo" in texto_lower:
                            datos[campo] = "Efectivo"
                        elif "transfer" in texto_lower:
                            datos[campo] = "Transferencia"
                else:
                    # Limpiar valor: tomar hasta salto de línea o 150 chars
                    valor_limpio = valor.split("\n")[0][:150].strip()
                    # Si valor parece contener siguiente campo (ej: "Juan Producto: Panel"), cortar
                    if "producto" in valor_limpio.lower() and campo == "nombre_cliente":
                        valor_limpio = valor_limpio.split("Producto")[0].strip()
                    datos[campo] = valor_limpio
                break

    # Heurística adicional si no se encontró con etiquetas pero texto parece estructurado con comas o saltos
    # Si texto tiene al menos 3 líneas que parecen datos
    if not datos["nombre_cliente"] or not datos["direccion"]:
        lineas = [l.strip() for l in texto.split("\n") if l.strip()]
        # Si hay 4-6 líneas, intentar asignar por orden: nombre, producto, cantidad, direccion, pago
        if len(lineas) >= 4:
            # Primera línea sin etiqueta que tiene 2 palabras capitalizadas podría ser nombre
            if not datos["nombre_cliente"]:
                for linea in lineas[:2]:
                    if len(linea.split()) >= 2 and len(linea) < 50 and not any(k in linea.lower() for k in ["panel", "bateria", "calle", "efectivo", "transfer"]):
                        # Verificar que no sea dirección (si contiene calle, avenida, etc, no es nombre)
                        if not any(x in linea.lower() for x in ["calle", "avenida", "municipio", "reparto"]):
                            datos["nombre_cliente"] = linea[:60]
                            break

            # Buscar producto por palabras clave
            if not datos["producto_modelo"]:
                for linea in lineas:
                    lower_l = linea.lower()
                    if any(p in lower_l for p in ["panel", "bateria", "batería", "inversor", "kit", "estacion", "mppt", "cable"]):
                        # Si es línea larga pero contiene cantidad, separar
                        datos["producto_modelo"] = linea[:120]
                        break

            # Dirección: buscar línea con calle, municipio, reparto, etc
            if not datos["direccion"]:
                for linea in lineas:
                    lower_l = linea.lower()
                    if any(x in lower_l for x in ["calle", "avenida", "municipio", "reparto", "referencia", "#", "vedado", "habana", "boyeros", "marianao"]):
                        datos["direccion"] = linea[:150]
                        break

    # Si aún falta dirección pero texto es largo y tiene comas, tomar parte larga como dirección
    if not datos["direccion"] and len(texto) > 30:
        # Tomar la línea más larga que no sea nombre ni producto
        candidatas = [l for l in texto.split("\n") if len(l) > 20]
        if candidatas:
            # La más larga probablemente es dirección
            mas_larga = max(candidatas, key=len)
            if len(mas_larga) > 20 and not any(k in mas_larga.lower() for k in ["efectivo", "transferencia"]):
                # Si no es ya usada como nombre o producto
                if mas_larga != datos.get("nombre_cliente") and mas_larga != datos.get("producto_modelo"):
                    datos["direccion"] = mas_larga[:150]

    return datos

def generar_respuesta_free(mensaje: str, telefono: str = "") -> str:
    """Modo 100% gratis sin IA, solo con catálogo y reglas - FUNCIONA EN CUBA SIN API"""
    lower = mensaje.lower()
    from agent.catalog import listar_catalogo_completo, buscar_producto
    from agent.tools import tool_generar_ticket_pedido, tool_calcular_kit_solar

    # 1. Saludo
    if any(k in lower for k in ["hola", "buenos dias", "buenas tardes", "buenas noches", "hey", "q tal", "ola"]):
        if len(lower.strip()) < 20:  # Solo saludo corto
            return (
                "¡Hola! 👋 Soy *Jose* de *EnergixCu* ⚡ ¡Qué bueno que nos escribes!\n\n"
                "¿En qué puedo ayudarte hoy? Tengo:\n"
                "• Paneles solares 100W-550W\n"
                "• Baterías LiFePO4 12/24/48V\n"
                "• Inversores híbridos 3000W-5000W\n"
                "• Kits completos 1kW-5kW\n\n"
                "Escríbeme qué necesitas: ej 'panel 550W', 'batería para nevera', 'kit para casa completa' ☀️"
            )

    # 2. Despedida / gracias
    if any(k in lower for k in ["gracias", "thank you"]):
        return "¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que te pueda asesorar de energía solar? ☀️🔋"

    # 3. Pedido / Compra - Intentar extraer ticket si parece que trae datos
    # Si mensaje contiene pistas de ticket (forma de pago + dirección + producto o cantidad)
    if any(k in lower for k in ["efectivo", "transferencia", "transfermovil", "enzona"]) and len(mensaje) > 30:
        datos = intentar_extraer_datos_ticket(mensaje)
        # Verificar si tenemos al menos 3 datos
        completos = sum(1 for v in [datos["nombre_cliente"], datos["producto_modelo"], datos["direccion"], datos["forma_pago"]] if v) + (1 if datos["cantidad"] > 0 else 0)
        if completos >= 4 and datos["forma_pago"] and datos["direccion"]:
            # Intentar generar ticket
            # Si falta cantidad, asumir 1
            if datos["cantidad"] == 0:
                datos["cantidad"] = 1
            if not datos["nombre_cliente"]:
                datos["nombre_cliente"] = "Cliente WhatsApp"
            if not datos["producto_modelo"]:
                # Intentar buscar producto en mensaje
                for kw in ["panel", "bateria", "kit", "inversor"]:
                    if kw in lower:
                        datos["producto_modelo"] = f"Producto con {kw} (revisar)"
                        break
                if not datos["producto_modelo"]:
                    datos["producto_modelo"] = "Producto a confirmar"

            # Generar ticket
            try:
                ticket = tool_generar_ticket_pedido(
                    nombre_cliente=datos["nombre_cliente"],
                    producto_modelo=datos["producto_modelo"],
                    cantidad=datos["cantidad"],
                    direccion=datos["direccion"],
                    forma_pago=datos["forma_pago"],
                    telefono_cliente=telefono
                )
                return ticket
            except Exception as e:
                # Si falla, pedir datos faltantes
                pass

    # 4. Si dice que quiere comprar / me interesa / precio + producto
    if any(k in lower for k in ["quiero comprar", "quiero", "me interesa", "necesito comprar", "cuanto cuesta", "cuánto cuesta", "precio de", "comprar", "pedido"]):
        # Pero si no trae datos de ticket, pedir los 5 datos
        if "efectivo" not in lower and "transferencia" not in lower and "calle" not in lower and "avenida" not in lower:
            # Buscar qué producto le interesa
            producto_interes = ""
            for kw in ["panel 550", "panel 350", "panel 200", "panel 100", "bateria 12v", "bateria 24v", "bateria 48v", "inversor 3000", "inversor 5000", "kit 1kw", "kit 3kw", "kit 5kw", "kit"]:
                if kw in lower:
                    producto_interes = kw
                    break
            
            # Si menciona panel/bateria/kit genérico
            if not producto_interes and any(p in lower for p in ["panel", "bateria", "batería", "inversor", "kit"]):
                producto_interes = "el producto que mencionas"

            base = f"¡Perfecto! Veo que te interesa {producto_interes}. 😊\n\n" if producto_interes else "¡Perfecto! 😊\n\n"

            return (
                base +
                "Para generarte el ticket oficial y coordinar entrega, necesito en *UN SOLO MENSAJE* los 5 datos obligatorios:\n\n"
                "1️⃣ Nombre completo\n"
                "2️⃣ Producto y modelo exacto (ej: Panel Solar 550W Tier1)\n"
                "3️⃣ Cantidad\n"
                "4️⃣ Dirección exacta (Municipio, reparto y punto referencia)\n"
                "5️⃣ Forma de pago: *Efectivo* o *Transferencia*\n\n"
                "Ejemplo listo para copiar y llenar:\n"
                "Nombre: Juan Pérez\n"
                "Producto: Panel Solar 550W Tier1\n"
                "Cantidad: 2\n"
                "Dirección: Calle 23 #456 Vedado Plaza, La Habana, ref frente al parque\n"
                "Forma de pago: Efectivo\n\n"
                "Envíame esos 5 datos y te genero el ticket al instante ⚡📦"
            )

    # 5. Calcular kit si menciona equipos
    if any(k in lower for k in ["nevera", "refrigerador", "ventilador", "luces", "tv", "televisor", "aire acondicionado", "bomba", "laptop", "cuanto necesito", "que kit", "kit para"]):
        # Extraer equipos
        try:
            equipos = mensaje
            # Limpiar un poco
            resultado = tool_calcular_kit_solar(equipos=equipos)
            return resultado
        except Exception as e:
            pass

    # 6. Catálogo / precios
    if any(k in lower for k in ["catalogo", "catálogo", "lista de precios", "que tienen", "que venden", "disponible", "productos", "precio panel", "precio bateria", "precio kit", "precios"]):
        try:
            cat = listar_catalogo_completo()
            return f"{cat[:1800]}\n\n¿Te interesa alguno en particular? Puedo darte ficha técnica o calcular kit según lo que quieres alimentar. ¿Qué necesitas alimentar en tu casa? ⚡"
        except Exception as e:
            return "Tenemos paneles 100W-550W, baterías 12V-48V LiFePO4, inversores 1000W-5000W y kits 1kW-5kW. ¿Qué te interesa? ☀️"

    # 7. Búsqueda producto específico
    if "panel" in lower or "bateria" in lower or "batería" in lower or "inversor" in lower or "kit" in lower:
        # Buscar en catálogo
        try:
            # Extraer query: quitar palabras comunes
            query = lower
            # Buscar
            for kw in ["panel 550", "panel 350", "panel 200", "panel 100", "bateria 12v", "bateria 24v", "bateria 48v", "inversor 3000", "inversor 5000", "kit 3kw", "kit 5kw", "kit 1kw"]:
                if kw in lower:
                    query = kw
                    break
            
            res = buscar_producto(query)
            if res:
                texto = f"Encontré {len(res)} producto(s) para '{query}':\n\n"
                for prod in res[:4]:
                    modelo = prod.get("modelo", "")
                    usd = prod.get("precio_usd", "?")
                    cup = prod.get("precio_cup", "?")
                    texto += f"• *{modelo}* — ${usd} USD / {cup} CUP\n"
                    if prod.get("caracteristicas"):
                        for car in prod.get("caracteristicas", [])[:2]:
                            texto += f"  - {car}\n"
                    texto += "\n"
                texto += "¿Quieres que te calcule si te alcanza para tu casa o te genero ticket de alguno? ☀️"
                return texto
        except Exception as e:
            pass

    # 8. Métodos de pago / envío
    if any(k in lower for k in ["forma de pago", "como pago", "pago", "transfermovil", "enzona", "efectivo", "transferencia", "mlc", "cup"]):
        return (
            "💳 *Formas de pago (Cuba):*\n\n"
            "1️⃣ *EFECTIVO* — Pagas al momento de la entrega / contra entrega\n"
            "2️⃣ *TRANSFERENCIA* — Transfermóvil, EnZona o tarjeta MLC/CUP según coordinemos\n\n"
            "No trabajamos con otros medios. ¿Cuál prefieres? Y dime qué producto te interesa para generarte ticket 📦⚡"
        )

    if any(k in lower for k in ["envio", "entrega", "habana", "provincia", "llevan a", "domicilio"]):
        return (
            "📦 *Entregas EnergixCu:*\n\n"
            "• La Habana (todos los municipios): 24-48h\n"
            "• Provincias: Artemisa, Mayabeque, Matanzas, Cienfuegos, Villa Clara, Sancti Spíritus, Ciego de Ávila, Camagüey, Las Tunas, Granma, Holguín, Santiago de Cuba, Guantánamo: 2-5 días laborables\n"
            "• Costo envío varía según distancia y peso\n\n"
            "¿En qué municipio estás para calcularte entrega? Y ¿qué producto te interesa? ☀️"
        )

    # 9. Fallback por defecto - bienvenida ampliada
    return (
        "¡Hola! 👋 Soy *Jose* de *EnergixCu* ⚡\n\n"
        "Soy tu asesor de energía solar, trabajo 100% gratis sin necesidad de internet extra.\n\n"
        "Puedo ayudarte con:\n"
        "📦 Ver catálogo: escribe *'catalogo'* o *'precio panel 550'*\n"
        "🔋 Calcular kit: dime qué tienes en casa, ej *'nevera, 2 ventiladores y 5 luces'*\n"
        "💡 Ficha técnica: pregunta *'ficha panel 550W'* o *'foto batería 48V'*\n"
        "🛒 Comprar: dime *'quiero comprar panel 550W'* y te pediré 5 datos para ticket\n\n"
        "¿Qué necesitas hoy? ☀️"
    )

# ---------- FUNCIÓN PRINCIPAL ----------
async def generar_respuesta(mensaje: str, historial: list[dict], telefono: str = "", nombre_contacto: str = "") -> str:
    if not mensaje or len(mensaje.strip()) < 1:
        return obtener_mensaje_fallback()

    mensaje_lower = mensaje.lower()

    # Humano
    if any(k in mensaje_lower for k in ["hablar con humano", "hablar con persona", "quiero humano", "operador", "agente humano", "hablar con alguien"]):
        return "Con gusto te transfiero con uno de nuestros especialistas humanos de EnergixCu para que te atienda directamente. Un momento, por favor. 👨‍💻"

    # Admin catálogo directo (sin IA, rápido desde teléfono)
    if es_admin_phone(telefono) and detectar_intento_actualizacion_catalogo(mensaje):
        from agent.catalog import actualizar_catalogo_desde_texto_admin, cargar_catalogo_json
        try:
            texto_para_parsear = mensaje
            if "productos nuevos" not in mensaje_lower and "actualizacion" not in mensaje_lower:
                if mensaje.strip().startswith("-") or any(p in mensaje_lower for p in ["panel", "bateria", "batería", "inversor"]):
                    texto_para_parsear = "Productos Nuevos del Día:\n" + mensaje
            
            agregados = actualizar_catalogo_desde_texto_admin(texto_para_parsear)
            if agregados:
                nombres = "\n".join([f"• {a['modelo'][:70]}" for a in agregados[:6]])
                mas = f"\n...y {len(agregados)-6} más" if len(agregados) > 6 else ""
                total = len(cargar_catalogo_json().get('productos_nuevos', []))
                return (
                    f"✅ ¡Catálogo actualizado con {len(agregados)} producto(s) nuevos! 📦\n\n"
                    f"{nombres}{mas}\n\n"
                    f"Ya están activos para clientes. Total nuevos hoy: {total} 🆕\n\n"
                    f"¿Quieres agregar más? Envíame lista con '-' al inicio.\n"
                    f"Puedes ver catálogo en: /admin"
                )
            else:
                return (
                    "📝 Parece que quieres actualizar catálogo pero no pude extraer productos.\n\n"
                    "*Formato fácil desde tu teléfono:*\n\n"
                    "Productos Nuevos del Día:\n"
                    "- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1\n"
                    "- Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.6kWh\n\n"
                    "Tip: cada producto en línea nueva empezando con '-' y con precio.\n"
                    "Reenvíalo así y lo actualizo al instante ⚡"
                )
        except Exception as e:
            logger.warning(f"Error auto-actualización catálogo admin {telefono}: {e}")

    system_prompt = cargar_system_prompt()
    # Contexto cliente
    contexto = f"\n[Contexto: Tel={telefono}, Nombre={nombre_contacto}, EsAdmin={es_admin_phone(telefono)}, LLM={get_llm_provider()}]"
    mensaje_con_contexto = mensaje + contexto

    # Detectar proveedor LLM
    llm_provider = get_llm_provider()
    logger.info(f"Usando LLM provider: {llm_provider} para {telefono}")

    try:
        if llm_provider == "anthropic":
            return await generar_respuesta_anthropic(mensaje_con_contexto, historial, system_prompt)
        elif llm_provider == "groq":
            return await generar_respuesta_groq(mensaje_con_contexto, historial, system_prompt)
        elif llm_provider == "openrouter":
            return await generar_respuesta_openrouter(mensaje_con_contexto, historial, system_prompt)
        elif llm_provider == "ollama":
            return await generar_respuesta_ollama(mensaje_con_contexto, historial, system_prompt)
        elif llm_provider in ["huggingface", "hf"]:
            return await generar_respuesta_huggingface(mensaje_con_contexto, historial, system_prompt)
        elif llm_provider == "free":
            return generar_respuesta_free(mensaje, telefono)
        else:
            # Por defecto intentar groq si hay key, sino ollama, sino free
            if os.getenv("GROQ_API_KEY"):
                return await generar_respuesta_groq(mensaje_con_contexto, historial, system_prompt)
            elif os.getenv("OLLAMA_API_URL"):
                return await generar_respuesta_ollama(mensaje_con_contexto, historial, system_prompt)
            else:
                return generar_respuesta_free(mensaje, telefono)
    except Exception as e:
        logger.error(f"Error LLM {llm_provider}: {e}")
        # Fallback gratis
        if any(k in mensaje_lower for k in ["catalogo", "catálogo", "precio", "producto", "panel", "bateria", "batería", "kit"]):
            try:
                from agent.catalog import listar_catalogo_completo
                cat = listar_catalogo_completo()
                return f"⚡ Catálogo (modo fallback gratis por error {llm_provider}):\n\n{cat[:1200]}\n\n¿Qué producto te interesa? ☀️"
            except:
                pass
        return obtener_mensaje_error()
