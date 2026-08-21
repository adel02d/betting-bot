# 💯 GUÍA 100% GRATIS SIN TARJETA NI DINERO — EnergixCu Jose desde tu teléfono

**Todo lo que usarás es gratis, sin tarjeta, sin pagar nada, solo tu teléfono.**

---

## 🆓 STACK 100% GRATIS QUE USAREMOS

| Para qué | Antes (con tarjeta) | Ahora (100% gratis sin tarjeta) | Link |
|----------|---------------------|---------------------------------|------|
| **Tu código** | GitHub (gratis) | **GitHub (gratis, sin tarjeta)** | https://github.com |
| **IA Cerebro de Jose** | Anthropic Claude (pide tarjeta) | **Groq (100% gratis, sin tarjeta, solo Gmail)** | https://console.groq.com/keys |
| **WhatsApp** | Whapi (sandbox gratis) o Meta | **Meta Cloud API (Oficial WhatsApp, 1000 conversaciones gratis/mes, sin tarjeta)** | https://developers.facebook.com |
| **Servidor 24/7** | Railway (pide tarjeta) | **Koyeb (100% gratis, sin tarjeta, 1 servicio gratis para siempre)** o Hugging Face Spaces | https://app.koyeb.com |
| **Base datos** | SQLite (gratis) | **SQLite (gratis, incluido)** | - |

**Costo total: $0 — Sin tarjeta, sin dinero, para siempre en free tier.**

---

## PASO 1: GITHUB — Ya eres dueño, no Fork (1 min) — GRATIS

- Link: https://github.com/adel02d/betting-bot
- Ya eres dueño, NO hagas Fork. Solo verifica que al entrar ves carpetas `agent/`, `config/`, `GUIA_...md`. Si aún ves "JavaScript 100%" y "Bot de apuestas Telegram", toca donde dice `main` arriba y selecciona `arena/01a016b5-betting-bot` o refresca la página deslizando hacia abajo. Ahora tu `main` ya tiene a Jose (lo actualicé para ti).

**Qué hacer:** Nada, solo verificar que ves Python y Jose. Tu repo ya está listo.

**Costo:** Gratis, sin tarjeta.

---

## PASO 2: GROQ — IA 100% GRATIS SIN TARJETA (3 min) — Reemplaza a Anthropic

**Anthropic pide tarjeta, Groq NO. Groq te da IA gratis super rápida.**

- **Link para sacar key gratis:** https://console.groq.com/keys
- **Qué hacer:**
  1.  Entra a https://console.groq.com → **Sign Up** con tu Gmail (no pide tarjeta, solo email)
  2.  Una vez dentro, ve a **API Keys** (izquierda) o directo https://console.groq.com/keys
  3.  Toca **Create API Key** → Nombre: `energixcu-jose` → Create
  4.  Te muestra key que empieza con `gsk_...` → **Copia completa** → Guarda en Notas de tu teléfono como `GROQ_API_KEY = gsk_...`
  5.  Groq te da gratis: 14,400 peticiones por día, 6,000 tokens por minuto, sin pagar. Para Jose sobra.

**Alternativa también gratis sin tarjeta:** OpenRouter
- Link: https://openrouter.ai/keys → Sign up con Gmail → Create Key → Copia `sk-or-...` → Modelos gratis con `:free` al final como `meta-llama/llama-3.1-8b-instruct:free`

**Qué acabas de hacer:** Sacaste cerebro gratis para Jose, sin tarjeta.

**Costo:** $0, sin tarjeta, para siempre.

---

## PASO 3: META CLOUD API — WhatsApp 100% GRATIS OFICIAL SIN TARJETA (5 min)

Whapi sandbox es gratis pero limitado. Meta Cloud API es oficial de WhatsApp, 1000 conversaciones gratis al mes, sin tarjeta, para siempre.

**Links Meta:**
- Principal: https://developers.facebook.com
- Mis Apps: https://developers.facebook.com/apps
- Documentación WhatsApp: https://developers.facebook.com/docs/whatsapp

**Qué hacer desde tu teléfono (Chrome → Versión para computadora):**

