# 🚀 GUÍA FINAL DEFINITIVA PASO A PASO — Desplegar a José (EnergixCu) con Evolution 100% GRATIS — Solo teléfono, sin PC, sin tarjeta, sin Whapi, sin Groq

**Esta es la guía más detallada. Sigue los pasos en orden desde tu teléfono. No te saltes ninguno.**

**Tiempo:** 30-45 min la primera vez, luego 2 min actualizar catálogo.
**Necesitas:** 1 teléfono Android/iPhone con Chrome, 2 cuentas Gmail (puedes crear segunda en 1 min), conexión internet, tu WhatsApp.
**Resultado:** José atendiendo WhatsApp 24/7, actualizando catálogo por mensaje, enviándote tickets por WhatsApp.

---

## 🤖 ¿QUÉ IA ESTÁ USANDO JOSÉ? (Respuesta a tu pregunta)

**Actualmente por defecto (como no puedes crear API Groq bloqueada en Cuba y no tienes tarjeta):**

**José usa MODO FREE 100% GRATIS SIN NINGUNA API EXTERNA — IA propia basada en reglas inteligentes:**

- **NO usa** Claude (Anthropic), Groq, OpenAI, ni ninguna API de USA bloqueada en Cuba.
- **Funciona offline** solo con tu catálogo `config/business.yaml` y `data/catalog.json` y reglas programadas en `agent/brain.py` función `generar_respuesta_free()` + herramientas en `agent/tools.py`.
- **Qué hace sin IA externa:**
  - Detecta saludo, catálogo, productos, cálculo de kit, forma de pago, intención de compra con palabras clave
  - Busca en catálogo local con `listar_catalogo_completo()` y `buscar_producto()`
  - Calcula kit según consumo (nevera, ventiladores, luces) con `calcular_kit_solar()` (fórmula: consumo W continuos → recomienda Básico 1kW <500W, Intermedio 3kW <1500W, Pro 5kW >1500W)
  - Pide 5 datos y genera ticket oficial con `generar_ticket_pedido()` → guarda JSON en `data/pedidos/` → te notifica por WhatsApp a `ADMIN_PHONE` con `notificar_admin_nuevo_pedido()` en `agent/main.py`
  - Actualiza catálogo por mensaje si detecta "Productos Nuevos del Día:" con `actualizar_catalogo_desde_texto_admin()`

- **¿Es menos inteligente que Claude/Groq?** Sí, es menos conversacional, pero **vende igual y nunca falla por bloqueo Cuba, sin tarjeta, sin internet extra, 100% gratis**.

**Si en el futuro consigues API con VPN, José puede usar:**

- **Groq (100% gratis sin tarjeta, pero bloqueado en Cuba sin VPN):** Modelo `llama-3.3-70b-versatile` (70 mil millones parámetros, rápido, de Meta) o fallback `llama-3.1-8b-instant`. Es gratis en https://console.groq.com/keys con 14,400 req/día. Cambias en Koyeb Variables `LLM_PROVIDER=groq` y `GROQ_API_KEY=gsk_...` → Redeploy → José se vuelve más conversacional con Llama 3.3.
- **Anthropic Claude 3.5 Sonnet:** Modelo de Anthropic, de pago, $0.003 por mensaje, más inteligente, usado en `whatsapp-agent-kit` original de alanjmr21. Necesita tarjeta.
- **OpenRouter gratis:** `meta-llama/llama-3.1-8b-instruct:free` en https://openrouter.ai/keys

**Por ahora, para ti 100% gratis sin tarjeta y sin bloqueo Cuba, José usa MODO FREE.** En logs de Koyeb verás `LLM provider: free` y `Usando LLM provider: free`.

Puedes ver qué modo está usando en: `https://TU-JOSE.koyeb.app/` → dice `"provider":"ProveedorEvolution"` y en logs `LLM provider: free`.

---

## 📋 ANTES DE EMPEZAR — Prepara tu teléfono

1.  Abre **Chrome** en tu teléfono
2.  Arriba derecha 3 puntitos → Activa **"Versión para computadora"** o **"Sitio para computadora"**. Esto es OBLIGATORIO para que veas botones de Koyeb y GitHub que en móvil no salen.
3.  Crea nota en tu teléfono llamada **ENERGIXCU JOSE CLAVES** con esto vacío:
```
GMAIL 1 (para Evolution): 
GMAIL 2 (para Jose): 
EVOLUTION_API_URL = 
EVOLUTION_API_KEY = energixcu123456 (inventa)
EVOLUTION_INSTANCE = energixcu
JOSE_URL = 
ADMIN_PHONE = +53...
WHATSAPP que será bot: +53...
```

