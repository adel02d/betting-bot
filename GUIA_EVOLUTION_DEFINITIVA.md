# 🚀 GUÍA DEFINITIVA EVOLUTION API 100% GRATIS — Solo teléfono, sin tarjeta, sin pagar nunca

Elegiste **Evolution** — es la mejor elección para 100% gratis: open source, como Whapi pero gratis para siempre, tú eres dueño, sin límites, sin pagar, funciona en Cuba sin bloqueo.

---

## 📦 STACK FINAL 100% GRATIS CON EVOLUTION

- **Código:** https://github.com/adel02d/betting-bot (tu repo, ya tiene Jose y Evolution provider)
- **IA:** Modo `free` sin crear API (funciona en Cuba, sin Groq, sin tarjeta)
- **WhatsApp:** Evolution API https://github.com/EvolutionAPI/evolution-api (open source, 100% gratis, tú lo hosteas)
- **Servidor:** Koyeb https://app.koyeb.com (gratis sin tarjeta) + Hugging Face https://huggingface.co (gratis sin tarjeta) — usaremos 2 servicios gratis para tener Evolution + Jose separados

**Costo: $0 — Para siempre, sin tarjeta, sin Whapi que pide pago.**

---

## 🏗️ ARQUITECTURA CON EVOLUTION

```
Cliente escribe WhatsApp
    ↓
Tu número personal (conectado a Evolution via QR, como WhatsApp Web)
    ↓
Evolution API (https://tu-evolution.koyeb.app) — tu propio servidor WhatsApp gratis
    ↓ Webhook POST /webhook
Tu bot Jose (https://tu-jose.koyeb.app) — FastAPI + memoria + catálogo + ticket
    ↓ Respuesta
Evolution API → Envía respuesta por WhatsApp de vuelta
    ↓
Cliente recibe respuesta de Jose + Tú recibes ticket en ADMIN_PHONE
```

---

## PASO 1: PREPARA 2 CUENTAS GMAIL (2 min) — Para 2 servicios gratis

Koyeb gratis permite 1 servicio por cuenta. Necesitamos 1 para Evolution y 1 para Jose para seguir 100% gratis.

- Si tienes 2 Gmail, perfecto.
- Si no, crea un segundo Gmail rápido en tu teléfono: Gmail → Añadir cuenta → Crear.

Llamémosles:
- **Cuenta 1:** Para Evolution API (ej: tu Gmail principal)
- **Cuenta 2:** Para Jose Bot (ej: tu segundo Gmail)

Alternativa: Evolution en Hugging Face (gratis) + Jose en Koyeb (gratis) → solo 1 cuenta Koyeb.

---

## PASO 2: DESPLEGAR EVOLUTION API 100% GRATIS EN KOYEB (5 min)

**Links:**
- GitHub Evolution: https://github.com/EvolutionAPI/evolution-api
- Docs Koyeb Evolution: https://doc.evolution-api.com/v1/installation/koyeb
- Koyeb: https://app.koyeb.com
- Nuevo servicio: https://app.koyeb.com/services/new

**Desde tu teléfono (Chrome → Versión computadora):**

1.  Entra a https://app.koyeb.com con **Cuenta 1** → Sign Up with GitHub → autoriza
2.  Create Service → **Docker** (IMPORTANTE, no Buildpack) → **Docker Hub** → Imagen: `atendai/evolution-api:latest`
    - Si no te deja Docker Hub, elige **GitHub** → `EvolutionAPI/evolution-api` → Branch `main`
3.  **Environment Variables** → Add Variable → pega estas (copia exacto, inventa tu API key):

```
SERVER_URL = https://tu-evolution-xxxx.koyeb.app (pon temporal, luego lo actualizarás con tu URL real de Koyeb)
AUTHENTICATION_TYPE = apikey
AUTHENTICATION_API_KEY = energixcu123456 (INVENTA una clave larga, ej: energixcu123456, guárdala como EVOLUTION_API_KEY)
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES = true
QRCODE_LIMIT = 30
QRCODE_COLOR = #FF6B00
WEBHOOK_GLOBAL_ENABLED = false
```

    - Guarda `EVOLUTION_API_KEY = energixcu123456` en Notas

4.  Instance: **Eco e2-micro** gratis → Port: `8080` (Evolution usa 8080)
5.  Deploy → Espera 4-6 min (Evolution tarda más) → Cuando diga **Healthy** verde, toca servicio → Copia URL: `https://tu-evolution-xxxx.koyeb.app` → Guarda como `EVOLUTION_API_URL`

6.  **Actualizar SERVER_URL:** Ahora que tienes URL real, ve a Settings → Environment → Edita `SERVER_URL` y pon tu URL real `https://tu-evolution-xxxx.koyeb.app` → Save → Redeploy (espera 2 min)

**¿Qué acabas de hacer?** Desplegaste tu propio servidor WhatsApp como Whapi pero gratis para siempre.

