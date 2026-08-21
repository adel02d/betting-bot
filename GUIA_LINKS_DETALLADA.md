# 🔗 GUIA CON LINKS EXACTOS — Qué hacer en cada lugar (Solo teléfono)

Esta guía te dice **exactamente a qué link entrar, qué botón tocar y qué copiar** para que Jose funcione. Todo desde tu teléfono.

---

## 📋 LISTA DE LINKS QUE VAS A USAR

Guarda estos links en tus Notas:

1.  **GitHub (tu copia del código):**
    - Principal: https://github.com
    - Tu repo fork: `https://github.com/TU-USUARIO/betting-bot` (reemplaza TU-USUARIO con tu nombre de GitHub)

2.  **Inteligencia Artificial (Anthropic Claude):**
    - Registro: https://platform.anthropic.com
    - Crear API Key (Tienes que entrar aquí para copiar la key): https://platform.anthropic.com/settings/keys
    - Documentación: https://docs.anthropic.com

3.  **WhatsApp Conexión (Whapi.cloud - RECOMENDADO):**
    - Registro y Dashboard: https://whapi.cloud
    - Tu Token: https://whapi.cloud/api
    - Conectar tu número: https://whapi.cloud/channels  → Aquí escaneas QR con WhatsApp
    - Webhook (donde pegas tu URL): https://whapi.cloud/settings/webhooks  o  https://whapi.cloud/channel/settings/webhooks (depende versión)

4.  **Servidor (Railway - donde vive Jose 24/7):**
    - Principal: https://railway.app
    - Nuevo proyecto: https://railway.app/new
    - Dashboard: https://railway.app/dashboard
    - Alternativa sin tarjeta: https://render.com  → https://dashboard.render.com

5.  **Tu bot una vez desplegado (Railway te da tu URL):**
    - Ejemplo: `https://betting-bot-production-xxxx.up.railway.app`
    - Tu URL real: La verás en Railway después de deploy, la copias
    - Webhook final: `https://TU-URL.up.railway.app/webhook` (agrega /webhook al final)
    - Panel Admin desde teléfono: `https://TU-URL.up.railway.app/admin`
    - Ver pedidos desde teléfono: `https://TU-URL.up.railway.app/admin/pedidos`
    - Probar Jose sin WhatsApp: `https://TU-URL.up.railway.app/admin/test`
    - Ver catálogo JSON: `https://TU-URL.up.railway.app/catalog`

---

## PASO 0: PREPARA TUS NOTAS (2 min)

Abre la app **Notas** en tu teléfono y crea una nota llamada **ENERGIXCU KEYS** con esto:

```
ANTHROPIC_API_KEY = 
WHAPI_TOKEN = 
RAILWAY_URL = 
ADMIN_PHONE = +53xxxxxxxx
```

La irás llenando en cada paso.

---

## PASO 1: GITHUB — Crear cuenta y Fork (3 min)

**Link:** https://github.com

**Qué hacer:**
1.  Abre Chrome → 3 puntitos arriba derecha → Activa **"Versión para computadora"** (muy importante)
2.  Entra a https://github.com → **Sign up** → Pon email Gmail, contraseña, username ej: `energixcu-jose`
3.  Confirma email en tu Gmail
4.  Ahora entra a **https://github.com/adel02d/betting-bot**
5.  Arriba derecha toca **Fork** → **Create fork** (déjalo todo por defecto)
6.  Espera 15 segundos → Serás redirigido a `https://github.com/TU-USUARIO/betting-bot` → ¡Tu copia lista!
7.  Asegúrate que arriba donde dice `Branch` esté seleccionado `arena/01a016b5-betting-bot`. Si dice `main`, toca el desplegable y selecciona `arena/01a016b5-betting-bot`.

**¿Qué acabas de hacer?** Copiaste el código de Jose a tu cuenta.

---

## PASO 2: ANTHROPIC — Sacar la IA (4 min)

**Links:**
- Registro: https://platform.anthropic.com
- Crear Key: https://platform.anthropic.com/settings/keys

