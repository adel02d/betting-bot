# 📱 GUIA PASO A PASO DETALLADA — EnergíaXCu Jose con Solo Teléfono (Sin PC, Sin Laptop)

> **Tiempo total:** 15-30 minutos
> **Qué necesitas:** Un teléfono Android o iPhone con Chrome, conexión a internet, una cuenta Gmail
> **Resultado:** Tu bot Jose funcionando 24/7 en WhatsApp, atendiendo clientes solo

---

## ✅ ANTES DE EMPEZAR — Qué vas a crear

1.  **GitHub:** Tu copia del código del bot (gratis)
2.  **Anthropic:** La inteligencia artificial de Jose (te da crédito gratis)
3.  **Whapi.cloud:** La conexión con WhatsApp (gratis para probar)
4.  **Railway:** El servidor donde vive Jose 24/7 (gratis tier)

Al final tendrás un link tipo `https://tu-app.up.railway.app` y cuando alguien te escriba por WhatsApp, Jose responde solo.

---

## PASO 1: CREAR CUENTA GITHUB DESDE TU TELEFONO (3 min)

GitHub es donde guardaremos el código. Es gratis y se hace 100% desde el teléfono.

1.  Abre **Chrome** en tu teléfono
2.  Arriba a la derecha (3 puntitos) → Marca **"Versión para computadora"** o **"Sitio para computadora"**. Esto es IMPORTANTE porque en modo móvil no ves algunos botones.
3.  Ve a **github.com**
4.  Toca **Sign up** (Registrarse)
5.  Pon tu email Gmail, crea contraseña, nombre usuario ej: `energixcu-cuba`
6.  GitHub te pedirá verificar email → Ve a Gmail → Abre correo de GitHub → Verifica
7.  ¡Listo! Ya tienes GitHub.

### 1B: Haz Fork del bot (tu copia)

1.  En el mismo Chrome (modo computadora), entra a:
    `https://github.com/adel02d/betting-bot`
2.  Arriba a la derecha verás botón **Fork** → Tócalo
3.  Déjalo como está y toca **Create fork**
4.  Espera 10 segundos → Ahora tienes tu copia en `https://github.com/TU-USUARIO/betting-bot`
5.  Verifica que arriba dice `main` o `arena/01a016b5-betting-bot`. Si dice `main`, entra a **Branches** y selecciona `arena/01a016b5-betting-bot` — esa es la rama con Jose listo.

**¿Por qué Fork?** Para que Railway pueda copiarlo y desplegarlo.

---

## PASO 2: OBTENER API KEY DE ANTHROPIC (La IA de Jose) (4 min)

Jose usa Claude de Anthropic para pensar y responder.

1.  En Chrome (puedes quitar modo computadora ahora), ve a **https://platform.anthropic.com**
2.  Toca **Sign Up** → Regístrate con Google (con tu Gmail)
3.  Una vez dentro, busca en menú **API Keys** o entra directo a:
    `https://platform.anthropic.com/settings/keys`
4.  Toca **Create Key** → Pon nombre `energixcu-jose` → Create
5.  Te mostrará una key larga que empieza con `sk-ant-api03-...` → **Copia esa key completa** → Pégala en una nota de tu teléfono y guárdala. La llamarás `ANTHROPIC_KEY`
6.  Si te pide agregar crédito, Anthropic suele dar $5 gratis para empezar. Si te pide tarjeta, puedes usar tarjeta virtual o pedir a alguien fuera de Cuba que te ayude a recargar $5. Con $5 tienes para 2000-3000 conversaciones.

**Guarda:** `sk-ant-...` en notas.

---

## PASO 3: OBTENER TOKEN DE WHAPI.CLOUD (Conexión WhatsApp) (3 min) — RECOMENDADO, MÁS FÁCIL

Whapi.cloud te permite conectar tu WhatsApp sin ser Facebook Business.

1.  Ve a **https://whapi.cloud** en Chrome
2.  Toca **Start Free** o **Sign Up** → Regístrate con Google
3.  Dentro del dashboard verás **API Token** o entra a **https://whapi.cloud/channels** o **Settings → API**
4.  Copia el **Token** largo (ej: `abcdef123456...`) → Guárdalo en notas como `WHAPI_TOKEN`
5.  **Para usar tu propio número de WhatsApp:**
    - Ve a **Channels** → **Add Channel** o **Connect Phone**
    - Te mostrará un **código QR**
    - Abre **WhatsApp** en tu teléfono → **Dispositivos vinculados** → **Vincular dispositivo** → Escanea el QR de Whapi.cloud
    - Espera que conecte → ¡Tu número ahora es el bot!

**Alternativa más simple para probar:** Whapi te da un número de prueba gratis tipo `+1415...` con sandbox. Puedes probar con ese sin conectar tu número real. Luego conectas el tuyo.