---

## PASO 0: VERIFICA TU REPO (1 min) — 100% gratis

- Link: https://github.com/adel02d/betting-bot
- Entra, refresca deslizando hacia abajo
- Debes ver carpetas `agent/`, `config/`, `GUIA_FINAL_JOSE_EVOLUTION_PASO_A_PASO.md` (esta guía), `requirements.txt`
- Arriba donde decía "JavaScript 100%" ahora debe decir **Python 80%** o similar. Si ves "Bot de apuestas Telegram" y JavaScript, toca donde dice `main` (branch) arriba y selecciona `arena/01a016b5-betting-bot` y luego refresca. Ya está actualizado tu main con Jose, pero GitHub tarda 1 min.

**¿Ves Python?** Sigue. Si no, dime qué ves.

---

## PASO 1: CREA 2 CUENTAS GMAIL SI NO TIENES (2 min) — 100% gratis

Koyeb gratis permite 1 servicio por cuenta. Necesitamos 2 servicios gratis: 1 para Evolution + 1 para Jose.

- Gmail 1: tu Gmail principal (ej: `tucorreo@gmail.com`)
- Gmail 2: crea rápido: Gmail app → tu foto → Añadir otra cuenta → Crear cuenta → Para mí → Pon nombre `EnergixCu Jose2` → Sigue pasos → Tendrás segundo Gmail `energixcujose2@gmail.com`

Apunta en tu nota:
```
GMAIL 1 (Evolution): tucorreo@gmail.com
GMAIL 2 (Jose): energixcujose2@gmail.com
```

Alternativa si solo quieres usar 1 Gmail: Deploy Evolution en https://huggingface.co/new-space (gratis sin tarjeta) + Jose en Koyeb (gratis) → solo 1 cuenta Koyeb necesaria. Pero guía abajo usa 2 cuentas Koyeb que es más fácil.

---

## PASO 2: DESPLEGAR EVOLUTION API (Tu propio Whapi gratis para siempre) EN KOYEB — 100% GRATIS SIN TARJETA (7 min)

**¿Qué es Evolution?** Es un clon open source de Whapi, tú lo hosteas, escaneas QR como WhatsApp Web, y tienes tu propia API WhatsApp gratis para siempre, sin pagar, sin límites, sin tarjeta. GitHub: https://github.com/EvolutionAPI/evolution-api

**Links:**
- Principal Evolution: https://github.com/EvolutionAPI/evolution-api
- Docs Koyeb Evolution: https://doc.evolution-api.com/v1/installation/koyeb
- Koyeb: https://app.koyeb.com
- Nuevo servicio Koyeb: https://app.koyeb.com/services/new

**Pasos detallados desde teléfono:**

1.  Entra a https://app.koyeb.com con **Gmail 1** (tu Gmail principal) → **Sign Up** → **Continue with GitHub** → Autoriza tu GitHub `adel02d` → Te lleva a Dashboard
2.  Toca **Create Service** → Arriba verás 2 opciones: **GitHub** y **Docker**. Elige **Docker** (IMPORTANTE, Evolution es Docker, no Buildpack)
3.  **Docker image:** Escribe `atendai/evolution-api:latest` → Toca **Search** → Debe aparecer → Selecciónalo. Si no aparece, pon `atendai/evolution-api:v2.0.8` y prueba
4.  **Service name:** Pon `evolution-energixcu` (cualquier nombre)
5.  **Instance:** Deja **Eco** → **e2-micro** (512MB, gratis para siempre, sin tarjeta)
6.  **Port:** `8080` (Evolution usa 8080, no 8000)
7.  **Environment Variables** → **Add Variable** → Agrega estas UNA POR UNA (copia exacto, respeta mayúsculas, inventa tu key):