**Alternativa si Koyeb Docker no funciona desde teléfono:**
- Ve a https://huggingface.co/new-space → Create Space → Nombre `evolution-energixcu` → SDK **Docker** → Blank → Create → Luego en Files → Add File → Dockerfile → Pega:
```
FROM atendai/evolution-api:latest
```
→ Save → Hugging Face lo despliega gratis y te da URL `https://tu-usuario-evolution-energixcu.hf.space` → Usa esa como `EVOLUTION_API_URL`

---

## PASO 3: CONECTAR TU NÚMERO WHATSAPP A EVOLUTION (QR) (2 min)

**Link:** `https://TU-EVOLUTION.koyeb.app/docs` (Swagger) o `https://TU-EVOLUTION.koyeb.app/manager` o `.../instance`

**Desde tu teléfono:**

**Opción A — Via Swagger (más fácil desde móvil):**

1.  Abre `https://TU-EVOLUTION.koyeb.app/docs` (reemplaza TU-EVOLUTION con tu URL)
2.  Verás lista de endpoints → Busca **POST /instance/create** → Toca **Try it out**
3.  En Body pega:
```json
{
  "instanceName": "energixcu",
  "token": "energixcu123456",
  "qrcode": true,
  "webhook": "",
  "webhookByEvents": false
}
```
- `instanceName`: `energixcu` (igual que `EVOLUTION_INSTANCE` que usarás en Jose)
- `token`: mismo que `EVOLUTION_API_KEY` que inventaste (`energixcu123456`)
- `qrcode`: true

4.  Toca **Execute** → Respuesta tendrá `qrcode: {base64: "data:image/png;base64,...."}` o `code` → Copia el base64 o abre la imagen QR
    - Si te da base64 largo, cópialo, pégalo en navegador: `data:image/png;base64,....` y verás QR
    - Algunas versiones dan `pairingCode` o link directo para escanear

5.  Abre **WhatsApp** → Ajustes → Dispositivos vinculados → Vincular dispositivo → Escanea QR

6.  Espera 10 seg → En Swagger haz **GET /instance/fetchInstances** → Debe decir `state: close` o `open` → Si dice `open`, conectado!

**Opción B — Via Manager UI (si está disponible):**

- Entra a `https://TU-EVOLUTION.koyeb.app/manager` o `https://TU-EVOLUTION.koyeb.app/instance` → Login con API Key `energixcu123456` → Create Instance `energixcu` → QR → Escanea

**Guarda:**
- `EVOLUTION_INSTANCE = energixcu`
- `EVOLUTION_API_URL = https://tu-evolution.koyeb.app`
- `EVOLUTION_API_KEY = energixcu123456`

---

## PASO 4: DESPLEGAR JOSE BOT EN KOYEB (Cuenta 2) (5 min)

**Ahora con Cuenta 2 (segundo Gmail) para tener segundo servicio gratis:**

1.  Entra a https://app.koyeb.com con **Cuenta 2** → Sign Up with GitHub (otro GitHub o mismo pero con email distinto, o usa Hugging Face para Evolution y Koyeb para Jose con 1 cuenta)
2.  Create Service → GitHub → `adel02d/betting-bot` → Branch `main` → Buildpack Python → Run `uvicorn agent.main:app --host 0.0.0.0 --port 8000` → Eco e2-micro gratis → Port 8000
3.  Variables (SOLO 6, sin API IA, 100% gratis):

```
WHATSAPP_PROVIDER = evolution
EVOLUTION_API_URL = https://tu-evolution.koyeb.app (del PASO 2)
EVOLUTION_API_KEY = energixcu123456 (misma que inventaste en Evolution)
EVOLUTION_INSTANCE = energixcu
ADMIN_PHONE = +5351234567 (TU número con +53 donde recibirás tickets)
LLM_PROVIDER = free
PORT = 8000
ENVIRONMENT = production
```

4.  Deploy → Healthy verde → Copia URL Jose: `https://tu-jose-xxxx.koyeb.app` → Guarda `JOSE_URL`
5.  Webhook Jose será: `https://tu-jose.koyeb.app/webhook`

---

## PASO 5: CONECTAR EVOLUTION CON JOSE (Webhook) (2 min)

Evolution necesita saber a dónde enviar mensajes cuando te escriben.

**Link Swagger Evolution:** `https://TU-EVOLUTION.koyeb.app/docs`

1.  En Swagger, busca **POST /webhook/set/{instance}** o **PUT /webhook/set/{instanceName}**
2.  Try it out → instanceName: `energixcu` → Body:
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
- Reemplaza URL con tu URL de Jose + `/webhook`

3.  Execute → Debe decir `success` o `webhook set`

**Alternativa:** En Evolution .env habías puesto `WEBHOOK_GLOBAL_URL`, pero mejor setear por instancia como arriba.

---

## PASO 6: PROBAR JOSE CON EVOLUTION 100% GRATIS (1 min)

- Desde **OTRO teléfono** (familiar) escribe por WhatsApp a **TU número** (el que conectaste a Evolution): `Hola, que paneles tienen?`
- Debe responder Jose en 3-5 seg con catálogo modo free
- Sin WhatsApp: `https://TU-JOSE.koyeb.app/admin/test` → Escribe `catalogo`

