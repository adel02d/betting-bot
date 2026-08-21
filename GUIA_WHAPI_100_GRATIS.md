# 📱 GUIA DEFINITIVA 100% GRATIS SIN TARJETA USANDO WHAPI (Solo teléfono)

**Stack 100% gratis sin tarjeta ni dinero, usando Whapi como pediste:**

- **Código:** GitHub (gratis) — https://github.com/adel02d/betting-bot
- **IA:** Groq (gratis sin tarjeta) — https://console.groq.com/keys
- **WhatsApp:** Whapi.cloud (gratis sin tarjeta, sandbox) — https://whapi.cloud
- **Servidor:** Koyeb (gratis sin tarjeta, 1 servicio gratis) — https://app.koyeb.com

**Costo: $0 — Ticket te llega por WhatsApp a tu ADMIN_PHONE automático.**

---

## PASO 1: GITHUB — Ya eres dueño, no Fork (1 min)

Tu repo ya tiene a Jose en `main` (lo actualicé). Entra a https://github.com/adel02d/betting-bot en Chrome y refresca. Debes ver carpetas `agent/`, `config/`, archivo `GUIA_WHAPI_100_GRATIS.md`. Si ves "JavaScript 100% - Bot apuestas", toca arriba donde dice `main` y cambia a `arena/01a016b5-betting-bot` o refresca de nuevo. **NO hagas Fork**, eres dueño, no puedes forkearete a ti mismo (por eso te salía "You own adel02d/betting-bot...").

---

## PASO 2: GROQ — IA 100% GRATIS SIN TARJETA (3 min) — Reemplaza Anthropic que pide tarjeta

**Link:** https://console.groq.com/keys

1.  Entra a https://console.groq.com → Sign Up con Gmail (NO pide tarjeta nunca, solo email)
2.  Ve a https://console.groq.com/keys → Create API Key → Nombre `energixcu-jose` → Create
3.  Copia `gsk_...` largo → Guarda en Notas como `GROQ_API_KEY`

**Límite gratis:** 14,400 peticiones por día, 6,000 tokens/min, sin pagar. Para tu tienda sobra.

---

## PASO 3: WHAPI — WhatsApp 100% GRATIS SIN TARJETA (3 min) — Como pediste

**Links Whapi:**
- Registro: https://whapi.cloud
- Tu Token: https://whapi.cloud/api
- Conectar tu número (QR): https://whapi.cloud/channels
- Webhook (unir con servidor): https://whapi.cloud/settings/webhooks

**Qué hacer desde tu teléfono:**

1.  **Registro:** Entra a https://whapi.cloud → Start Free → Sign Up con Google → Te lleva al Dashboard
2.  **Sacar Token:** Ve a https://whapi.cloud/api → Verás **API Token** Ej: `s4d5f6...` → Copia → Guarda en Notas como `WHAPI_TOKEN`
3.  **Conectar tu número personal para que sea bot (gratis sin comprar número):**
    - Ve a https://whapi.cloud/channels → **Add Channel** o **New Channel** → Elige **QR Code** o **Use my phone**
    - Te muestra un **QR gigante**
    - Abre **WhatsApp** en tu teléfono → **Ajustes / Configuración** → **Dispositivos vinculados** → **Vincular un dispositivo** → Escanea el QR de la pantalla de Whapi
    - Espera 20 seg → Whapi dirá **Connected** verde → ¡Tu número de WhatsApp ya es el bot! (Sigue funcionando normal para ti, pero ahora Jose responde automático)
4.  **Si no quieres conectar tu número aún (prueba con número de prueba gratis):**
    - Whapi te da un número sandbox `+1415...` gratis. Ve a Channels → verás número. Puedes escribirle a ese número para probar sin tocar tu número real. Luego conectas el tuyo.

**Costo Whapi:** Sandbox gratis sin tarjeta, 100 mensajes gratis aprox. Luego si quieres más, desde $5/mes pero puedes seguir con sandbox renovando o creando otro canal gratis. Para empezar 100% gratis.

---

## PASO 4: KOYEB — Servidor 24/7 100% GRATIS SIN TARJETA (5 min) — Reemplaza Railway que pide tarjeta

**Links Koyeb:**
- Principal: https://app.koyeb.com
- Nuevo servicio: https://app.koyeb.com/services/new

**Qué hacer en tu teléfono (Chrome → Versión computadora):**

