# 📱 GUÍA FINAL DEFINITIVA — Teléfono Solo, José con Gemma 2 9B Humano (Cliente cree que habla con persona) — 100% Gratis, Nada Local, Todo Nube

**Quedamos que usamos teléfono, perfecto. Esta guía es SOLO teléfono, sin PC, todo en la nube, nada local, José habla como persona real con Gemma 2 9B gratis, no mecánico.**

**Stack final $0, todo nube, nada en tu teléfono después:**

- **Código:** GitHub nube — https://github.com/adel02d/betting-bot (ya tiene José, Python)
- **IA Humana Gratis:** Groq Cloud con **Gemma 2 9B** — https://console.groq.com/keys — Modelo `gemma2-9b-it` de Google, habla como persona real, gratis sin tarjeta, con VPN gratis una vez en tu teléfono
- **WhatsApp Gratis:** Evolution API Cloud — https://github.com/EvolutionAPI/evolution-api — Tu propio Whapi gratis para siempre, sin pagar, sin tarjeta
- **Servidor:** Koyeb Cloud — https://app.koyeb.com — 2 servicios gratis sin tarjeta (Evolution + José), 1 por cada Gmail

**Costo: $0 — Sin tarjeta, sin Whapi que pide pago, sin nada local, apagas teléfono y sigue 24/7.**

---

## 🤖 ¿QUÉ IA USA JOSÉ PARA NO SONAR MECÁNICO Y PARECER PERSONA?

**Antes modo FREE mecánico (por eso te quejabas):**
- Reglas `if hola → plantilla fija` → siempre igual, cliente nota bot

**Ahora con Gemma 2 9B nube (como pediste):**

- **Gemma 2 9B Instruct** es de Google, familia Gemini, 9 mil millones parámetros, entrenado para conversar natural, empático, con variación, como persona real.
- **Dónde corre:** En la nube Groq (USA), gratis 14,400 req/día sin tarjeta. Tú sacas key `gsk_...` con VPN gratis una vez en tu teléfono (Groq bloquea Cuba), luego Koyeb (USA) la usa en la nube sin VPN, sin bloqueo, nada local en tu teléfono.
- **En código:** `agent/brain.py` → `GROQ_MODEL=gemma2-9b-it` + `temperature=0.7` + prompt humano: "Usa lenguaje natural, contracciones, expresiones cubanas suaves, varía respuestas, muestra empatía: 'Entiendo, con los apagones está dura la cosa...', 1-2 emojis max, no digas como IA"
- **Resultado:**
  - Cliente: "Mi mamá mayor necesita oxígeno por las noches"
  - **Antes mecánico:** "Tenemos inversores 1000W-5000W..."
  - **Ahora con Gemma 2 9B nube:** "Uy, para tu mamá lo mejor es algo silencioso que no falle de noche... Te recomendaría Kit Intermedio 3kW con batería 24V 100Ah que te da 6-8h para concentrador... ¿Te armo los números?"

Verás en `https://TU-JOSE.koyeb.app/` → `{"llm":"groq","model":"gemma2-9b-it"}`

**Si no puedes crear Groq ni con VPN en teléfono:** Deja `LLM_PROVIDER=free` y funciona sin API, 100% gratis sin bloqueo, pero más mecánico. Con Gemma es humano.

---

## 📋 PREPARA TU TELÉFONO (2 min)

1.  Abre **Chrome** → 3 puntitos arriba derecha → activa **"Versión para computadora"**. Déjalo activado todo el rato.
2.  Instala **ProtonVPN gratis sin tarjeta** (para crear Groq key, Cuba bloqueada, solo 1 vez): Play Store → busca **Proton VPN** → Instalar → Sign Up con Gmail → No pide tarjeta
3.  Crea nota en tu teléfono **JOSE CLAVES** vacía:

```
GMAIL 1 (Evolution): 
GMAIL 2 (Jose): 
GROQ_API_KEY = gsk_...
EVOLUTION_URL = 
EVOLUTION_KEY = energixcu123456
JOSE_URL = 
ADMIN_PHONE = +53...
```

4.  Necesitas **2 Gmail** porque Koyeb gratis = 1 servicio por cuenta. Si solo tienes 1, crea segundo: Gmail app → foto → Añadir cuenta → Crear cuenta.

---

## PASO 1: VERIFICA TU REPO (1 min) — Ya tiene José

- Link: https://github.com/adel02d/betting-bot → Refresca deslizando abajo → debes ver Python y carpetas `agent/`, `GUIA_FINAL_TELEFONO_GEMMA_HUMANO.md` (esta guía). Si ves JavaScript 100% viejo, toca donde dice `main` arriba y selecciona `arena/01a016b5-betting-bot` o espera 1 min y refresca. Ya está en main.

NO hagas Fork, eres dueño.

---

## PASO 2: CREAR API KEY GROQ GEMMA 2 9B GRATIS DESDE TU TELÉFONO (5 min) — Con VPN gratis una vez

**Links:**
- VPN: ProtonVPN app que instalaste
- Groq Keys: https://console.groq.com/keys