1.  Entra a https://developers.facebook.com → **Log In** con tu Facebook personal (si no tienes Facebook, créalo, es gratis)
2.  Arriba toca **My Apps** → **Create App**
3.  Pregunta tipo de app → Elige **Business** → Siguiente
4.  Nombre App: `EnergixCu Jose` → Email: tu Gmail → Business Account: Create new o selecciona si tienes → Create App
5.  Dentro de tu App, abajo verás **Add Products** → Busca **WhatsApp** → Toca **Set Up**
6.  Te lleva a **WhatsApp → API Setup**:
    - Verás **Phone Number ID** (número largo, ej: 123456789) → **Copia** → Guarda como `META_PHONE_NUMBER_ID`
    - Verás **Temporary Access Token** (empieza con `EAA...` largo) → **Copia** → Guarda como `META_ACCESS_TOKEN` (este token dura 24h, luego veremos cómo hacer permanente gratis, pero para probar sirve)
    - Verás **Test phone number** (número de prueba tipo +1555...). Puedes escribirle para probar

7.  **Crear Verify Token (tú lo inventas):**
    - Inventa token, ej: `energixcu-verify-2024` → Guarda como `META_VERIFY_TOKEN`

8.  **Token Permanente Gratis (para no tener que copiar cada 24h):**
    - Ve a https://business.facebook.com/settings/system-users
    - O dentro de Developers → Business Settings → System Users → Add → Nombre `energixcu-bot` → Role Admin → Add
    - Luego **Add Assets** → Apps → selecciona tu App EnergixCu Jose → Full Control
    - Luego **Generate New Token** → selecciona tu App → Marca `whatsapp_business_messaging`, `whatsapp_business_management` → Generate → Copia token permanente (empieza con `EAA...`) → Este es tu `META_ACCESS_TOKEN` permanente, guárdalo.

    *Si esto te parece complicado desde teléfono, usa el token temporal de 24h para probar hoy, mañana lo renuevas con 1 clic en API Setup → Generate new token.*

**Costo:** $0, sin tarjeta, Meta regala 1000 conversaciones gratis al mes.