```
SERVER_URL = https://tu-evolution-xxxx.koyeb.app
AUTHENTICATION_TYPE = apikey
AUTHENTICATION_API_KEY = energixcu123456
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES = true
QRCODE_LIMIT = 30
QRCODE_COLOR = #FF6B00
WEBHOOK_GLOBAL_ENABLED = false
```

    - `SERVER_URL`: Pon temporal ahora `https://tu-evolution-xxxx.koyeb.app` (luego lo actualizaremos con tu URL real)
    - `AUTHENTICATION_API_KEY`: Inventa una clave larga, ej: `energixcu123456` → Esta será tu `EVOLUTION_API_KEY` → Apunta en tu nota
    - Las demás copia igual

8.  Toca **Deploy** → Verás **Building...** → **Deploying...** → Espera 4-6 min (Evolution tarda más que Jose porque es grande) → Cuando diga **Healthy** verde con check, toca tu servicio → Arriba verás **URL** tipo `https://evolution-energixcu-xxxx.koyeb.app` o `https://xxxx.koyeb.app` → **Copia esa URL** → Guarda en tu nota como `EVOLUTION_API_URL = https://tu-evolution-xxxx.koyeb.app`

9.  **Actualizar SERVER_URL con URL real (importante):**
    - Ahora que tienes URL real, ve a tu servicio Evolution → **Settings** → **Environment** → Edita `SERVER_URL` → Pega tu URL real `https://tu-evolution-xxxx.koyeb.app` → Save → Arriba toca **Redeploy** → Espera 2 min → Healthy verde de nuevo

**¿Qué acabas de hacer?** Desplegaste tu propio servidor WhatsApp como Whapi pero gratis para siempre, tuyo.

**Costo:** $0, sin tarjeta, 1 servicio gratis para siempre en Koyeb.

**Si Koyeb Docker te da error desde teléfono:**
- Alternativa: Ve a https://huggingface.co/new-space → Create new Space → Name `evolution-energixcu` → SDK **Docker** → Blank → Create → En Files → Add File → Dockerfile → Pega:
```
FROM atendai/evolution-api:latest
```
→ Save → Hugging Face lo despliega gratis y te da URL `https://TU-USUARIO-evolution-energixcu.hf.space` → Usa esa como `EVOLUTION_API_URL`. Luego sigue igual.

Apunta en tu nota:
```
EVOLUTION_API_URL = https://tu-evolution-xxxx.koyeb.app
EVOLUTION_API_KEY = energixcu123456
EVOLUTION_INSTANCE = energixcu (lo crearás en Paso 3)
```

---

## PASO 3: CONECTAR TU NÚMERO WHATSAPP A EVOLUTION (QR) (3 min)

Ahora conectas tu número personal para que sea el bot (como WhatsApp Web).

**Link Swagger Evolution (para crear instancia y sacar QR desde teléfono):**
`https://TU-EVOLUTION.koyeb.app/docs` (reemplaza TU-EVOLUTION con tu URL real)

**Pasos:**

1.  Abre Chrome → Entra a `https://TU-EVOLUTION.koyeb.app/docs` → Verás Swagger UI (lista de endpoints)
2.  Busca **POST /instance/create** → Tócalo para expandir → Toca **Try it out**
3.  En **Request body** pega este JSON exacto (reemplaza si cambiaste key):

```json
{
  "instanceName": "energixcu",
  "token": "energixcu123456",
  "qrcode": true,
  "webhook": "",
  "webhookByEvents": false,
  "webhookBase64": false
}
```
- `instanceName`: `energixcu` (debe ser igual a `EVOLUTION_INSTANCE` que usarás en Jose)
- `token`: mismo que `EVOLUTION_API_KEY` que inventaste (`energixcu123456`)

4.  Toca **Execute** → Abajo en **Response body** verás algo con `qrcode: { base64: "data:image/png;base64,iVBOR..." }` o `instance` creado
5.  Si te da `base64` largo que empieza con `data:image/png;base64,`, **cópialo entero** → Abre nueva pestaña Chrome → Pega `data:image/png;base64,iVBOR...` en barra de URL → Enter → Verás **QR gigante**
    - Si te da `code` directo, también es QR
    - Algunas versiones de Evolution dan `pairingCode` o link directo `https://...`

6.  Ahora abre **WhatsApp** en tu teléfono → **Ajustes / Configuración** → **Dispositivos vinculados** → **Vincular un dispositivo** → Escanea el QR que ves en la otra pestaña