**Qué hacer:**
1.  Entra a https://platform.anthropic.com → **Sign Up** con Google (tu Gmail)
2.  Dentro, toca menú (3 rayitas) → **API Keys** o ve directo a https://platform.anthropic.com/settings/keys
3.  Toca **Create Key** → Nombre: `energixcu-jose` → **Create**
4.  Te muestra una key larga tipo `sk-ant-api03-xxxxxxxx...` → **CÓPIALA COMPLETA** (toca el icono de copiar)
5.  Ve a tu nota **ENERGIXCU KEYS** y pega en `ANTHROPIC_API_KEY = sk-ant-...`
6.  Si te pide agregar crédito: Anthropic da $5 gratis al inicio. Si te pide tarjeta y no tienes, puedes seguir sin pagar, te deja probar. Si necesitas $5, pide a familiar fuera de Cuba que ponga tarjeta virtual. Con $5 tienes 2000 conversaciones.

**¿Qué acabas de hacer?** Sacaste el cerebro de Jose.

---

## PASO 3: WHAPI.CLOUD — Conectar WhatsApp (3 min)

**Links:**
- Principal: https://whapi.cloud
- Tu token: https://whapi.cloud/api  o Dashboard
- Conectar número: https://whapi.cloud/channels
- Webhook: https://whapi.cloud/settings/webhooks

**Qué hacer:**
1.  Entra a https://whapi.cloud → **Start Free** → Regístrate con Google
2.  Entras al Dashboard → Verás **API Token** (cadena larga letras/números) → **CÓPIALO** → Pega en tu nota `WHAPI_TOKEN = ...`
3.  Ahora conectar tu número:
    - Ve a https://whapi.cloud/channels → **Add Channel** o **New Channel** → **WhatsApp** → **QR Code**
    - Te muestra un QR gigante
    - Abre **WhatsApp** en tu teléfono → **Ajustes** → **Dispositivos vinculados** → **Vincular dispositivo** → Escanea el QR de la pantalla de Whapi
    - Espera 20 segundos → En Whapi dirá **Connected** verde → ¡Tu número ya es bot!

4.  **Si no quieres conectar tu número aún (prueba):** Whapi te da un número de prueba `+1415...` → Puedes escribirle a ese número para probar Jose sin usar tu número real.

**¿Qué acabas de hacer?** Conectaste tu WhatsApp para que Jose hable por él.

---

## PASO 4: RAILWAY — Donde vivirá Jose 24/7 (5 min)

**Links:**
- Principal: https://railway.app
- Nuevo proyecto: https://railway.app/new
- Dashboard: https://railway.app/dashboard
- Alternativa sin tarjeta: https://dashboard.render.com (Render.com)

**Qué hacer en Railway:**
1.  Entra a https://railway.app → **Login** → **Login with GitHub** → Autoriza GitHub (acepta todo)
2.  Toca **+ New Project**
3.  Elige **Deploy from GitHub repo**
4.  Si es primera vez: toca **Configure GitHub App** → Selecciona solo tu repo `betting-bot` → **Save** → Vuelve y selecciona `TU-USUARIO/betting-bot`
5.  Railway empieza **Building...** espera 2-3 min (verás logs)
6.  Toca el servicio (cuadrito con nombre `betting-bot`)
7.  Arriba toca pestaña **Variables**
8.  Toca **+ New Variable** y agrega UNA POR UNA exactamente como abajo (respeta mayúsculas):

```
ANTHROPIC_API_KEY = (pega tu sk-ant-... del PASO 2)
WHATSAPP_PROVIDER = whapi
WHAPI_TOKEN = (pega tu token del PASO 3)
ADMIN_PHONE = +5351234567  (REEMPLAZA con TU número con +53, ejemplo Cuba: +5351234567)
PORT = 8000
ENVIRONMENT = production
```
Cada vez que agregas una, toca **Add**.