**Guarda:** `WHAPI_TOKEN`

### ¿Qué pasa si quiero usar Meta oficial (más complejo)?
No lo recomiendo si solo tienes teléfono, pero es:
- Developers.facebook.com → Crear App Business → Agregar WhatsApp → Te dan `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `META_VERIFY_TOKEN`
- Usa Whapi, es 10 veces más fácil.

---

## PASO 4: DEPLOYAR EN RAILWAY (El servidor donde vivirá Jose 24/7) (5 min) — SOLO TELEFONO

Railway es un servidor en la nube, gratis al inicio, y funciona 100% desde móvil.

1.  En Chrome ve a **https://railway.app**
2.  Toca **Login** → **Login with GitHub** → Autoriza con tu GitHub (el que creaste en Paso 1)
3.  Una vez dentro, toca **New Project** (Botón morado)
4.  Elige **Deploy from GitHub repo**
5.  Si es primera vez, Railway te pedirá permiso para ver tus repos → Toca **Configure** → Selecciona `betting-bot` (tu fork) → **Save**
6.  Ahora en la lista busca `TU-USUARIO/betting-bot` → Tócalo
7.  Railway empezará a construir: verás logs `Building...` → Espera 2-3 minutos. Si dice `Build Failed`, no te preocupes, sigue al siguiente paso.
8.  **Agregar Variables (MUY IMPORTANTE):**
    - Una vez creado el proyecto, toca tu servicio (el cuadrito que dice `betting-bot`)
    - Arriba toca pestaña **Variables**
    - Toca **+ New Variable** → Agrega una por una, escribe exactamente:

```
ANTHROPIC_API_KEY = sk-ant-api03-tu-key-que-copiaste (la del PASO 2)
WHATSAPP_PROVIDER = whapi
WHAPI_TOKEN = tu_token_de_whapi (del PASO 3)
ADMIN_PHONE = +5351234567 (TU número personal con +53, con el que mandarás actualizaciones de catálogo)
PORT = 8000
ENVIRONMENT = production
```

    - Ejemplo ADMIN_PHONE: si tu número es `51234567`, pon `+5351234567`. Si son 2 admins: `+5351234567,+5357654321`

    - Después de cada variable toca Add o Enter. Al final tendrás 6 variables.

9.  Railway automáticamente redeplega cuando agregas variables. Espera 1-2 min a que diga **Deployed** verde.
10. **Copiar URL pública:**
    - En el servicio, ve a **Settings** → **Networking** o **Domains**
    - Toca **Generate Domain** → Te generará algo como `https://betting-bot-production.up.railway.app` o `https://energixcu-jose.up.railway.app`
    - **Copia ese link** → Guarda en notas como `RAILWAY_URL`

**Si Railway te pide tarjeta de crédito:**
- Si te pide, cambia a **Render** que no pide tarjeta:
  - Ve a **https://render.com** → Login con GitHub → New Web Service → Conecta tu repo `betting-bot` → Runtime Python → Build command `pip install -r requirements.txt` → Start command `uvicorn agent.main:app --host 0.0.0.0 --port 10000` → Agrega mismas Variables → Deploy → Copia URL.

---

## PASO 5: CONECTAR WEBHOOK (Unir WhatsApp con Railway) (2 min)

Este paso une Whapi con tu servidor Railway para que cuando alguien escriba por WhatsApp, llegue a Jose.

1.  Ve a **https://whapi.cloud** → Login
2.  Ve a **Settings** → **Webhooks** o **https://whapi.cloud/settings/webhooks** o **Channels → Webhooks**
3.  Verás un campo para poner URL → Pega tu `RAILWAY_URL` + `/webhook`
    - Ejemplo: `https://betting-bot-production.up.railway.app/webhook`
    - **Importante:** debe terminar en `/webhook`
4.  Método: **POST**
5.  Marca: **Messages** (o todos si te deja)
6.  Toca **Save** / **Update** / **Enable**
7.  Whapi dirá **Webhook active**

**Si usas Meta:** En developers.facebook.com → tu App → WhatsApp → Configuration → Callback URL = `https://tu-url/webhook` y Verify Token = el que pusiste en `META_VERIFY_TOKEN`.

---

## PASO 6: PROBAR QUE JOSE FUNCIONA (1 min)