7.  Espera 10-15 segundos → En Swagger haz **GET /instance/fetchInstances** → Try it out → Execute → Debe mostrar tu instancia `energixcu` con `state: open` o `connectionStatus: open` → ¡Conectado!

**Si no ves QR en /docs:**
- Prueba entrar a `https://TU-EVOLUTION.koyeb.app/manager` o `https://TU-EVOLUTION.koyeb.app/instance` → Login con API Key `energixcu123456` → Create Instance `energixcu` → QR → Escanear

Guarda en tu nota:
```
EVOLUTION_INSTANCE = energixcu (conectado)
```

**Costo:** $0, tu número ahora es bot pero sigue funcionando normal para ti.

---

## PASO 4: DESPLEGAR JOSÉ BOT EN KOYEB (Cuenta 2) (5 min) — 100% GRATIS

Ahora con **Gmail 2** (segunda cuenta) para tener segundo servicio gratis.

**Links:**
- Koyeb: https://app.koyeb.com/services/new
- Tu repo: https://github.com/adel02d/betting-bot

**Pasos:**

1.  Sal de Koyeb Cuenta 1 → Entra a https://app.koyeb.com con **Gmail 2** (energixcujose2@gmail.com) → Sign Up with GitHub (puedes usar mismo GitHub `adel02d` o crea otro GitHub con Gmail 2, pero puedes usar mismo GitHub en 2 cuentas Koyeb, Koyeb permite)
2.  Create Service → **GitHub** → Busca `adel02d/betting-bot` → Selecciónalo → Branch `main` (ya tiene a Jose)
3.  **Builder:** Buildpack → **Python**
4.  **Run command (copia exacto):**
```
uvicorn agent.main:app --host 0.0.0.0 --port 8000
```
5.  **Instance:** Eco e2-micro gratis → **Port:** `8000`
6.  **Environment Variables** → Add Variable → Agrega estas 7 (SOLO 7, sin API IA):

```
WHATSAPP_PROVIDER = evolution
EVOLUTION_API_URL = https://tu-evolution-xxxx.koyeb.app (del PASO 2, URL de Evolution)
EVOLUTION_API_KEY = energixcu123456 (misma que inventaste en Evolution)
EVOLUTION_INSTANCE = energixcu
ADMIN_PHONE = +5351234567 (TU número personal con +53, donde RECIBIRÁS tickets de pedidos, pon tu número real Cuba)
LLM_PROVIDER = free
PORT = 8000
ENVIRONMENT = production
```
- `ADMIN_PHONE`: Ejemplo Cuba `+5351234567` → Si tu número es `51234567`, pon `+5351234567`. Si son 2 admins: `+5351234567,+5357654321`

7.  Deploy → Building 2-3 min → Healthy verde → Copia URL Jose: `https://tu-jose-xxxx.koyeb.app` → Guarda como `JOSE_URL` en tu nota

8.  Tu webhook Jose será: `https://TU-JOSE.koyeb.app/webhook` (agrega `/webhook` al final)

Apunta:
```
JOSE_URL = https://tu-jose-xxxx.koyeb.app
JOSE_WEBHOOK = https://tu-jose-xxxx.koyeb.app/webhook
```

**Costo:** $0, sin tarjeta, segundo servicio gratis.

---

## PASO 5: CONECTAR EVOLUTION CON JOSÉ (Webhook) (2 min) — Unir los 2 servidores gratis

Evolution necesita saber a dónde enviar mensajes cuando te escriben por WhatsApp.

**Link Swagger Evolution:** `https://TU-EVOLUTION.koyeb.app/docs`

1.  Abre `https://TU-EVOLUTION.koyeb.app/docs` → Busca **POST /webhook/set/{instance}** o **PUT /webhook/set/{instanceName}** (nombre cambia según versión)
2.  Try it out → **instanceName:** `energixcu` → Body pega:

```json
{
  "webhook": {
    "enabled": true,
    "url": "https://TU-JOSE.koyeb.app/webhook",
    "webhookByEvents": false,
    "webhookBase64": false,
    "events": ["MESSAGES_UPSERT"]
  }
}
```
- Reemplaza `https://TU-JOSE.koyeb.app/webhook` con tu URL real de Jose + `/webhook`

3.  Execute → Debe decir `{"status":200,"...": "webhook set"}` o similar verde