**Si no responde:**
- Koyeb Jose → Logs → ¿Dice `EVOLUTION_API_URL no configurados`? → Revisa Variables
- Koyeb Evolution → Logs → ¿Dice instance `energixcu` no existe o `not connected`? → Repite PASO 3 QR
- Webhook no conectado: en Evolution Swagger → GET /webhook/find/{instance} → debe mostrar tu URL Jose

**Vivo?:**
- Evolution: `https://TU-EVOLUTION.koyeb.app/` → debe decir OK o docs
- Jose: `https://TU-JOSE.koyeb.app/` → `{"status":"ok","agent":"Jose","provider":"ProveedorEvolution"}`

---

## PASO 7: ACTUALIZAR CATÁLOGO POR MENSAJE (Sin PC)

Desde tu ADMIN_PHONE envía WhatsApp a tu numero bot (tu propio numero conectado a Evolution):

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP
- Batería 48V 150Ah - $1600 USD / 400000 CUP
```

Jose: `✅ Catálogo actualizado...`

O por web: `https://TU-JOSE.koyeb.app/admin`

---

## PASO 8: TICKET TE LLEGA POR WHATSAPP GRATIS

Cliente envía 5 datos, Jose genera ticket y **tú recibes automático** en ADMIN_PHONE por Evolution (tu propio número te envía mensaje a ti mismo? No, Evolution envía desde tu número conectado, así que recibirás mensaje de tu propio número, pero llega.)

Si ADMIN_PHONE es mismo que tu número bot, el código evita auto-notificarse si es mismo cliente. Pon ADMIN_PHONE como tu segundo número o familiar para que te llegue, o deja igual y revisa en `/admin/pedidos`.

Mejor: usa 2 números: uno para bot (conectado a Evolution) y otro personal para ADMIN_PHONE donde recibes tickets.

Ver todos: `https://TU-JOSE.koyeb.app/admin/pedidos`

---

## 📋 LINKS RESUMEN EVOLUTION 100% GRATIS

| Para qué | Link Gratis sin pago | Qué hacer |
|----------|----------------------|-----------|
| Tu código Jose | https://github.com/adel02d/betting-bot | Refrescar, ver Python |
| Evolution Repo | https://github.com/EvolutionAPI/evolution-api | Código open source |
| Docs Evolution Koyeb | https://doc.evolution-api.com/v1/installation/koyeb | Botón Deploy to Koyeb |
| Deploy Evolution | https://app.koyeb.com/services/new | Docker Hub `atendai/evolution-api:latest` Port 8080 Variables SERVER_URL, AUTHENTICATION_API_KEY |
| Swagger Evolution | https://TU-EVOLUTION.koyeb.app/docs | POST /instance/create → QR → Escanear |
| Manager Evolution | https://TU-EVOLUTION.koyeb.app/manager | Alternativa para crear instancia |
| Deploy Jose | https://app.koyeb.com/services/new (Cuenta 2) | GitHub adel02d/betting-bot main Buildpack Python Run uvicorn agent.main:app --host 0.0.0.0 --port 8000 Variables 6 |
| Set Webhook Evolution | https://TU-EVOLUTION.koyeb.app/docs → POST /webhook/set/{instance} | URL `https://TU-JOSE.koyeb.app/webhook` events MESSAGES_UPSERT |
| Bot vivo | https://TU-JOSE.koyeb.app/ | Debe decir ok agent Jose provider Evolution |
| Panel admin | https://TU-JOSE.koyeb.app/admin | Actualizar catálogo |
| Ver pedidos | https://TU-JOSE.koyeb.app/admin/pedidos | Tabla tickets |
| Probar sin WhatsApp | https://TU-JOSE.koyeb.app/admin/test | Escribir como cliente |

**Costo: $0, sin tarjeta, sin Whapi que pide pago, sin Groq que bloquea Cuba, solo teléfono.**

---

## ✅ CHECKLIST EVOLUTION

- [ ] Deploy Evolution en Koyeb (Cuenta 1) con Docker `atendai/evolution-api:latest` Port 8080 Variables, Healthy verde, URL copiada
- [ ] Crear instancia `energixcu` en https://TU-EVOLUTION.koyeb.app/docs POST /instance/create qrcode true → QR escaneado con WhatsApp → state open
- [ ] Deploy Jose en Koyeb (Cuenta 2) con `adel02d/betting-bot` main Variables WHATSAPP_PROVIDER=evolution EVOLUTION_API_URL EVOLUTION_API_KEY EVOLUTION_INSTANCE ADMIN_PHONE LLM_PROVIDER=free, Healthy verde, URL copiada
- [ ] Set webhook Evolution POST /webhook/set/energixcu url https://TU-JOSE.koyeb.app/webhook events MESSAGES_UPSERT
- [ ] Escribí Hola a mi número bot y respondió Jose modo free
- [ ] Envié Productos Nuevos del Día desde admin y respondió Catálogo actualizado
- [ ] Probé compra completa con 5 datos y me generó ticket y llegó a /admin/pedidos (y si ADMIN_PHONE distinto, me llegó WhatsApp)

¡Evolution es tuyo para siempre gratis sin pagar nunca! 🎉