9.  Railway redeplegará solo (verás **Deploying...** otra vez, espera 2 min hasta que diga **Active** verde)
10. **Sacar tu URL pública:**
    - Ve a pestaña **Settings** → **Networking** → **Public Networking** → Toca **Generate Domain**
    - Te genera link tipo `https://betting-bot-production-a1b2.up.railway.app`
    - **CÓPIALO** → Pega en tu nota `RAILWAY_URL = https://...`
    - Tu webhook será: `https://.../webhook` (agrega `/webhook` al final)

**¿Qué acabas de hacer?** Pusiste a Jose a vivir en internet 24/7.

**Si Railway te pide tarjeta de crédito y no tienes:**
- Usa **Render.com**: Ve a https://dashboard.render.com → **New + → Web Service** → Conecta tu repo `betting-bot` → **Runtime: Python 3** → **Build Command:** `pip install -r requirements.txt` → **Start Command:** `uvicorn agent.main:app --host 0.0.0.0 --port 10000` → Agrega mismas 6 Variables en **Environment** → **Create Web Service** → Copia URL que te da (ej: `https://energixcu.onrender.com`). Misma lógica, tu webhook será `https://tu-url.onrender.com/webhook`

---

## PASO 5: CONECTAR WEBHOOK — Unir Whapi con Railway (2 min)

**Links:**
- Whapi webhooks: https://whapi.cloud/settings/webhooks
- Tu webhook final: `https://TU-URL.up.railway.app/webhook` (el que copiaste + /webhook)

**Qué hacer:**
1.  En Whapi.cloud → Ve a https://whapi.cloud/settings/webhooks
2.  Verás campo **Webhook URL** → Pega `https://TU-URL.up.railway.app/webhook`
3.  **Método:** selecciona **POST**
4.  **Events:** marca solo **Messages** o deja todos (Messages es suficiente)
5.  Toca **Save** o **Update** → Debe decir **Enabled** o **Active** verde

**¿Qué acabas de hacer?** Le dijiste a Whapi: "Cuando te llegue un WhatsApp, reenvíalo a Railway donde está Jose"

---

## PASO 6: PROBAR QUE JOSE FUNCIONA (1 min)

**Prueba 1 — Por WhatsApp (real):**
- Desde OTRO teléfono (de tu mamá, pareja, amigo) escribe por WhatsApp a tu número que conectaste como bot: `Hola, que paneles tienen?`
- Debe responder Jose en 3-5 segundos con catálogo.

**Prueba 2 — Sin WhatsApp, desde tu teléfono (más fácil):**
- En Chrome abre: `https://TU-URL.up.railway.app/admin/test`
- Escribe teléfono `+5350000000` y mensaje `Hola, que paneles tienen?` → Toca **Enviar a Jose** → Verás respuesta.

**Si no responde:**
- Ve a Railway → tu proyecto → **Deployments** → **View Logs** (busca líneas rojas)
- Errores comunes:
  - `ANTHROPIC_API_KEY invalid` → Copiaste mal la key, revisa PASO 2
  - `WHAPI_TOKEN not configured` → No pusiste token en Variables
  - `No messages` → Webhook no configurado, revisa PASO 5
- Prueba también: `https://TU-URL.up.railway.app/` → Debe decir `{"status":"ok","agent":"Jose"}`

---

## PASO 7: ACTUALIZAR CATÁLOGO SOLO CON MENSAJE (Tu pedido principal)

**Link para panel web alternativo:** `https://TU-URL.up.railway.app/admin`

**Opción A — Por WhatsApp (RECOMENDADA para teléfono):**