**Alternativa si no encuentras /webhook/set:**
- En Evolution env tenías `WEBHOOK_GLOBAL_URL`, pero mejor por instancia como arriba. Si no funciona, ve a Koyeb Evolution → Settings → Environment → Edita `WEBHOOK_GLOBAL_URL = https://TU-JOSE.koyeb.app/webhook`, `WEBHOOK_GLOBAL_ENABLED = true`, `WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS = false` → Save → Redeploy

**¿Qué acabas de hacer?** Le dijiste a Evolution: "Cuando llegue un WhatsApp a mi número, reenvíalo a Jose en Koyeb"

---

## PASO 6: PROBAR JOSÉ CON EVOLUTION 100% GRATIS (1 min)

**Prueba 1 — Por WhatsApp real (con tu número conectado):**
- Desde **OTRO teléfono** (familiar, amigo, segundo chip) escribe por WhatsApp a **TU número** (el que conectaste a Evolution en Paso 3): `Hola`
- Debe responder en 3-5 segundos: `¡Hola! 👋 Soy Jose de EnergixCu ⚡...` (modo free sin IA)

**Prueba 2 — Sin WhatsApp, desde tu teléfono (más fácil, sin gastar saldo):**
- Entra a `https://TU-JOSE.koyeb.app/admin/test` → Teléfono `+5350000000` → Mensaje `Hola, que paneles tienen?` → Enviar a Jose → Verás respuesta

**Prueba 3 — Ver si están vivos:**
- Evolution: `https://TU-EVOLUTION.koyeb.app/` o `/docs` → debe abrir docs
- Jose: `https://TU-JOSE.koyeb.app/` → debe decir `{"status":"ok","agent":"Jose","provider":"ProveedorEvolution","llm":"free"}`

**Si no responde en WhatsApp:**
- Koyeb Jose → Logs → ¿Dice `EVOLUTION_API_URL no configurados`? → Revisa Variables PASO 4
- Koyeb Evolution → Logs → ¿Instance `energixcu` state `close`? → Repite PASO 3 QR, se desconectó
- Evolution Swagger → GET /instance/fetchInstances → ¿state open? Si dice close, escanea QR de nuevo
- Webhook: Swagger Evolution → GET /webhook/find/{instance} → debe mostrar tu URL Jose webhook

**Koyeb free se duerme:** Si no lo usan 24h, Koyeb lo suspende y tarda 30 seg en despertar primer mensaje. Es normal en free.

---

## PASO 7: ACTUALIZAR CATÁLOGO SOLO CON MENSAJE WHATSAPP (Sin PC, Gratis)

**Desde tu ADMIN_PHONE (el que pusiste en Variables), envía WhatsApp a tu propio número bot (tu número conectado a Evolution):**

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W 48V - $900 USD - MPPT 100A WiFi
```

**Reglas para teléfono:**
- Primera línea OBLIGATORIA: `Productos Nuevos del Día:`
- Cada producto línea nueva empezando con `-`
- Pon precio con `$` y `CUP` para extraer automático

Jose responde:
```
✅ ¡Catálogo actualizado con 3 producto(s) nuevos! 📦
• Panel Solar 600W Bifacial - $320 USD / 80000 CUP
...
Ya están activos para clientes. Total nuevos hoy: 3 🆕
```

**También funciona una sola línea:**
```
Panel Solar 600W Bifacial $320 USD / 80000 CUP
```
→ Si tu número es admin, lo agrega

**Por web desde teléfono (también gratis):**
- `https://TU-JOSE.koyeb.app/admin` → Formulario grande → pega lista → Actualizar → dice cuántos agregó

**Truco:** Guarda en Notas plantilla vacía:
```
Productos Nuevos del Día:
- 
- 
- 
```
Llena, copia, pega a WhatsApp bot.

---

## PASO 8: CUANDO CLIENTE COMPRA, TICKET TE LLEGA POR WHATSAPP GRATIS

**Flujo real cliente:**