**Alternativa 100% gratis sin configurar Meta (más fácil):** Sigue usando Whapi.cloud sandbox gratis (https://whapi.cloud) que no pide tarjeta para empezar. Luego migras a Meta.

---

## PASO 4: KOYEB — Servidor 24/7 100% GRATIS SIN TARJETA (5 min) — Reemplaza Railway que pide tarjeta

**Railway pide tarjeta, Koyeb NO.**

**Links Koyeb:**
- Principal: https://app.koyeb.com
- Nuevo servicio: https://app.koyeb.com/services/new
- Docs: https://www.koyeb.com/docs

**Opciones 100% gratis sin tarjeta:**
- **Koyeb (RECOMENDADO):** https://app.koyeb.com → 1 servicio gratis para siempre, 512MB RAM, sin tarjeta, solo GitHub
- **Hugging Face Spaces:** https://huggingface.co/new-space → 100% gratis sin tarjeta, Docker, sin límite tiempo
- **Replit:** https://replit.com → 100% gratis sin tarjeta, pero se duerme si no lo usan

**Qué hacer en Koyeb desde tu teléfono (Chrome → Versión computadora):**

1.  Entra a https://app.koyeb.com → **Sign Up** → **Continue with GitHub** → Autoriza con tu GitHub (el que es dueño de adel02d/betting-bot)
2.  Una vez dentro, toca **Create Service**
3.  Elige **GitHub** → Busca `adel02d/betting-bot` → Selecciónalo
4.  Branch: `main` (o `arena/01a016b5-betting-bot`, ambas tienen Jose, main ya lo actualicé)
5.  **Builder:** Selecciona **Buildpack** (no Dockerfile) → **Python**
6.  **Run command (MUY IMPORTANTE):** Escribe exactamente:
    ```
    uvicorn agent.main:app --host 0.0.0.0 --port 8000
    ```
7.  **Instance:** Deja **Eco** (gratis) → **e2-micro** (512MB, gratis)
8.  **Port:** `8000`
9.  **Environment Variables** → **Add Variable** → Agrega una por una (copia/pega):

```
LLM_PROVIDER = groq
GROQ_API_KEY = gsk_tu_key_del_paso_2
WHATSAPP_PROVIDER = meta
META_PHONE_NUMBER_ID = tu_id_del_paso_3
META_ACCESS_TOKEN = tu_token_EAA_del_paso_3
META_VERIFY_TOKEN = energixcu-verify-2024
ADMIN_PHONE = +5351234567 (TU número personal con +53)
PORT = 8000
ENVIRONMENT = production
```

10. Toca **Deploy** → Koyeb empieza Building → Espera 3-5 min → Cuando diga **Healthy** verde, toca el servicio → Arriba verás **URL** tipo `https://energixcu-jose-xxxxx.koyeb.app` → **CÓPIALA** → Guarda como `KOYEB_URL`

11. Tu webhook será: `https://TU-URL.koyeb.app/webhook` (agrega `/webhook`)

**Costo:** $0, sin tarjeta, Koyeb gratis para siempre con 1 servicio.

**Si Koyeb no te funciona, alternativa Hugging Face Spaces (también gratis sin tarjeta):**

- Link: https://huggingface.co/new-space
- Sign up con Gmail → Create new Space → Name: `energixcu-jose` → SDK: **Docker** → **Blank** → Create
- Luego sube tu código: puedes conectar GitHub o subir archivos desde teléfono (un poco más complejo). Mejor usa Koyeb que es más fácil desde móvil.

---

## PASO 5: CONECTAR WEBHOOK META (2 min) — 100% Gratis

**Link Meta Webhook:** https://developers.facebook.com → Tu App `EnergixCu Jose` → WhatsApp → Configuration

**Qué hacer:**

1.  Ve a https://developers.facebook.com → **My Apps** → **EnergixCu Jose**
2.  En menú izquierda → **WhatsApp** → **Configuration**
3.  Baja a **Webhooks** → Toca **Edit**
4.  **Callback URL:** Pega `https://TU-URL.koyeb.app/webhook` (tu URL de Koyeb + `/webhook`)
5.  **Verify Token:** Pega `energixcu-verify-2024` (el que inventaste en Paso 3)
6.  Toca **Verify and Save** → Si todo bien, dirá verificado verde
7.  Abajo en **Webhook fields** → Marca **messages** → **Subscribe**

**¿Qué acabas de hacer?** Le dijiste a Meta: "Cuando alguien escriba por WhatsApp, envía el mensaje a Koyeb donde vive Jose"

---

## PASO 6: PROBAR JOSE 100% GRATIS (1 min)

**Prueba 1 — Por WhatsApp real:**

- Si usas Meta test number: En API Setup de Meta, hay sección **To** → Agrega tu número personal (con +53) para probar → Te pedirá código WhatsApp → Verifícalo → Luego escribe desde tu WhatsApp al número de prueba de Meta (`+1555...` que te da Meta) mensaje `Hola` → Debe responder Jose

- Si usas Whapi con tu número conectado: Desde OTRO teléfono escribe a tu número: `Hola, que paneles tienen?`

**Prueba 2 — Sin WhatsApp, desde tu teléfono (más fácil):**

- Entra a `https://TU-URL.koyeb.app/admin/test` → Escribe teléfono `+5350000000` y mensaje `Hola, que paneles tienen?` → Enviar a Jose → Verás respuesta sin necesidad WhatsApp

**Si no responde:**

- Koyeb → tu servicio → **Logs** → Mira errores rojos
- Errores comunes:
  - `GROQ_API_KEY invalid` → Copiaste mal key de https://console.groq.com/keys
  - `META_ACCESS_TOKEN invalid` → Token expiró (los temporales duran 24h), genera nuevo en API Setup
  - `Webhook verification failed` → Verify Token no coincide: en Koyeb es `energixcu-verify-2024` y en Meta también debe ser `energixcu-verify-2024` igualito

**Costo:** $0

---

## PASO 7: ACTUALIZAR CATÁLOGO SOLO CON MENSAJE WHATSAPP (Sin PC, Gratis)

**Opción A — Por WhatsApp (desde tu número admin):**

Envía a tu bot:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1
- Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W - $900 USD - MPPT 100A WiFi
```

Jose responde `✅ Catálogo actualizado...` → Activo para clientes.

También funciona:
- `Panel Solar 600W $320 USD / 80000 CUP` (una línea)
- `- Panel 600W $320` (si tu número es admin)

**Opción B — Por web desde teléfono:**

- `https://TU-URL.koyeb.app/admin` → Formulario grande → pega lista → Actualizar

**Costo:** $0

---

## PASO 8: TICKET TE LLEGA POR WHATSAPP GRATIS A TI

Cuando cliente completa compra, **tú recibes automático** en tu ADMIN_PHONE por WhatsApp:

```
🔔 ¡NUEVO PEDIDO ENERGIXCU! 🔔

⚡ TICKET DE PEDIDO - ENERGIXCU ⚡
- Cliente: Juan Pérez
...

📞 Cliente WhatsApp: +53...
```

Ver todos: `https://TU-URL.koyeb.app/admin/pedidos`

**Costo:** $0, Meta no cobra por recibir mensajes, solo por conversaciones iniciadas por ti (primeras 1000 gratis al mes).

---

## 📋 RESUMEN LINKS 100% GRATIS SIN TARJETA

| Para qué | Link | Qué hacer |
|----------|------|-----------|
| Tu código | https://github.com/adel02d/betting-bot | Verificar que ves Python, no JavaScript |
| IA Gratis sin tarjeta | https://console.groq.com/keys | Sign up Gmail → Create API Key → copiar gsk_... |
| IA Alternativa gratis | https://openrouter.ai/keys | Sign up → Create Key → modelo :free |
| WhatsApp Gratis sin tarjeta | https://developers.facebook.com | Create App → Business → Add WhatsApp product |
| WhatsApp Token Meta | https://developers.facebook.com/apps → Tu App → WhatsApp → API Setup | Copiar Phone Number ID y Access Token |
| Webhook Meta | Dentro de tu App → WhatsApp → Configuration | Pegar https://TU-URL.koyeb.app/webhook + Verify Token |
| Servidor Gratis sin tarjeta (RECOMENDADO) | https://app.koyeb.com | Sign up con GitHub → Create Service → GitHub repo adel02d/betting-bot → Variables → Deploy → copiar URL |
| Servidor Alternativo Gratis | https://huggingface.co/new-space | Create Space → Docker → Blank |
| Servidor Alternativo Gratis | https://replit.com | Import from GitHub |
| Tu bot vivo | https://TU-URL.koyeb.app/ | Debe decir {"status":"ok","agent":"Jose"} |
| Panel Admin teléfono | https://TU-URL.koyeb.app/admin | Actualizar catálogo con formulario |
| Ver pedidos teléfono | https://TU-URL.koyeb.app/admin/pedidos | Tabla con todos los tickets |
| Probar Jose sin WhatsApp | https://TU-URL.koyeb.app/admin/test | Escribir como cliente |
| Whapi alternativa fácil gratis | https://whapi.cloud | Si Meta te parece complejo, Whapi sandbox gratis sin tarjeta |

---

## ❓ ¿Y SI NO TENGO FACEBOOK?

- Crea uno gratis en https://facebook.com → Solo necesitas para Developers, no tienes que usarlo personal.

## ❓ ¿GROQ DE VERDAD ES GRATIS SIN TARJETA?

- Sí. Ve a https://console.groq.com → Sign up → No pide tarjeta nunca. Te da 14,400 requests por día gratis. Para EnergixCu con 20-50 clientes al día sobra. Cuando se acaba, esperas 24h y se renueva. 100% gratis.

## ❓ ¿META WHATSAPP DE VERDAD GRATIS?

- Sí. Meta da 1000 conversaciones de servicio gratis al mes (cuando cliente te escribe primero, es servicio). Solo pagas si TÚ inicias conversación a cliente que no te ha escrito en 24h. Para tu caso (cliente te escribe, tu respondes ticket), entra en gratis. Sin tarjeta.

## ❓ ¿KOYEB DE VERDAD GRATIS SIN TARJETA?

- Sí. Koyeb free tier: 1 servicio Eco 512MB gratis para siempre, sin tarjeta, solo GitHub account. Se suspende después 24h sin uso, se despierta solo cuando llega mensaje (tarda 30 seg primer mensaje). Para bot pequeño perfecto.

---

## ✅ CHECKLIST 100% GRATIS

- [ ] Veo Python en https://github.com/adel02d/betting-bot (no JavaScript)
- [ ] Tengo GROQ_API_KEY de https://console.groq.com/keys (empieza con gsk_)
- [ ] Tengo META_PHONE_NUMBER_ID y META_ACCESS_TOKEN de https://developers.facebook.com
- [ ] Deploy en https://app.koyeb.com con 9 Variables, status Healthy verde
- [ ] Copié KOYEB_URL y webhook https://.../webhook
- [ ] Webhook en Meta verificado verde
- [ ] Escribí "Hola" a mi bot y Jose respondió (por WhatsApp o /admin/test)
- [ ] Envié "Productos Nuevos del Día: - Panel 600W $320" desde mi admin y respondió "Catálogo actualizado"
- [ ] Entré a /admin/pedidos y veo tabla (aunque vacía)

Si todo marcado, ¡Jose vendiendo 24/7 100% gratis sin tarjeta ni un centavo! 🎉

---

**Plantilla lista para copiar desde tu teléfono ahora mismo (100% gratis):**

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Híbrido 6000W 48V - $900 USD / 230000 CUP - MPPT 100A WiFi
```

¿En qué paso te quedas? Dime número y qué ves.
