# ✅ SOLUCIÓN A TU CAPTURA — Ya eres dueño del repo, no necesitas Fork

Viste este mensaje en GitHub:
> **"You own adel02d/betting-bot and are not a member of any organizations"** al tocar Fork

**¿Qué significa?** Que **NO puedes hacer Fork de tu propio repositorio**. Fork es solo para copiar repos de otras personas. Como tú eres el dueño de `adel02d/betting-bot`, GitHub te dice que no puedes forkeadero a ti mismo.

**¿Es un error?** No, es normal. Y ya te lo arreglé.

---

## 🔧 Qué hice por ti

Acabo de **actualizar tu rama `main`** con el código de Jose (EnergixCu). Antes tu `main` tenía el viejo Bot de apuestas Telegram (JavaScript 100% que viste en la captura). Ahora tu `main` ya tiene a Jose en Python.

**Haz esto en tu teléfono ahora:**

1.  Abre Chrome → Ve a `https://github.com/adel02d/betting-bot`
2.  **Refresca la página** deslizando hacia abajo (pull to refresh)
3.  Ahora arriba donde decía "JavaScript 100%" debe decir **"Python 84% + ..."** y la descripción **"EnergixCu — WhatsApp AI Agent (Jose)"** o verás carpetas `agent/`, `config/`, `GUIA_...md`
4.  Si aún ves "Bot de apuestas deportivas Telegram" y "JavaScript 100%", toca donde dice `main` (branch) y selecciona `arena/01a016b5-betting-bot` o simplemente espera 1 minuto y refresca otra vez. GitHub tarda en actualizar.

¡Ahora ya no necesitas Fork! Usarás tu propio repo directo.

---

## 📱 GUÍA REESCRITA PARA TI (Dueño del repo, solo teléfono, sin Fork)

### LINKS EXACTOS QUE USARÁS (Guárdalos en Notas)

1.  Tu repo (ya con Jose): https://github.com/adel02d/betting-bot
2.  Ver ramas: https://github.com/adel02d/betting-bot/branches
3.  Crear Pull Request (si necesitas unir ramas): https://github.com/adel02d/betting-bot/compare/main...arena/01a016b5-betting-bot
4.  IA Claude: https://platform.anthropic.com
5.  Sacar Key IA: https://platform.anthropic.com/settings/keys
6.  WhatsApp Whapi: https://whapi.cloud
7.  Token Whapi: https://whapi.cloud/api
8.  Conectar tu número: https://whapi.cloud/channels
9.  Webhook Whapi: https://whapi.cloud/settings/webhooks
10. Servidor Railway: https://railway.app/new (para deploy)
11. Dashboard Railway: https://railway.app/dashboard
12. Alternativa sin tarjeta: https://dashboard.render.com

---

### PASO 1: VERIFICA QUE VES A JOSE (30 seg)

- Link: https://github.com/adel02d/betting-bot
- ¿Qué debes ver ahora? Carpetas: `agent/`, `config/`, `knowledge/`, `data/`, archivos `GUIA_TELEFONO.md`, `requirements.txt`, `README.md` con "EnergixCu".
- Si ves `src/database.js` y `src/index.js` (viejo bot apuestas), **refresca** o cambia branch a `arena/01a016b5-betting-bot` arriba donde dice `main`.

**YA NO HAGAS FORK.** Usa este repo directo.

---

### PASO 2: API KEY ANTHROPIC (4 min)

- Link: https://platform.anthropic.com/settings/keys
- Toca **Create Key** → Nombre `energixcu-jose` → Copia `sk-ant-api03-...` → Guarda en Notas como `ANTHROPIC_KEY`

---

### PASO 3: WHAPI TOKEN (3 min)

- Link: https://whapi.cloud → Login con Google
- Link token: https://whapi.cloud/api → Copia token → Guarda como `WHAPI_TOKEN`
- Link conectar número: https://whapi.cloud/channels → Add Channel → QR → Abre WhatsApp → Dispositivos vinculados → Vincular → Escanea QR

---

### PASO 4: RAILWAY — Deploy sin Fork, con tu propio repo (5 min)

Este paso cambia porque NO harás Fork:

1.  Link: https://railway.app/new → Login with GitHub (autoriza)
2.  **Deploy from GitHub repo**
3.  En buscador escribe `betting-bot` → Debe aparecer `adel02d/betting-bot` (tu repo, no necesitas fork) → Selecciónalo
4.  Si te pregunta **Branch**, elige `main` (ahora main ya tiene a Jose). Si ves `arena/01a016b5-betting-bot`, también sirve, es la misma.
5.  Railway empieza Building 2-3 min
6.  Toca el servicio → **Variables** → + New Variable, agrega 6:

```
ANTHROPIC_API_KEY = tu sk-ant-...
WHATSAPP_PROVIDER = whapi
WHAPI_TOKEN = tu token whapi
ADMIN_PHONE = +5351234567 (TU número con +53)
PORT = 8000
ENVIRONMENT = production
```

7.  **Sacar URL:** Settings → Networking → Generate Domain → Copia `https://betting-bot-production-xxxx.up.railway.app` → Tu webhook será `https://TU-URL.up.railway.app/webhook`

**Si Railway pide tarjeta:** Usa https://dashboard.render.com → New Web Service → conecta `adel02d/betting-bot` → Build `pip install -r requirements.txt` → Start `uvicorn agent.main:app --host 0.0.0.0 --port 10000` → mismas Variables.

---

### PASO 5: WEBHOOK (2 min)

- Link: https://whapi.cloud/settings/webhooks
- Pega: `https://TU-URL.up.railway.app/webhook`
- Método POST → Save

---

### PASO 6: PROBAR

- Desde OTRO teléfono escribe a tu número bot: `Hola, que paneles tienen?`
- O desde tu teléfono entra a `https://TU-URL.up.railway.app/admin/test` → Prueba sin WhatsApp
- Para ver si está vivo: `https://TU-URL.up.railway.app/` → debe decir `{"status":"ok","agent":"Jose"}`

---

### PASO 7: ACTUALIZAR CATÁLOGO POR MENSAJE (Sin PC)

Desde tu número admin, envía WhatsApp a tu bot:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1
- Batería 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh
```

Jose responde `✅ Catálogo actualizado...` y ya está activo para clientes.

O por web: `https://TU-URL.up.railway.app/admin` → formulario grande → pegar lista → Actualizar.

---

### PASO 8: TICKET TE LLEGA POR WHATSAPP

Cuando cliente completa compra, **tú recibes automáticamente en tu ADMIN_PHONE**:

```
🔔 ¡NUEVO PEDIDO ENERGIXCU! 🔔

⚡ TICKET DE PEDIDO - ENERGIXCU ⚡
- Cliente: Juan Pérez
- Producto: Panel 550W...
...
📞 Cliente WhatsApp: +53...
```

Ver todos: `https://TU-URL.up.railway.app/admin/pedidos`

---

## ❓ ¿Por qué te salía ese mensaje de "You own..."?

Porque tocaste **Fork** en tu propio repo. GitHub no te deja forkeadero a ti mismo. La solución es NO usar Fork, usar tu repo directo `adel02d/betting-bot` que ya tiene a Jose en `main` (lo acabo de actualizar para ti).

Si en Railway buscabas `betting-bot` y no te salía nada, ahora sí te saldrá porque main ya tiene código Python y Railway detecta tech stack.

**Refresca GitHub y Railway y vuelve a intentar.**

¿En qué paso te quedas ahora? Dime qué ves en https://github.com/adel02d/betting-bot (¿ves Python o JavaScript?)