Desde tu número que pusiste en `ADMIN_PHONE`, envía mensaje **a tu propio bot** (al número de bot) así:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W 48V - $900 USD - MPPT 100A WiFi pantalla
```

**Reglas para teléfono:**
- Primera línea OBLIGATORIA: `Productos Nuevos del Día:`
- Cada producto en línea nueva empezando con `-`
- Pon precio con `$` y `CUP` para que se extraiga solo
- Puedes poner descripción al final

Jose te responde al instante:
```
✅ ¡Catálogo actualizado con 3 producto(s) nuevos! 📦
• Panel Solar 600W...
Ya están activos para clientes. Total nuevos hoy: 3 🆕
```

**Otros formatos que funcionan si no quieres escribir mucho:**

Una sola línea (si solo es 1 producto nuevo):
```
Panel Solar 600W Bifacial $320 USD / 80000 CUP
```
→ Si tu número es admin, lo agrega.

Lista sin encabezado (si tu número es admin y mandas lista con guiones):
```
- Panel 600W $320 / 80000 CUP
- Batería 48V $1600 / 400000 CUP
```

**Opción B — Por Panel Web desde teléfono:**

1.  Entra a `https://TU-URL.up.railway.app/admin`
2.  Verás formulario grande que dice **"Actualizar Catálogo desde Teléfono"**
3.  Pega tu lista y toca **✅ Actualizar Catálogo**
4.  Te dice cuántos agregó

**Truco teléfono:** Guarda en Notas plantilla vacía:
```
Productos Nuevos del Día:
- 
- 
- 
```
Solo llenas, copias, pegas a WhatsApp bot.

---

## PASO 8: CUANDO ENTRE PEDIDO, ¿ME LLEGA EL TICKET POR WHATSAPP?

**¡SÍ! Ya está programado así.**

Cuando cliente da los 5 datos y Jose genera ticket, pasa esto AUTOMÁTICAMENTE:

1.  **Cliente recibe** por WhatsApp:
```
--------------------------------------------------
⚡ TICKET DE PEDIDO - ENERGIXCU ⚡

- Cliente: Juan Pérez
- Producto: Panel Solar 550W Tier 1
- Cantidad: 2
- Dirección: Calle 23 #456 Vedado Plaza
- Forma de pago: Efectivo
--------------------------------------------------

¡Listo! Tu pedido ha sido registrado con éxito...
```

2.  **TÚ (admin) recibes AL MISMO TIEMPO por WhatsApp** (a tu ADMIN_PHONE):
```
🔔 ¡NUEVO PEDIDO ENERGIXCU! 🔔

[Ticket igual que arriba]

📞 Cliente WhatsApp: +535xxxxxxx (Juan)
👤 Nombre contacto: Juan
🕐 Fecha: 2026-08-18 22:30:00

✅ Acción requerida: Contactar al cliente para coordinar entrega.
Puedes ver todos los pedidos en: /admin/pedidos
```

**¿Cómo funciona internamente?**
En `agent/main.py` función `notificar_admin_nuevo_pedido()` → Cuando detecta `"TICKET DE PEDIDO - ENERGIXCU"` en la respuesta, lee `ADMIN_PHONE` de Variables y usa el mismo proveedor (Whapi) para enviarte mensaje.

**¿No te llega?**
- Verifica que `ADMIN_PHONE` en Railway Variables esté correcto con `+53`
- Verifica que no sea el mismo número del cliente (no se notifica a sí mismo)
- Revisa Logs en Railway → debe decir `📤 Ticket enviado a admin +53...`

**Ver pedidos acumulados:**
- Desde teléfono: `https://TU-URL.up.railway.app/admin/pedidos` → tabla con todos
- JSON: `https://TU-URL.up.railway.app/pedidos`

---

## PASO 9: GUÍA RÁPIDA DE LINKS Y QUÉ HACER EN CADA UNO (Resumen para guardar)

