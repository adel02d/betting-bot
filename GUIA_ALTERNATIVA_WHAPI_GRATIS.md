# 💯 ALTERNATIVA A WHAPI TOTALMENTE GRATIS SIN PAGAR — 2 opciones 100% gratis

Whapi te pide pago después del trial, por eso aquí tienes **2 alternativas 100% gratis sin pagar, sin tarjeta**, que funcionan desde Cuba con solo teléfono:

---

## OPCIÓN 1: META CLOUD API (OFICIAL DE WHATSAPP) — 100% GRATIS SIN PAGAR (RECOMENDADA)

**¿Por qué es 100% gratis?**
- Meta (dueño de WhatsApp) regala **1000 conversaciones gratis al mes** (cuando cliente te escribe primero, es conversación de servicio gratis)
- No pide tarjeta, solo cuenta de Facebook
- Oficial, no te banean número
- Funciona en Cuba sin VPN

**Links 100% gratis:**
- Principal: https://developers.facebook.com
- Tus Apps: https://developers.facebook.com/apps
- Doc WhatsApp: https://developers.facebook.com/docs/whatsapp

**Pasos desde tu teléfono (Chrome → Versión computadora):**

1.  **Crear App:**
    - https://developers.facebook.com → Login con Facebook → My Apps → Create App → Tipo **Business** → Nombre `EnergixCu Jose` → Crear

2.  **Agregar WhatsApp:**
    - Dentro de tu App → Add Product → Busca **WhatsApp** → Set Up

3.  **Sacar 3 datos gratis:**
    - Ve a **WhatsApp → API Setup**
    - Copia **Phone Number ID** (ej: `123456789`) → Guarda como `META_PHONE_NUMBER_ID`
    - Copia **Temporary Access Token** (`EAA...` largo) → Guarda como `META_ACCESS_TOKEN` (dura 24h, luego generas permanente gratis abajo)
    - Inventa **Verify Token**: `energixcu-verify-2024` → Guarda como `META_VERIFY_TOKEN`

4.  **Token Permanente Gratis (para no renovar cada 24h):**
    - Ve a https://business.facebook.com/settings/system-users
    - Create System User → Nombre `energixcu-bot` → Role Admin
    - Add Assets → Apps → tu App `EnergixCu Jose` → Full Control
    - Generate New Token → selecciona tu App → marca `whatsapp_business_messaging` y `whatsapp_business_management` → Generate → Copia token permanente `EAA...` → Ese es tu `META_ACCESS_TOKEN` permanente

5.  **Deploy Koyeb gratis sin tarjeta:**
    - https://app.koyeb.com → Sign Up GitHub → Create Service → GitHub `adel02d/betting-bot` main → Buildpack Python → Run `uvicorn agent.main:app --host 0.0.0.0 --port 8000` → Eco gratis → Port 8000 → Variables:
```
LLM_PROVIDER=free
WHATSAPP_PROVIDER=meta
META_PHONE_NUMBER_ID=tu_id
META_ACCESS_TOKEN=EAA_tu_token
META_VERIFY_TOKEN=energixcu-verify-2024
ADMIN_PHONE=+5351234567
PORT=8000
ENVIRONMENT=production
```
    - Deploy → copia URL `https://...koyeb.app` → Webhook será `https://TU-URL.koyeb.app/webhook`

6.  **Conectar Webhook Meta:**
    - En tu App → WhatsApp → Configuration → Webhooks → Edit → Callback URL: `https://TU-URL.koyeb.app/webhook` → Verify Token: `energixcu-verify-2024` → Verify and Save → Abajo marca **messages** → Subscribe

7.  **Probar gratis:**
    - En API Setup → To → Agrega tu número personal con +53 → Te envía código WhatsApp → Verifícalo → Escribe al número de prueba `+1555...` que te da Meta: `Hola` → Debe responder Jose

**Costo:** $0, sin tarjeta, 1000 conv gratis/mes, oficial.

---

## OPCIÓN 2: EVOLUTION API (OPEN SOURCE, 100% GRATIS SIN PAGAR, SIN LÍMITES, SELF-HOST) — Como Whapi pero gratis para siempre

**¿Qué es?** Evolution API es una copia open source de Whapi, gratis, tú despliegas tu propio servidor WhatsApp y conectas tu número escaneando QR, igual que Whapi pero **sin pagar nunca**.

**GitHub:** https://github.com/EvolutionAPI/evolution-api
**Docs:** https://doc.evolution-api.com/v1/api-reference/message-controller

**¿Por qué 100% gratis?** Tú lo hosteas, no pagas a nadie, código abierto, sin límites de mensajes, sin tarjeta.

**Links:**
- Evolution GitHub: https://github.com/EvolutionAPI/evolution-api
- Deploy en Koyeb gratis: https://app.koyeb.com
- Docs deploy: https://doc.evolution-api.com/v1/installation/koyeb

**Pasos desde teléfono:**