1.  Entra a https://app.koyeb.com → Sign Up → **Continue with GitHub** → Autoriza tu GitHub `adel02d`
2.  Toca **Create Service**
3.  Elige **GitHub** → Busca `adel02d/betting-bot` → Selecciónalo → Branch `main` (ya tiene a Jose)
4.  Builder: **Buildpack** → **Python**
5.  Run command (IMPORTANTE, copia exacto):
    ```
    uvicorn agent.main:app --host 0.0.0.0 --port 8000
    ```
6.  Instance: **Eco** → **e2-micro** (512MB, gratis para siempre, sin tarjeta)
7.  Port: `8000`
8.  **Environment Variables** → Add Variable → Agrega UNA POR UNA:

```
LLM_PROVIDER = groq
GROQ_API_KEY = gsk_tu_key_de_Groq_del_Paso_2
WHATSAPP_PROVIDER = whapi
WHAPI_TOKEN = tu_token_de_Whapi_del_Paso_3
ADMIN_PHONE = +5351234567 (TU número personal con +53, donde recibirás tickets de pedidos)
PORT = 8000
ENVIRONMENT = production
```

9.  Toca **Deploy** → Building 3-5 min → Cuando diga **Healthy** verde, toca tu servicio → Copia **URL** tipo `https://energixcu-jose-xxxxx.koyeb.app` → Guarda como `KOYEB_URL`
10. Tu webhook será: `https://TU-URL.koyeb.app/webhook` (agrega `/webhook` al final)

**Alternativas 100% gratis sin tarjeta si Koyeb falla:**
- https://huggingface.co/new-space → Create Space → Docker → Blank
- https://replit.com → Import from GitHub → adel02d/betting-bot

---

## PASO 5: CONECTAR WEBHOOK WHAPI (2 min) — Unir WhatsApp con Koyeb

**Link:** https://whapi.cloud/settings/webhooks

1.  Ve a https://whapi.cloud/settings/webhooks → Login
2.  Campo **Webhook URL:** pega `https://TU-URL.koyeb.app/webhook` (tu URL de Koyeb + /webhook)
3.  Método: **POST**
4.  Events: marca **Messages** o All
5.  Save / Enable → Debe decir Active verde

**¿Qué hace?** Le dices a Whapi: "Cuando llegue un WhatsApp, reenvíalo a Koyeb donde vive Jose"

---

## PASO 6: PROBAR JOSE (1 min) — 100% Gratis

**Prueba con WhatsApp real:**
- Si conectaste tu número: Desde OTRO teléfono (familiar) escribe por WhatsApp a tu número: `Hola, que paneles tienen?` → Debe responder Jose en 3-5 seg.
- Si usas número prueba Whapi: En Whapi → Channels → verás número sandbox `+1415...` → Escribe a ese número desde tu WhatsApp.

**Prueba sin WhatsApp (desde tu teléfono, más fácil):**
- Entra a `https://TU-URL.koyeb.app/admin/test` → Teléfono `+5350000000` → Mensaje `Hola, que paneles tienen?` → Enviar a Jose → Verás respuesta sin WhatsApp.

**Si no responde:**
- Koyeb → Logs → Mira rojo → Si dice `GROQ_API_KEY invalid` → copiaste mal key
- Si dice `WHAPI_TOKEN not configured` → no pusiste token en Variables
- Si en `/admin/test` sí responde pero no por WhatsApp → Webhook mal: revisa PASO 5

**Ver si está vivo:** `https://TU-URL.koyeb.app/` → debe decir `{"status":"ok","agent":"Jose"}`

---

## PASO 7: ACTUALIZAR CATÁLOGO SOLO CON MENSAJE WHATSAPP (Sin PC, Gratis)

**Desde tu ADMIN_PHONE, envía WhatsApp a tu bot:**

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial
- Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W - $900 USD - MPPT 100A WiFi
```

**Reglas teléfono:**
- Primera línea: `Productos Nuevos del Día:`
- Cada producto línea nueva con `-`
- Pon `$` y `CUP` para extraer precio solo

Jose responde:
```
✅ ¡Catálogo actualizado con 3 productos! 📦
• Panel 600W...
Ya están activos...
```

**También funciona una sola línea:**
```
Panel Solar 600W Bifacial $320 USD / 80000 CUP
```

**Por web desde teléfono:** `https://TU-URL.koyeb.app/admin` → formulario grande → pegar lista → Actualizar