| Link | Para qué | Qué hacer |
|------|----------|-----------|
| https://github.com | Crear cuenta código | Sign up → Fork de adel02d/betting-bot |
| https://github.com/TU-USUARIO/betting-bot | Tu copia del bot | Verificar branch arena/01a016b5-betting-bot |
| https://platform.anthropic.com | IA de Jose | Sign up con Google |
| https://platform.anthropic.com/settings/keys | Sacar key IA | Create Key → copiar sk-ant-... |
| https://whapi.cloud | Conectar WhatsApp | Sign up → copiar API Token |
| https://whapi.cloud/channels | Conectar tu número | Add Channel → escanear QR con WhatsApp |
| https://whapi.cloud/settings/webhooks | Unir WhatsApp con Railway | Pegar https://TU-URL/webhook, método POST, Save |
| https://railway.app | Servidor 24/7 | Login con GitHub → New Project → Deploy from GitHub repo → tu betting-bot |
| https://railway.app/new | Crear proyecto | Si no ves, entra aquí directo |
| https://dashboard.render.com | Alternativa Railway sin tarjeta | New Web Service → conecta tu repo |
| https://TU-URL.up.railway.app/ | Ver si bot vivo | Debe decir {"status":"ok","agent":"Jose"} |
| https://TU-URL.up.railway.app/admin | Panel admin teléfono | Actualizar catálogo con formulario, ver estado |
| https://TU-URL.up.railway.app/admin/pedidos | Ver pedidos teléfono | Tabla con todos los tickets |
| https://TU-URL.up.railway.app/admin/test | Probar Jose sin WhatsApp | Escribir como cliente y ver respuesta |
| https://TU-URL.up.railway.app/catalog | Ver catálogo | JSON con catálogo actual |
| https://TU-URL.up.railway.app/webhook | Webhook (NO entrar directo) | Es el que pones en Whapi, no lo abras manualmente |

---

## PASO 10: MANTENIMIENTO DESDE TELÉFONO (Sin PC nunca)

- **Cambiar precio:** Envía mensaje con nuevo precio → Se agrega como nuevo y Jose lo prioriza. Ej: `Productos Nuevos del Día: - Panel 550W ahora $300 USD`
- **Ver si bot vivo:** `https://TU-URL/admin` → Si ves verde, vivo
- **Ver logs si falla:** Railway → tu proyecto → Deployments → View Logs (todo desde Chrome móvil)
- **Cambiar ADMIN_PHONE:** Railway → Variables → Edita ADMIN_PHONE → Guarda → Railway redeplega solo (2 min)
- **Actualizar código futuro:** GitHub App (instala de Play Store) → Abre tu repo → Edita archivo → Commit → Railway redeplega solo
- **Agregar app a pantalla inicio:** Chrome → abre `/admin` → 3 puntitos → "Agregar a pantalla de inicio" → Icono de EnergixCu como app

---

## 🆘 TROUBLESHOOTING RÁPIDO DESDE TELÉFONO

**Bot no responde en WhatsApp pero sí en /admin/test:**
→ Webhook mal configurado en Whapi. Revisa PASO 5, debe ser `https://.../webhook` POST.

**En Railway logs dice "ANTHROPIC_API_KEY invalid":**
→ Copiaste mal key. Ve a https://platform.anthropic.com/settings/keys → Create new key → copia bien → pega en Railway Variables → guarda.

**En Railway logs dice "WHAPI_TOKEN not configured":**
→ No pusiste token Whapi en Variables.

**Me llega ticket al cliente pero no a mí (admin):**
→ Verifica ADMIN_PHONE en Variables con +53. Verifica que cliente y admin no sean mismo número. Ve logs debe decir "Ticket enviado a admin".

**Railway pide tarjeta y no tengo:**
→ Usa Render.com → https://dashboard.render.com → New Web Service → conecta repo → Build `pip install -r requirements.txt` → Start `uvicorn agent.main:app --host 0.0.0.0 --port 10000` → mismas Variables.

---

## 📦 PLANTILLAS LISTAS PARA COPIAR DESDE TU TELÉFONO

**Plantilla 1 — Actualizar catálogo (copia y llena):**
```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W 48V - $900 USD / 230000 CUP - MPPT 100A WiFi
```

**Plantilla 2 — Un solo producto:**
```
Panel Solar 600W Bifacial $320 USD / 80000 CUP - 600W Tier1
```

**Plantilla 3 — Para probar flujo de venta (como cliente, envía a tu bot desde otro teléfono):**
```
Hola, busco panel para nevera y 2 ventiladores, que me recomiendas?
```

---

**¿En qué paso te quedaste?** Dime número de paso y qué ves en pantalla, te guío exacto.

**Jose listo 24/7 solo con teléfono** 📱⚡🚀