1.  **Deploy Evolution API gratis en Koyeb:**
    - https://app.koyeb.com → Create Service → **Docker** (no Buildpack) → **GitHub → EvolutionAPI/evolution-api** (pon este repo) o usa Docker Hub: `atendai/evolution-api:latest`
    - O más fácil: Ve a https://doc.evolution-api.com/v1/installation/koyeb → tiene botón **Deploy to Koyeb** con un clic
    - Variables para Evolution:
```
SERVER_URL=https://tu-evolution.koyeb.app
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=energixcu123456 (inventas una key, ej: energixcu123)
```
    - Deploy → Copia URL `https://tu-evolution-xxxx.koyeb.app` → Guarda como `EVOLUTION_API_URL`
    - Tu API Key es `energixcu123456` → Guarda como `EVOLUTION_API_KEY`

2.  **Conectar tu número WhatsApp (igual que Whapi, QR):**
    - Entra a `https://tu-evolution.koyeb.app` → Docs → o `https://tu-evolution.koyeb.app/instance/create` → Crea instancia nombre `energixcu` → Te da QR → Escanea con WhatsApp → Dispositivos vinculados → Vincular → Connected

3.  **Deploy tu bot Jose (segundo servicio gratis en Koyeb):**
    - Koyeb te deja 1 servicio gratis por cuenta. Para tener Evolution + Jose necesitas 2 cuentas Koyeb (con 2 GitHub) o usar misma cuenta con Hugging Face para uno. Alternativa: Deploy Evolution en https://huggingface.co/new-space (Docker) gratis y Jose en Koyeb gratis → ambos gratis sin tarjeta.
    - O usa **Render** para Evolution (https://dashboard.render.com) gratis y Koyeb para Jose → 2 gratis sin tarjeta
    - Variables para Jose con Evolution:
```
LLM_PROVIDER=free
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://tu-evolution.koyeb.app
EVOLUTION_API_KEY=energixcu123456
EVOLUTION_INSTANCE=energixcu
ADMIN_PHONE=+5351234567
PORT=8000
```
    - Deploy Jose → URL `https://energixcu-jose.koyeb.app` → Webhook Evolution: En Evolution API Dashboard → Webhook → Set URL `https://energixcu-jose.koyeb.app/webhook` → Events messages.upsert

4.  **Probar:**
    - Escribe a tu número → Jose responde vía Evolution, 100% gratis, sin pagar a Whapi

**Costo:** $0, sin tarjeta, sin límites, open source, tú eres dueño.

---

## OPCIÓN 3: TWILIO SANDBOX (100% GRATIS PARA PROBAR, SIN PAGAR)

- Link: https://www.twilio.com/docs/whatsapp/sandbox
- Sandbox gratis, sin tarjeta, te da número compartido `+14155238886`
- Para unirte: envía `join <tu-codigo>` por WhatsApp al número de Twilio → Quedas dentro
- Luego configuras webhook `https://TU-URL.koyeb.app/webhook`
- Gratis para probar, limitado

---

## ¿CUÁL ELEGIR SI WHAPI PIDE PAGO?

- **Si quieres oficial y sin complicarte con otro servidor:** **Meta Cloud API Opción 1** → 100% gratis, sin tarjeta, oficial, 1000 conv gratis, funciona desde teléfono
- **Si quieres como Whapi pero gratis para siempre sin límites y sin pagar nunca:** **Evolution API Opción 2** → 100% gratis, open source, tú hosteas

Ambas funcionan con el código que ya te actualicé: `agent/providers/meta.py` y `agent/providers/evolution.py` (nuevo).

Solo cambia en Koyeb Variables `WHATSAPP_PROVIDER=meta` o `evolution` y pon tus tokens.

---

## 📋 LINKS RESUMEN SIN WHAPI QUE PIDE PAGO

| Necesidad | Link Gratis sin pago | Qué hacer |
|-----------|----------------------|-----------|
| WhatsApp Oficial Gratis | https://developers.facebook.com | Create App → Add WhatsApp → API Setup → copiar Phone ID y Token |
| Token permanente gratis | https://business.facebook.com/settings/system-users | Create System User → Generate Token |
| Webhook Meta | Tu App → WhatsApp → Configuration | Pegar https://TU-URL.koyeb.app/webhook + Verify Token |
| Evolution API Repo | https://github.com/EvolutionAPI/evolution-api | Deploy gratis |
| Deploy Evolution Koyeb | https://doc.evolution-api.com/v1/installation/koyeb | Botón Deploy to Koyeb |
| Evolution API URL | https://tu-evolution.koyeb.app | Tu API URL + Key inventada |
| Servidor Jose Gratis | https://app.koyeb.com | Deploy adel02d/betting-bot con LLM_PROVIDER=free |
| Panel admin | https://TU-URL.koyeb.app/admin | Actualizar catálogo |
| Ver pedidos | https://TU-URL.koyeb.app/admin/pedidos | Tabla tickets + te llega WhatsApp a ADMIN_PHONE |

**Costo total con Meta o Evolution: $0 sin tarjeta, sin Whapi que pide pago.**

¿Con cuál te quedas? Meta (más fácil, oficial) o Evolution (self-host como Whapi pero gratis)?