Agrega a pantalla inicio: Chrome → abre `/admin` → 3 puntitos → Agregar a pantalla de inicio → App EnergixCu.

---

## PASO 8: TICKET TE LLEGA POR WHATSAPP GRATIS

Cuando cliente da 5 datos, Jose genera ticket y hace 2 envíos **automático**:

1. **Cliente recibe:**
```
--------------------------------------------------
⚡ TICKET DE PEDIDO - ENERGIXCU ⚡
- Cliente: Juan Pérez
- Producto: Panel 550W Tier1
- Cantidad: 2
- Dirección: Calle 23 #456 Vedado
- Forma de pago: Efectivo
--------------------------------------------------
¡Listo! Tu pedido registrado...
```

2. **TÚ en ADMIN_PHONE recibes al mismo tiempo:**
```
🔔 ¡NUEVO PEDIDO ENERGIXCU! 🔔

[TICKET IGUAL]

📞 Cliente WhatsApp: +53...
👤 Nombre: Juan
🕐 Fecha: 2026-08-18 22:30
✅ Acción: Contactar cliente. Ver en /admin/pedidos
```

Código en `agent/main.py` función `notificar_admin_nuevo_pedido()` usa Whapi para enviarte. Si ADMIN_PHONE = mismo número que cliente, no se auto-notifica para evitar spam.

Ver todos pedidos: `https://TU-URL.koyeb.app/admin/pedidos` desde tu teléfono.

---

## 📋 LINKS RESUMEN 100% GRATIS WHAPI

| Para qué | Link exacto | Qué hacer |
|----------|-------------|-----------|
| Tu código | https://github.com/adel02d/betting-bot | Refrescar, ver Python, no Fork |
| IA Gratis sin tarjeta | https://console.groq.com/keys | Sign up Gmail → Create Key → copiar gsk_... |
| WhatsApp Gratis sin tarjeta Token | https://whapi.cloud/api | Copia Token |
| WhatsApp Conectar tu número QR | https://whapi.cloud/channels | Add Channel → QR → Escanear con WhatsApp → Connected |
| WhatsApp Webhook | https://whapi.cloud/settings/webhooks | Pegar https://TU-URL.koyeb.app/webhook POST Save |
| Servidor Gratis sin tarjeta | https://app.koyeb.com | Sign up GitHub → Create Service → adel02d/betting-bot → Variables → Deploy → copiar URL |
| Crear servicio Koyeb | https://app.koyeb.com/services/new | Link directo |
| Bot vivo | https://TU-URL.koyeb.app/ | Debe decir ok agent Jose |
| Panel admin teléfono | https://TU-URL.koyeb.app/admin | Actualizar catálogo con formulario |
| Ver pedidos | https://TU-URL.koyeb.app/admin/pedidos | Tabla tickets |
| Probar sin WhatsApp | https://TU-URL.koyeb.app/admin/test | Escribir como cliente |
| Alternativa servidor gratis | https://huggingface.co/new-space | Si Koyeb falla |

---

## ✅ CHECKLIST 100% GRATIS WHAPI

- [ ] Veo Python en https://github.com/adel02d/betting-bot (no JavaScript)
- [ ] Tengo GROQ_API_KEY de https://console.groq.com/keys (gsk_...)
- [ ] Tengo WHAPI_TOKEN de https://whapi.cloud/api
- [ ] Conecté mi número en https://whapi.cloud/channels (QR escaneado, Connected verde)
- [ ] Deploy en Koyeb https://app.koyeb.com con 7 Variables, Healthy verde, copié URL
- [ ] Webhook https://whapi.cloud/settings/webhooks con https://TU-URL.koyeb.app/webhook POST Active
- [ ] Escribí Hola a mi bot y respondió Jose
- [ ] Envié "Productos Nuevos del Día: - Panel 600W $320" desde admin y respondió "Catálogo actualizado"
- [ ] Probé compra completa y me llegó ticket a mi ADMIN_PHONE por WhatsApp
- [ ] Entré a /admin/pedidos y veo pedidos

Si todo marcado, ¡Jose vendiendo 24/7 100% gratis con Whapi sin tarjeta! 🎉

**Plantilla lista para copiar:**

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1
- Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W 48V - $900 USD / 230000 CUP - MPPT 100A WiFi
```