1. Cliente escribe a tu número bot: `Hola, busco panel para nevera y 2 ventiladores`
2. Jose modo free responde: `⚡ Cálculo de Kit Solar para: nevera, 2 ventiladores... Te recomiendo Kit Intermedio 3kW $1850...`
3. Cliente: `Me interesa Kit Intermedio`
4. Jose pide 5 datos en un solo mensaje:
```
Para generarte ticket oficial necesito en UN SOLO MENSAJE:
1️⃣ Nombre completo
2️⃣ Producto y modelo exacto
3️⃣ Cantidad
4️⃣ Dirección exacta (Municipio, reparto y ref)
5️⃣ Forma de pago: Efectivo o Transferencia
...
```
5. Cliente envía:
```
Nombre: Juan Pérez
Producto: Kit Intermedio 3kW Casa Completa
Cantidad: 1
Dirección: Calle 23 #456 Vedado Plaza La Habana ref frente al parque
Forma de pago: Efectivo
```
6. Jose genera ticket y **hace 2 envíos automático**:

**Cliente recibe:**
```
--------------------------------------------------
⚡ TICKET DE PEDIDO - ENERGIXCU ⚡
- Cliente: Juan Pérez
- Producto: Kit Intermedio 3kW...
...
--------------------------------------------------
¡Listo! Tu pedido registrado...
```

**TÚ en ADMIN_PHONE recibes al mismo tiempo (aunque sea mismo número bot, te llega a tu admin si es distinto, si es mismo número revisa /admin/pedidos):**
```
🔔 ¡NUEVO PEDIDO ENERGIXCU! 🔔

⚡ TICKET DE PEDIDO - ENERGIXCU ⚡
...

📞 Cliente WhatsApp: +5351234567 (Juan)
👤 Nombre contacto: Juan
🕐 Fecha: 2026-08-18 22:30:00

✅ Acción: Contactar cliente para coordinar entrega.
Ver todos: /admin/pedidos
```

**Mejor práctica:** Usa 2 números: uno para bot (conectado a Evolution) y otro personal para ADMIN_PHONE donde recibes tickets. Si solo tienes 1 número, revisa pedidos en web.

**Ver todos pedidos desde teléfono:**
- `https://TU-JOSE.koyeb.app/admin/pedidos` → tabla con fecha, cliente, producto, dirección, pago

---

## 📋 LINKS RESUMEN EVOLUTION 100% GRATIS

| Para qué | Link Gratis sin pago | Qué hacer |
|----------|----------------------|-----------|
| Tu código Jose | https://github.com/adel02d/betting-bot | Refrescar, ver Python, no Fork |
| Evolution GitHub | https://github.com/EvolutionAPI/evolution-api | Código open source |
| Docs Evolution Koyeb | https://doc.evolution-api.com/v1/installation/koyeb | Botón Deploy to Koyeb |
| Deploy Evolution | https://app.koyeb.com/services/new (Cuenta 1) | Docker `atendai/evolution-api:latest` Port 8080 Variables SERVER_URL, AUTHENTICATION_API_KEY |
| Crear QR Evolution | https://TU-EVOLUTION.koyeb.app/docs → POST /instance/create | instanceName energixcu token energixcu123456 qrcode true → Execute → QR → Escanear con WhatsApp |
| Ver instancias Evolution | https://TU-EVOLUTION.koyeb.app/docs → GET /instance/fetchInstances | Debe decir state open |
| Deploy Jose | https://app.koyeb.com/services/new (Cuenta 2) | GitHub adel02d/betting-bot main Python Run uvicorn agent.main:app --host 0.0.0.0 --port 8000 Variables 7 |
| Set Webhook Evolution | https://TU-EVOLUTION.koyeb.app/docs → POST /webhook/set/{instance} | url https://TU-JOSE.koyeb.app/webhook events MESSAGES_UPSERT |
| Bot vivo | https://TU-JOSE.koyeb.app/ | Debe decir ok agent Jose provider Evolution llm free |
| Panel admin teléfono | https://TU-JOSE.koyeb.app/admin | Actualizar catálogo formulario |
| Ver pedidos | https://TU-JOSE.koyeb.app/admin/pedidos | Tabla tickets |
| Probar sin WhatsApp | https://TU-JOSE.koyeb.app/admin/test | Escribir como cliente |
| Evolution API URL | https://TU-EVOLUTION.koyeb.app | Tu API |
| Evolution Manager | https://TU-EVOLUTION.koyeb.app/manager | Alternativa para crear instancia |

---

## ✅ CHECKLIST FINAL EVOLUTION 100% GRATIS