1.  **Activa VPN en tu teléfono:** Abre ProtonVPN → Connect → Elige **United States** (gratis) → Debe decir Connected verde
2.  **Con VPN activa** entra a https://console.groq.com/keys en Chrome
3.  Sign Up con Gmail → Verify email
4.  **Create API Key** → Nombre `energixcu-jose-gemma-telefono` → Create → Copia `gsk_...` largo → Guarda en tu nota como `GROQ_API_KEY`
5.  **Desactiva VPN** (ya no la necesitas nunca más, Koyeb está en USA y usará Groq en la nube sin VPN, nada local)

**¿Por qué VPN solo una vez?** Groq bloquea IPs Cuba para crear cuenta, pero una vez creada la key, Koyeb nube la usa sin VPN.

**Costo:** $0, sin tarjeta, 14,400 req/día gratis.

**Si no te deja ni con VPN:** Deja `LLM_PROVIDER=free` y José funciona sin API, mecánico pero vende. Luego con PC y VPN creas Groq.

---

## PASO 3: DESPLEGAR EVOLUTION API EN LA NUBE KOYEB (Cuenta 1) (5 min) — 100% gratis sin tarjeta, nada local

**Links:**
- Koyeb: https://app.koyeb.com
- Nuevo servicio: https://app.koyeb.com/services/new
- Docs Evolution Koyeb: https://doc.evolution-api.com/v1/installation/koyeb

**Con Gmail 1:**

1.  https://app.koyeb.com → Sign Up → Continue with GitHub → autoriza `adel02d`
2.  Create Service → **Docker** (NO Buildpack) → Imagen `atendai/evolution-api:latest` → Search → Selecciónalo
3.  Service name: `evolution-energixcu` → Instance Eco e2-micro gratis → Port `8080`
4.  Variables (4):

```
SERVER_URL = https://tu-evolution-xxxx.koyeb.app (temporal)
AUTHENTICATION_TYPE = apikey
AUTHENTICATION_API_KEY = energixcu123456 (inventa, guarda como EVOLUTION_KEY)
QRCODE_LIMIT = 30
```

5.  Deploy → 4-6 min → Healthy verde → copia URL `https://evolution-...koyeb.app` → guarda como `EVOLUTION_URL`
6.  Settings → Environment → edita `SERVER_URL` con tu URL real `https://evolution-...koyeb.app` → Save → Redeploy

**Ahora Evolution vive en la nube, nada en tu teléfono.**

---

## PASO 4: CONECTAR TU NÚMERO WHATSAPP A EVOLUTION NUBE (QR) (3 min) — Todo en nube

- Link: `https://TU-EVOLUTION.koyeb.app/docs`

1.  Abre `https://TU-EVOLUTION.koyeb.app/docs` → POST `/instance/create` → Try it out → Body:
```json
{
  "instanceName": "energixcu",
  "token": "energixcu123456",
  "qrcode": true
}
```
2.  Execute → verás `qrcode: { base64: "data:image/png;base64,..." }` → copia base64 → pega en nueva pestaña como URL → QR gigante
3.  WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo → Escanea QR → state `open` (verifica GET `/instance/fetchInstances`)

Guarda: `EVOLUTION_INSTANCE = energixcu`

---

## PASO 5: DESPLEGAR JOSÉ CON GEMMA 2 9B HUMANO EN LA NUBE KOYEB (Cuenta 2) (5 min) — Nada local

**Con Gmail 2:**

1.  https://app.koyeb.com con Gmail 2 → Create Service → GitHub → `adel02d/betting-bot` main → Buildpack Python → Run command copia EXACTO:
```
uvicorn agent.main:app --host 0.0.0.0 --port 8000
```
2.  Port `8000` → Eco gratis → Variables 8 (TODO NUBE, CON GEMMA HUMANO):

```
LLM_PROVIDER = groq
GROQ_API_KEY = gsk_tu_key_de_Paso_2
GROQ_MODEL = gemma2-9b-it
WHATSAPP_PROVIDER = evolution
EVOLUTION_API_URL = https://tu-evolution-xxxx.koyeb.app
EVOLUTION_API_KEY = energixcu123456
EVOLUTION_INSTANCE = energixcu
ADMIN_PHONE = +5351234567 (TU número con +53 donde recibirás tickets)
PORT = 8000
ENVIRONMENT = production
```

Si no conseguiste Groq, pon `LLM_PROVIDER=free` y funciona sin API, mecánico pero gratis.

3.  Deploy → Healthy verde → copia URL José `https://tu-jose-xxxx.koyeb.app` → webhook `https://TU-JOSE.koyeb.app/webhook`

**Ahora José vive en la nube con Gemma en la nube Groq, Evolution en la nube, NADA en tu teléfono. Apagas teléfono y sigue 24/7.**

---

## PASO 6: CONECTAR EVOLUTION NUBE CON JOSÉ NUBE (Webhook) (2 min)

