# 💯 GUÍA 100% GRATIS SIN TARJETA Y SIN API GROQ — SOLO WHAPI + TELEFONO (CUBA)

**Entiendo: Tampoco puedes crear API de Groq (bloqueo por Cuba). ¡No hay problema! Ahora Jose funciona SIN NINGUNA API DE IA, 100% gratis, solo con tu teléfono y Whapi.**

---

## 🆓 NUEVO STACK 100% GRATIS QUE FUNCIONA EN CUBA SIN BLOQUEO

| Para qué | Antes pedía API | Ahora (SIN API, funciona en Cuba) | Link | Tarjeta? |
|----------|----------------|-----------------------------------|------|----------|
| **Tu código** | GitHub | **GitHub (gratis)** | https://github.com/adel02d/betting-bot | No |
| **IA** | Groq/Anthropic (bloqueado en Cuba) | **MODO FREE sin IA, con reglas inteligentes y tu catálogo (funciona offline, sin API, sin bloqueo)** | No necesitas link | No |
| **WhatsApp** | Whapi | **Whapi.cloud (gratis, sin tarjeta, funciona en Cuba, sandbox)** | https://whapi.cloud | No |
| **Servidor** | Koyeb/Railway | **Koyeb (gratis, sin tarjeta)** | https://app.koyeb.com | No |

**Costo total: $0 — Sin tarjeta, sin API, sin Groq, sin bloqueo, solo teléfono.**

### ¿Cómo funciona sin IA?

Actualicé `agent/brain.py` con modo FREE inteligente que no necesita Groq ni Anthropic:
- Detecta saludo, catálogo, productos, cálculo de kit, forma de pago, intención de compra
- Busca en tu catálogo local `config/business.yaml` y `data/catalog.json`
- Calcula kit según consumo (nevera, ventiladores, etc)
- Pide 5 datos y genera ticket oficial con `generar_ticket_pedido`
- Te notifica a ti por WhatsApp cuando hay pedido

Es menos conversacional que Claude/Groq, pero **vende igual y funciona 100% en Cuba sin VPN ni API**.

Si en el futuro consigues Groq con VPN, solo agregas `GROQ_API_KEY` en Variables y cambia a `LLM_PROVIDER=groq` y se vuelve más inteligente solo.

---

## PASO 1: GITHUB — Ya eres dueño (1 min)

- Link: https://github.com/adel02d/betting-bot → Refresca → Debes ver carpetas `agent/`, `GUIA_WHAPI_SIN_API.md`, `requirements.txt`. Si ves "JavaScript 100% - Bot apuestas", cambia branch arriba de `main` a `arena/...` o espera 1 min y refresca. Ya actualicé tu `main` con Jose.

No hagas Fork, eres dueño.

---

## PASO 2: WHAPI — WhatsApp 100% GRATIS SIN TARJETA (3 min)

**Links Whapi:**
- Registro: https://whapi.cloud
- Token: https://whapi.cloud/api
- Conectar tu número QR: https://whapi.cloud/channels
- Webhook: https://whapi.cloud/settings/webhooks

**Desde tu teléfono:**

1.  https://whapi.cloud → Start Free → Sign Up con Gmail
2.  https://whapi.cloud/api → Copia **API Token** → Guarda en Notas como `WHAPI_TOKEN`
3.  https://whapi.cloud/channels → Add Channel → QR → Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo → Escanea QR → Connected verde → Tu número ya es bot
4.  Si no quieres conectar tu número: Whapi te da número sandbox `+1415...` gratis para probar

---

## PASO 3: KOYEB — Servidor 100% GRATIS SIN TARJETA Y SIN BLOQUEO CUBA (5 min)

**Links:**
- Principal: https://app.koyeb.com
- Nuevo servicio: https://app.koyeb.com/services/new

**Qué hacer:**

1.  https://app.koyeb.com → Sign Up → Continue with GitHub → Autoriza
2.  Create Service → GitHub → `adel02d/betting-bot` → Branch `main`
3.  Builder: **Buildpack → Python**
4.  Run command: `uvicorn agent.main:app --host 0.0.0.0 --port 8000`
5.  Instance: **Eco e2-micro** (gratis)
6.  Port: `8000`
7.  **Variables (SOLO 5, SIN API IA):**

```
WHATSAPP_PROVIDER = whapi
WHAPI_TOKEN = tu_token_de_https://whapi.cloud/api
ADMIN_PHONE = +5351234567 (TU número con +53 donde recibirás tickets)
LLM_PROVIDER = free
PORT = 8000
ENVIRONMENT = production
```

¡No necesitas `GROQ_API_KEY` ni `ANTHROPIC_API_KEY`! Deja `LLM_PROVIDER=free` y funciona sin IA.

8.  Deploy → Healthy verde → Copia URL `https://...koyeb.app` → Webhook será `https://TU-URL.koyeb.app/webhook`

**Alternativas gratis sin tarjeta si Koyeb falla:**
- https://huggingface.co/new-space → Docker
- https://replit.com → Import GitHub

---

## PASO 4: CONECTAR WEBHOOK WHAPI (2 min)

- Link: https://whapi.cloud/settings/webhooks
- Pega `https://TU-URL.koyeb.app/webhook` → POST → Save → Active verde