1.  Abre WhatsApp
2.  **Si usas Whapi con tu propio número conectado:** Escribe desde otro teléfono (de un familiar) a tu número → Deberías recibir respuesta automática de Jose
3.  **Si usas número de prueba de Whapi:** Whapi → Channels → Abre chat de prueba o escribe al número de prueba que te da Whapi
4.  Mensaje de prueba: `Hola, que paneles tienen?`
5.  Si todo está bien, Jose responde en 3-5 segundos:
```
¡Hola! 👋 Soy Jose de EnergixCu ⚡. Qué bueno que nos escribes...
📦 CATÁLOGO...
```
6.  Si no responde:
    - Ve a Railway → tu proyecto → **Deployments** → **View Logs** → Mira si hay error rojo
    - Errores comunes:
      - `ANTHROPIC_API_KEY invalid` → La key está mal copiada
      - `WHAPI_TOKEN not configured` → No pusiste token en Variables
      - `No webhook` → Webhook no configurado en Whapi

### Prueba sin WhatsApp (desde tu teléfono):
Entra a Chrome a: `https://TU-URL.up.railway.app/admin/test`
Escribe mensaje y presiona Enviar → Verás respuesta de Jose sin necesidad de WhatsApp.

---

## PASO 7: ACTUALIZAR CATÁLOGO SOLO CON MENSAJE DE WHATSAPP (Tu requerimiento principal)

¡Este es el paso que pediste! **Sin PC, solo mensaje.**

### Desde tu número admin (el que pusiste en ADMIN_PHONE):

Abre WhatsApp y **envía un mensaje a tu propio número de bot** (al número de prueba o a tu número conectado) con este formato exacto:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W 48V - $900 USD - MPPT 100A WiFi
```

**Reglas súper simples para teléfono:**
- Primera línea SIEMPRE: `Productos Nuevos del Día:` (así Jose sabe que eres admin)
- Cada producto en una línea nueva empezando con `-`
- Pon precio con `$` y `CUP` para que se extraiga automático
- Puedes agregar descripción al final

**Jose te responderá al instante:**
```
✅ ¡Catálogo actualizado con 3 producto(s) nuevos! 📦

• Panel Solar 600W Bifacial - $320 USD / 80000 CUP
• Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP
• Inversor Growatt 6000W...

Ya están activos para clientes. Total nuevos hoy: 3 🆕
```

Ahora cualquier cliente que pregunte "¿Qué tienen nuevo?" verá esos productos.

**Otros formatos que también funcionan desde teléfono (por si no quieres escribir mucho):**

Una sola línea:
```
Panel Solar 600W Bifacial $320 USD / 80000 CUP
```
→ Si tu número es admin, Jose lo agrega.

Con Admin:
```
Admin: Agregar producto
- Panel 600W $320 / 80000 CUP
```

**Truco para teléfono:**
Guarda en tus Notas de iPhone/Android una plantilla:
```
Productos Nuevos del Día:
- 
- 
- 
```
Cuando tengas nuevos productos, solo llenas los guiones, copias y pegas a WhatsApp de tu bot.

### Por Panel Web (también sin PC):

1.  Entra a `https://TU-URL.up.railway.app/admin` desde Chrome en tu teléfono
2.  Verás formulario grande
3.  Pega tu lista y toca **✅ Actualizar Catálogo**
4.  Te dice cuántos agregó

**Agregar este panel a tu pantalla de inicio:**
Chrome → Abre `/admin` → 3 puntitos → "Agregar a pantalla de inicio" → Ahora tienes app de EnergixCu como si fuera app nativa.

---

## PASO 8: VER PEDIDOS DESDE TU TELÉFONO

Cada vez que un cliente te da los 5 datos, Jose genera ticket:

```
--------------------------------------------------
⚡ TICKET DE PEDIDO - ENERGIXCU ⚡

- Cliente: Juan Pérez
- Producto: Panel Solar 550W Tier 1
- Cantidad: 2
- Dirección: Calle 23 #456 Vedado Plaza referencia parque
- Forma de pago: Efectivo
--------------------------------------------------
```

**Para ver todos los pedidos desde tu teléfono:**

1.  Entra a `https://TU-URL.up.railway.app/admin/pedidos`
2.  Verás tabla con fecha, cliente, producto, dirección, pago, teléfono
3.  También en `/admin` ves últimos 5 pedidos

**Desde WhatsApp:** Por ahora solo ves en web, pero en futuro te puedo agregar que cada vez que haya pedido, te llegue notificación automática a tu número admin.

---

## PASO 9: FLUJO REAL CON CLIENTE (Qué ve el cliente)

1.  Cliente te escribe por WhatsApp: "Hola, busco panel para nevera"
2.  Jose responde: "¡Hola! 👋 Soy Jose de EnergixCu ⚡... ¿Qué quieres alimentar?"
3.  Cliente: "Nevera, 2 ventiladores y luces"
4.  Jose calcula kit: Usa `calcular_kit_solar` → "Te recomiendo Kit Intermedio 3kW $1850 USD..."
5.  Cliente: "Me interesa el Kit Intermedio"
6.  Jose pide 5 datos en un solo mensaje: Nombre, producto exacto, cantidad, dirección (municipio, reparto, ref), forma de pago (Efectivo o Transferencia)
7.  Cliente envía datos
8.  Jose genera ticket con formato exacto + "¡Listo! Tu pedido registrado..."
9.  Tú ves pedido en `/admin/pedidos` y coordinas entrega