- [ ] Veo Python en https://github.com/adel02d/betting-bot (no JavaScript, refresqué)
- [ ] Tengo 2 Gmail (Cuenta 1 Evolution, Cuenta 2 Jose)
- [ ] Deploy Evolution en Koyeb Cuenta 1 Docker `atendai/evolution-api:latest` Port 8080 Variables, Healthy verde, URL copiada `https://tu-evolution-xxxx.koyeb.app`
- [ ] Crear instancia `energixcu` en `https://TU-EVOLUTION.koyeb.app/docs` POST /instance/create qrcode true → QR escaneado con WhatsApp → state open
- [ ] Deploy Jose en Koyeb Cuenta 2 GitHub `adel02d/betting-bot` main Python Run uvicorn... Variables WHATSAPP_PROVIDER=evolution EVOLUTION_API_URL EVOLUTION_API_KEY EVOLUTION_INSTANCE ADMIN_PHONE LLM_PROVIDER=free, Healthy verde, URL copiada `https://tu-jose-xxxx.koyeb.app`
- [ ] Set webhook Evolution POST /webhook/set/energixcu url `https://TU-JOSE.koyeb.app/webhook` events MESSAGES_UPSERT → success
- [ ] Escribí Hola desde otro teléfono a mi número bot y respondió Jose modo free
- [ ] Entré a `https://TU-JOSE.koyeb.app/admin/test` y probé catalogo y me dio catálogo
- [ ] Envié `Productos Nuevos del Día: - Panel 600W $320` desde mi ADMIN_PHONE y respondió `Catálogo actualizado`
- [ ] Probé compra completa: `quiero comprar panel 550W` → me pidió 5 datos → envié 5 datos con Efectivo → me generó ticket y me llegó a ADMIN_PHONE por WhatsApp (o a /admin/pedidos)
- [ ] Entré a `https://TU-JOSE.koyeb.app/admin/pedidos` y veo mi pedido

Si todo marcado ✅, ¡José vendiendo 24/7 100% gratis con Evolution, sin tarjeta, sin Whapi que pide pago, sin Groq bloqueado en Cuba, solo teléfono! 🎉

---

## 🆘 TROUBLESHOOTING EVOLUTION DESDE TELÉFONO

**Evolution no despliega en Koyeb, logs rojo:**
- Verifica Dockerfile imagen: `atendai/evolution-api:latest` exacta
- Port 8080, no 8000
- Variables SERVER_URL debe ser `https://tu-evolution-xxxx.koyeb.app` (tu URL real, no ejemplo)
- Si Docker falla, prueba Hugging Face: https://huggingface.co/new-space → Docker → Blank → Dockerfile `FROM atendai/evolution-api:latest`

**QR no aparece en /docs POST /instance/create:**
- Prueba GET /instance/fetchInstances → ¿ya existe instancia energixcu? → DELETE /instance/delete/energixcu → vuelve a crear
- Prueba Manager: `https://TU-EVOLUTION.koyeb.app/manager`

**Instance state close después de escanear:**
- Escanea rápido, QR expira en 30 seg → Genera nuevo QR POST /instance/connect/energixcu

**Jose no responde en WhatsApp pero sí en /admin/test:**
- Evolution webhook no conectado → Swagger POST /webhook/set/energixcu con tu JOSE_URL/webhook
- Verifica Variables Jose: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE exactos iguales a Evolution

**Jose responde en /admin/test pero dice modo free sin catálogo:**
- Entra a `https://TU-JOSE.koyeb.app/catalog` → ¿ves catálogo? Si no, revisa `config/business.yaml` en GitHub, debe existir

**Koyeb se duerme (free tier):**
- Normal, primera mensagem tarda 30 seg en despertar → Luego responde rápido → Si no lo usan 24h, se suspende, se despierta solo cuando llega mensaje

**ADMIN_PHONE no recibe ticket:**
- ¿ADMIN_PHONE es mismo número que bot conectado a Evolution? Si sí, código evita auto-notificarse para no spam → Pon ADMIN_PHONE como tu segundo número personal o familiar, o revisa en `/admin/pedidos`
- Verifica Variables ADMIN_PHONE con +53

---

**¿En qué paso te quedas?** Dime número de paso (0-8) y qué ves en pantalla, te guío exacto con lo que tocas.

**José — EnergixCu — 100% gratis con Evolution, sin tarjeta, sin pagar, solo teléfono — Energía inteligente para Cuba** ⚡☀️🚀