---

## PASO 5: PROBAR JOSE SIN API (1 min)

- Desde OTRO teléfono escribe a tu número bot: `Hola`
- Debe responder: "¡Hola! 👋 Soy Jose de EnergixCu ⚡..."
- Sin WhatsApp: `https://TU-URL.koyeb.app/admin/test` → Escribe `catalogo` → te muestra catálogo
- Vivo?: `https://TU-URL.koyeb.app/` → `{"status":"ok","agent":"Jose","llm":"free"}`

**Modo FREE que funciona sin API:**

- Escribe `catalogo` → te da catálogo completo
- Escribe `panel 550` → te busca panel 550W con precio
- Escribe `nevera, 2 ventiladores y 5 luces` → te calcula kit (Básico 1kW, Intermedio 3kW, Pro 5kW)
- Escribe `quiero comprar panel 550W` → te pide 5 datos con plantilla
- Escribe:
```
Nombre: Juan Pérez
Producto: Panel Solar 550W Tier1
Cantidad: 2
Dirección: Calle 23 #456 Vedado Plaza referencia parque
Forma de pago: Efectivo
```
→ Te genera ticket oficial y te lo envía a ti por WhatsApp a ADMIN_PHONE

**Todo sin crear API Groq, sin tarjeta, sin VPN, funciona en Cuba porque no llama a ninguna API bloqueada de USA (solo Whapi que sí funciona).**

---

## PASO 6: ACTUALIZAR CATÁLOGO POR MENSAJE (Sin PC)

Desde tu ADMIN_PHONE envía WhatsApp a tu bot:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP
- Batería 48V 150Ah - $1600 USD / 400000 CUP
```

Jose: `✅ Catálogo actualizado...`

O por web: `https://TU-URL.koyeb.app/admin`

---

## PASO 7: TICKET TE LLEGA POR WHATSAPP

Cuando cliente envía 5 datos, tú recibes en ADMIN_PHONE:

```
🔔 ¡NUEVO PEDIDO ENERGIXCU! 🔔

⚡ TICKET DE PEDIDO - ENERGIXCU ⚡
- Cliente: Juan...
...
📞 Cliente WhatsApp: +53...
```

Ver todos: `https://TU-URL.koyeb.app/admin/pedidos`

---

## 📋 LINKS RESUMEN SIN API, SIN TARJETA, WHAPI

| Para qué | Link | Qué hacer |
|----------|------|-----------|
| Tu código | https://github.com/adel02d/betting-bot | Refrescar, ver Python |
| WhatsApp Gratis | https://whapi.cloud | Sign Up Gmail |
| Token Whapi | https://whapi.cloud/api | Copiar Token |
| Conectar número QR | https://whapi.cloud/channels | Add Channel → QR → Escanear con WhatsApp |
| Webhook Whapi | https://whapi.cloud/settings/webhooks | Pegar https://TU-URL.koyeb.app/webhook POST |
| Servidor Gratis | https://app.koyeb.com | Sign Up GitHub → Create Service → adel02d/betting-bot → Variables (5) → Deploy → copiar URL |
| Bot vivo | https://TU-URL.koyeb.app/ | Debe decir ok agent Jose llm free |
| Panel admin | https://TU-URL.koyeb.app/admin | Actualizar catálogo con formulario |
| Ver pedidos | https://TU-URL.koyeb.app/admin/pedidos | Tabla tickets |
| Probar sin WhatsApp | https://TU-URL.koyeb.app/admin/test | Escribir como cliente |

---

## ❓ ¿Y SI LUEGO CONSIGO API GROQ CON VPN?

Solo ve a Koyeb → Variables → Agrega:

```
LLM_PROVIDER = groq
GROQ_API_KEY = gsk_...
```

Guarda → Redeploy → Jose se vuelve más conversacional con IA, pero sigue funcionando igual para ventas.

---

## ✅ CHECKLIST SIN API, SIN TARJETA, WHAPI

- [ ] Veo Python en https://github.com/adel02d/betting-bot
- [ ] Tengo WHAPI_TOKEN de https://whapi.cloud/api
- [ ] Conecté mi número en https://whapi.cloud/channels (QR escaneado Connected verde)
- [ ] Deploy en https://app.koyeb.com con 5 Variables (WHATSAPP_PROVIDER=whapi, WHAPI_TOKEN, ADMIN_PHONE, LLM_PROVIDER=free, PORT=8000) Healthy verde
- [ ] Webhook https://whapi.cloud/settings/webhooks con https://TU-URL.koyeb.app/webhook POST Active
- [ ] Escribí Hola a mi bot y respondió Jose modo free sin IA
- [ ] Escribí catalogo y me dio catálogo
- [ ] Escribí quiero comprar panel 550W y me pidió 5 datos
- [ ] Envié 5 datos con Efectivo y me generó ticket y me llegó a mi ADMIN_PHONE por WhatsApp
- [ ] Envié Productos Nuevos del Día: - Panel 600W $320 desde admin y respondió Catálogo actualizado

Si todo marcado, ¡Jose vendiendo 24/7 100% gratis sin tarjeta, sin API Groq, sin bloqueo Cuba, solo Whapi y teléfono! 🎉