- `https://TU-EVOLUTION.koyeb.app/docs` → POST `/webhook/set/energixcu` → Body:
```json
{
  "webhook": {
    "enabled": true,
    "url": "https://TU-JOSE.koyeb.app/webhook",
    "events": ["MESSAGES_UPSERT"]
  }
}
```
Execute → success

---

## PASO 7: PROBAR JOSÉ HUMANO CON GEMMA DESDE TELÉFONO (1 min)

- Desde OTRO teléfono escribe a tu número bot: `Hola, busco algo para mi bebé, los apagones están duros`
- **Con Gemma 2 9B nube debe responder humano:** "Hola! Entiendo perfectamente, con un bebé los apagones se hacen más difíciles 😔... Para tu caso con nevera para leche y ventilador, te recomendaría Kit Intermedio 3kW..."
- Sin WhatsApp: `https://TU-JOSE.koyeb.app/admin/test` → escribe `Mi mamá mayor necesita oxígeno por las noches` → debe responder empático humano, no plantilla
- Vivo: `https://TU-JOSE.koyeb.app/` → `{"provider":"ProveedorEvolution","llm":"groq","model":"gemma2-9b-it"}`
- Panel: `https://TU-JOSE.koyeb.app/admin` → actualizar catálogo
- Pedidos: `.../admin/pedidos`

---

## PASO 8: ACTUALIZAR CATÁLOGO Y TICKETS DESDE TELÉFONO

Desde tu ADMIN_PHONE envía WhatsApp a tu bot:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP
```

→ `✅ Catálogo actualizado...`

Cliente compra 5 datos → tú recibes ticket por WhatsApp en ADMIN_PHONE automático + en `.../admin/pedidos`

---

## 📋 LINKS FINALES TELÉFONO GEMMA HUMANO

| Para qué | Link Gratis sin tarjeta | Acción |
|----------|-------------------------|--------|
| Tu código | https://github.com/adel02d/betting-bot | Refrescar, ver Python |
| VPN Gratis teléfono para crear Groq | Play Store → Proton VPN | Install → Connect USA → crear Groq key |
| IA Gratis Gemma humano nube | https://console.groq.com/keys | Con VPN → Create Key gsk_... → Modelo gemma2-9b-it |
| Evolution GitHub | https://github.com/EvolutionAPI/evolution-api | Código open source |
| Deploy Evolution nube gratis | https://app.koyeb.com/services/new (Cuenta 1) | Docker atendai/evolution-api:latest Port 8080 |
| Crear QR | https://TU-EVOLUTION.koyeb.app/docs → POST /instance/create | instanceName energixcu token energixcu123456 qrcode true → QR → Escanear |
| Deploy José nube humano | https://app.koyeb.com/services/new (Cuenta 2) | GitHub adel02d/betting-bot main Python uvicorn... Variables con GROQ Gemma |
| Set Webhook nube a nube | https://TU-EVOLUTION.koyeb.app/docs → POST /webhook/set/energixcu | url https://TU-JOSE.koyeb.app/webhook events MESSAGES_UPSERT |
| Bot vivo | https://TU-JOSE.koyeb.app/ | ok agent Jose provider Evolution llm groq model gemma2-9b-it |
| Panel admin teléfono | https://TU-JOSE.koyeb.app/admin | Actualizar catálogo formulario |
| Ver pedidos | https://TU-JOSE.koyeb.app/admin/pedidos | Tabla tickets + te llega WhatsApp |

**Costo: $0 sin tarjeta, sin Whapi pago, sin nada local, todo nube Koyeb + Groq Gemma, habla como persona real.**

---

## ✅ CHECKLIST FINAL TELÉFONO GEMMA HUMANO

- [ ] Veo Python en https://github.com/adel02d/betting-bot
- [ ] Instalé ProtonVPN gratis en teléfono y con VPN USA creé GROQ_API_KEY gsk_... en https://console.groq.com/keys (o dejo free si no puedo)
- [ ] Deploy Evolution en Koyeb Cuenta 1 Docker Port 8080 Healthy verde URL copiada
- [ ] Creé instancia energixcu POST /instance/create QR escaneado state open
- [ ] Deploy José en Koyeb Cuenta 2 con LLM_PROVIDER=groq GROQ_MODEL=gemma2-9b-it GROQ_API_KEY EVOLUTION_... ADMIN_PHONE Healthy verde
- [ ] Set webhook Evolution POST /webhook/set/energixcu url https://TU-JOSE.koyeb.app/webhook
- [ ] Escribí Hola desde otro teléfono y respondió humano empático con Gemma (no mecánico) → Probé "Mi mamá mayor necesita oxígeno" y respondió humano
- [ ] Verifiqué https://TU-JOSE.koyeb.app/ dice llm groq model gemma2-9b-it
- [ ] Envié Productos Nuevos del Día desde admin y respondió Catálogo actualizado
- [ ] Probé compra 5 datos y me llegó ticket a ADMIN_PHONE por WhatsApp y a /admin/pedidos

¡José ahora habla como persona real con Gemma 2 9B desde tu teléfono, todo en la nube, nada local, 100% gratis! 🎉