**Todo automático, tú solo ves pedidos y actualizas catálogo cuando hay cambios.**

---

## PASO 10: MANTENIMIENTO DESDE TELÉFONO (Sin PC)

- **Cambiar precio:** Envía nuevo mensaje con mismo producto y nuevo precio → Se agrega como nuevo y Jose prioriza nuevos del día.
- **Ver logs si algo falla:** Railway → tu proyecto → Deployments → View Logs (desde Chrome teléfono)
- **Cambiar ADMIN_PHONE:** Railway → Variables → Edita ADMIN_PHONE → Guarda → Railway redeplega solo.
- **Actualizar código en futuro:** GitHub App en tu teléfono → Entra a tu repo → Edita archivo → Commit → Railway auto redeplega.
- **Apagar/Prender:** Railway → Service → Settings → Puedes pausar.

---

## ❓ TROUBLESHOOTING DESDE TELÉFONO

**Bot no responde:**
1.  Ve a `/admin` → ¿Dice provider Whapi? ¿Admin phone configurado?
2.  Railway → Logs → ¿Dice "ANTHROPIC_API_KEY invalid" o "WHAPI_TOKEN not configured"? → Revisa Variables
3.  Whapi.cloud → Webhooks → ¿URL correcta con `/webhook` y activo?
4.  Prueba `/admin/test` → Si ahí responde Jose pero no por WhatsApp, es problema webhook Whapi
5.  Prueba curl: En `/admin` → Si ves catálogo, servidor está vivo

**No actualiza catálogo:**
- ¿Tu número es exactamente ADMIN_PHONE? Pon +53...
- ¿Mensaje empieza con "Productos Nuevos del Día:" y cada producto con "-"?
- Prueba por web `/admin` → Si por web sí funciona, es problema detección admin

**Gasto Anthropic muy alto:**
- En Railway Variables agrega `ENVIRONMENT=production` para menos logs
- Claude cobra por tokens, un chat de cliente ~$0.01-0.05 USD

**Railway pide tarjeta:**
- Prueba Render.com (no pide tarjeta) o Koyeb.com (gratis)

---

## 💰 COSTOS (Para que sepas)

- **GitHub:** Gratis
- **Railway:** Free tier $5/mes gratis, luego $5-10/mes
- **Whapi.cloud:** Sandbox gratis 100 mensajes, luego desde $9/mes por 1000 conversaciones
- **Anthropic Claude:** $5 gratis inicial, luego pago por uso (~$0.02 por conversación cliente)
- **Total para empezar:** $0 con free tiers

---

## 📋 CHECKLIST FINAL — ¿Ya funciona?

Marca esto desde tu teléfono:

- [ ] Tengo GitHub y Fork hecho
- [ ] Tengo ANTHROPIC_API_KEY copiada
- [ ] Tengo WHAPI_TOKEN copiado
- [ ] Railway proyecto Deployed verde
- [ ] Variables configuradas (6 variables)
- [ ] URL Railway copiada
- [ ] Webhook en Whapi con /webhook y POST activo
- [ ] Escribí "Hola" a mi bot y Jose respondió
- [ ] Envié "Productos Nuevos del Día: - Panel 600W $320" desde mi admin y respondió "Catálogo actualizado"
- [ ] Entré a /admin y veo catálogo
- [ ] Entré a /admin/pedidos y veo (aunque sea vacío)
- [ ] Probé /admin/test

Si todo está marcado ✅, ¡Jose está vendiendo por ti 24/7!

---

## 🚀 SIGUIENTE NIVEL (Opcional, también desde teléfono)

- Agregar botón de pago Transfermóvil: en prompts.yaml puedes agregar número
- Crear broadcast: Enviar "Tenemos nuevos paneles 600W" a todos los clientes que te escribieron (necesita código extra, te lo puedo agregar)
- Conectar con Google Sheets para pedidos (en vez de solo JSON)

---

**¿Te quedaste en algún paso?** Dime exactamente en qué paso estás y qué ves en pantalla, te guío con captura mental.

**Plantilla lista para copiar ahora mismo desde tu teléfono:**

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Híbrido 6000W 48V - $900 USD / 230000 CUP - MPPT 100A WiFi pantalla
```

Copia, pega a tu bot WhatsApp, y verás "Catálogo actualizado" 📦⚡

---
**Jose — EnergixCu — Energía inteligente para Cuba — Hecho 100% desde teléfono**
