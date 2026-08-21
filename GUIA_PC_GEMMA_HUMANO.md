# 🖥️ GUÍA DEFINITIVA PC — José con IA Gratuita Gemma (Habla como persona real) — Evolution 100% Gratis

Estás en PC ahora, perfecto. Antes estábamos limitados a modo FREE mecánico porque en teléfono no podías crear API Groq bloqueada en Cuba. **En PC con VPN gratis puedes crear API Groq con Gemma 2 9B, 100% gratis sin tarjeta, y José dejará de sonar mecánico y hablará como persona real.**

---

## 🤖 ¿QUÉ IA ESTÁ USANDO JOSÉ AHORA PARA SONAR HUMANO?

### Antes (modo FREE mecánico que te quejabas):
- Sin API, solo reglas `if "hola" → responde plantilla`
- Respuestas siempre iguales, mecánicas, cliente nota que es bot

### Ahora (con Gemma, como pediste — humano, cliente cree que habla con persona):

**Gemma 2 9B Instruct de Google — Modelo abierto, gratuito, humano:**

- **Qué es Gemma:** Modelo de IA creado por Google, familia de Gemini, versión abierta pequeña. Gemma 2 9B tiene 9 mil millones de parámetros, entrenado para conversar natural, empático, como persona.
- **Por qué es más humano que modo FREE:** Gemma entiende contexto, recuerda que cliente tiene bebé, usa lenguaje natural variado, contracciones, empatía, no repite plantilla.
- **Dónde corre gratis sin tarjeta:**
  - **Groq (RECOMENDADO):** https://console.groq.com/keys → Groq hostea Gemma 2 9B con GPUs super rápidas, gratis 14,400 req/día, sin tarjeta, solo Gmail + VPN una vez (por bloqueo Cuba). Una vez sacas key `gsk_...`, Koyeb (servidor USA) usa Groq sin VPN, sin bloqueo.
  - **Ollama Local (100% offline, sin internet, sin tarjeta, sin bloqueo Cuba, funciona en tu PC):** https://ollama.com → Instalas Ollama en tu PC Windows → `ollama run gemma2:2b` (2B = 1.6GB, rápido, laptop 8GB RAM) o `gemma2:9b` (9B = 5.4GB, más humano, necesita 12GB RAM). Corre en tu PC, no necesita internet después, no pide API, 100% tuyo.

**Cómo hace José para sonar humano con Gemma:**

En `agent/brain.py` función `generar_respuesta_groq()` ahora usa:
```python
model = "gemma2-9b-it"  # Google Gemma 2 9B Instruct - humano, natural, como pediste
temperature = 0.7  # Creatividad para variar respuestas
system_prompt + "IMPORTANTE PARA SONAR HUMANO: Usa lenguaje natural, contracciones, expresiones cubanas suaves, varía respuestas, muestra empatía, ej: 'Entiendo, con los apagones está dura la cosa...', 1-2 emojis max, no digas 'como IA'"
```

Además `config/prompts.yaml` lo actualicé con:
- Tono cercano con calor humano cubano suave
- Variedad, no repetir plantilla
- Empatía si cliente dice "tengo bebé", "mamá mayor"
- Evitar mecánico: no digas "no tengo esa información", di "déjame verificarte eso"

**Resultado:** Cliente cree que habla con Jose persona real de EnergixCu, no bot.

**Si no puedes crear Groq ni con VPN, usa Ollama local Gemma 2 2B que también habla como persona y es 100% offline gratis sin tarjeta y sin bloqueo.**

---

## 📋 TODO PASO A PASO DESDE TU PC (Windows) — DESDE CERO

### PASO 0: INSTALAR PROGRAMAS EN TU PC (5 min) — 100% gratis

1.  **Instalar Git:** https://git-scm.com/download/win → Download → Instalar con todo por defecto
2.  **Instalar Python 3.11:** https://www.python.org/downloads/ → Download Python 3.11 → Instalar marcando **Add python.exe to PATH**
3.  **Instalar Chrome** si no tienes
4.  **Instalar VPN gratis para crear API Groq (porque Groq bloquea Cuba):**
    - **ProtonVPN gratis sin tarjeta:** https://protonvpn.com/free-vpn → Download Windows → Sign Up con Gmail → Conectar a USA
    - Alternativa: **Windscribe gratis sin tarjeta:** https://windscribe.com → Sign Up → 10GB gratis
    - O **Psiphon gratis:** https://psiphon.ca

### PASO 1: CLONAR TU REPO EN TU PC (2 min)

1.  Abre **CMD** (tecla Windows → escribe `cmd` → Enter)
2.  Ve a Escritorio: `cd Desktop`
3.  Clona: `git clone https://github.com/adel02d/betting-bot.git`
4.  Entra: `cd betting-bot`
5.  Verifica: `dir` → debes ver carpetas `agent/`, `config/`, `GUIA_PC_GEMMA_HUMANO.md`

### PASO 2: CREAR ENTORNO PYTHON E INSTALAR (3 min)

En CMD dentro de `betting-bot`:

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Verás instalar `fastapi`, `groq`, `anthropic`, etc.

### PASO 3: CREAR API KEY GROQ CON GEMMA 2 9B (5 min) — Necesitas VPN porque Cuba bloqueada

1.  **Activa VPN:** Abre ProtonVPN → Conectar a **United States** o **Netherlands** → Debe decir Connected
2.  Entra a https://console.groq.com/keys con VPN activada
3.  Sign Up con Gmail → Verify email
4.  **Create API Key** → Nombre `energixcu-jose-gemma` → Create → Copia `gsk_...` largo → Guarda en Bloc de notas como `GROQ_API_KEY`
5.  **Desactiva VPN** (ya no la necesitas, Koyeb está en USA y usará Groq sin bloqueo)

**¿Por qué VPN solo una vez?** Groq bloquea IPs Cuba para crear cuenta, pero una vez creada la key, Koyeb (servidor en USA) la usa sin VPN sin problema. Tu PC en Cuba no necesita VPN después para usar bot, solo Koyeb usa Groq.

**Alternativa sin VPN si Groq no te deja ni con VPN:** Usa **Ollama local Gemma** (PASO 3B) o **Hugging Face Token** https://huggingface.co/settings/tokens → Create Token (gratis sin tarjeta, no bloquea Cuba tanto) → Modelo `google/gemma-2-2b-it`

### PASO 3B: ALTERNATIVA 100% OFFLINE SIN API, SIN VPN, SIN TARJETA — OLLAMA GEMMA LOCAL (Recomendado si no puedes Groq)

**Instalar Ollama en tu PC Windows (100% gratis offline, Gemma corre en tu PC, sin internet después, habla como persona):**

1.  Entra a https://ollama.com → **Download** → Windows → Instalar
2.  Abre CMD → Ejecuta:
```
ollama run gemma2:2b
```
- Primera vez descarga 1.6GB, espera 5-10 min
- Para más humano pero más pesado: `ollama run gemma2:9b` (5.4GB, necesita 12GB RAM)

3.  Te abrirá chat con Gemma local → Escribe `Hola, eres Jose de EnergixCu?` → Responde humano → Escribe `/bye` para salir

4.  Ollama quedará corriendo en `http://localhost:11434` → Tu bot Jose puede usarlo

**Para usar Ollama con Jose en tu PC (modo dev local):**

En tu `.env` (crea archivo `.env` copiando `.env.example`):

```
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://tu-evolution.koyeb.app
EVOLUTION_API_KEY=energixcu123456
EVOLUTION_INSTANCE=energixcu
ADMIN_PHONE=+5351234567
```

---

### PASO 4: CONFIGURAR .env EN TU PC (2 min)

En carpeta `betting-bot`, copia `.env.example` a `.env`:

```
copy .env.example .env
```

Abre `.env` con Bloc de notas y pon:

**Si conseguiste Groq (con VPN) — RECOMENDADO para humano + nube:**

```
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_tu_key_de_Groq
GROQ_MODEL=gemma2-9b-it
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://tu-evolution-xxxx.koyeb.app
EVOLUTION_API_KEY=energixcu123456
EVOLUTION_INSTANCE=energixcu
ADMIN_PHONE=+5351234567
PORT=8000
```

**Si NO conseguiste Groq y usas Ollama local Gemma (100% offline gratis):**

```
LLM_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://tu-evolution-xxxx.koyeb.app
EVOLUTION_API_KEY=energixcu123456
EVOLUTION_INSTANCE=energixcu
ADMIN_PHONE=+5351234567
```

**Si quieres probar sin Evolution aún, solo local:**

```
LLM_PROVIDER=free (o ollama o groq)
WHATSAPP_PROVIDER=evolution (o deja simulado)
```

---

### PASO 5: PROBAR JOSÉ EN TU PC CON GEMMA HUMANO (2 min) — Sin desplegar aún

En CMD con `venv` activado:

```
python tests/test_local.py
```

Verás:

```
Jose: ¡Hola! 👋 Soy Jose de EnergixCu ⚡...
Tu: Hola, busco panel para nevera y bebé en casa
Jose: Entiendo, con bebé los apagones son más duros... Para nevera + luces te recomiendo Kit Intermedio 3kW... ¿Te parece?
```

Prueba que ya NO suena mecánico: pregunta `Tengo mi mamá mayor que necesita oxígeno, qué me recomiendas?` → José debe responder empático humano, no plantilla.

Si usas Ollama, debe responder rápido (2-5 seg). Si usas Groq, también rápido.

Si dice modo free mecánico, revisa `.env` tiene `LLM_PROVIDER=groq` y `GROQ_API_KEY`.

---

### PASO 6: DESPLEGAR EVOLUTION API EN KOYEB GRATIS (5 min) — Desde PC más fácil

**Links:**
- Koyeb: https://app.koyeb.com
- Evolution GitHub: https://github.com/EvolutionAPI/evolution-api
- Docs: https://doc.evolution-api.com/v1/installation/koyeb

1.  Entra a https://app.koyeb.com con Gmail 1 → Create Service → Docker → Imagen `atendai/evolution-api:latest` → Port 8080 → Instance Eco e2-micro gratis → Variables:

```
SERVER_URL = https://tu-evolution-xxxx.koyeb.app (temporal, luego real)
AUTHENTICATION_TYPE = apikey
AUTHENTICATION_API_KEY = energixcu123456
AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES = true
QRCODE_LIMIT = 30
```

Deploy → copia URL `https://evolution-....koyeb.app` → Settings → Environment → edita `SERVER_URL` con tu URL real → Redeploy

2.  **Conectar número WhatsApp:** Abre `https://TU-EVOLUTION.koyeb.app/docs` → POST /instance/create → Try it out → Body:

```json
{
  "instanceName": "energixcu",
  "token": "energixcu123456",
  "qrcode": true
}
```
Execute → copia base64 QR → pega en nueva pestaña `data:image/png;base64,...` → QR → escanea con WhatsApp → Dispositivos vinculados → Vincular → state open

Guarda:
```
EVOLUTION_API_URL = https://tu-evolution.koyeb.app
EVOLUTION_API_KEY = energixcu123456
EVOLUTION_INSTANCE = energixcu
```

---

### PASO 7: DESPLEGAR JOSÉ EN KOYEB CON GEMMA 2 9B (5 min)

Con Gmail 2:

1.  https://app.koyeb.com → Create Service → GitHub → `adel02d/betting-bot` main → Buildpack Python → Run `uvicorn agent.main:app --host 0.0.0.0 --port 8000` → Port 8000 → Variables (7 + Groq Gemma):

```
LLM_PROVIDER = groq
GROQ_API_KEY = gsk_tu_key
GROQ_MODEL = gemma2-9b-it
WHATSAPP_PROVIDER = evolution
EVOLUTION_API_URL = https://tu-evolution.koyeb.app
EVOLUTION_API_KEY = energixcu123456
EVOLUTION_INSTANCE = energixcu
ADMIN_PHONE = +5351234567
PORT = 8000
ENVIRONMENT = production
```

Si usas Ollama local, no puedes desplegar Ollama en Koyeb gratis (necesita GPU), así que para producción usa Groq Gemma. Para dev local usa Ollama.

Deploy → Healthy verde → copia URL `https://tu-jose-xxxx.koyeb.app` → webhook `https://TU-JOSE.koyeb.app/webhook`

---

### PASO 8: CONECTAR EVOLUTION CON JOSÉ (Webhook) (2 min)

En `https://TU-EVOLUTION.koyeb.app/docs` → POST `/webhook/set/energixcu` → Body:

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

### PASO 9: PROBAR JOSÉ HUMANO CON GEMMA (1 min)

- Desde otro teléfono escribe a tu número bot: `Hola, busco algo para mi bebé, los apagones están duros`
- **Antes (modo free mecánico):** Respondía plantilla "¡Hola! Soy Jose de EnergixCu... Tengo paneles 100W-550W..."
- **Ahora con Gemma 2 9B:** Debe responder humano: "Hola! Entiendo perfectamente, con un bebé los apagones se hacen más difíciles 😔... Para tu caso con nevera para leche y ventilador, te recomendaría el Kit Intermedio 3kW que te da 6-8h... ¿Te parece si te armo los números?"

Prueba: `Mi mamá mayor necesita oxígeno por las noches, qué me recomiendas?` → Debe responder empático humano, no mecánico.

**Ver modo IA:** `https://TU-JOSE.koyeb.app/` → debe decir `"provider":"ProveedorEvolution","llm":"groq"` y modelo `gemma2-9b-it`

---

### PASO 10: ACTUALIZAR CATÁLOGO Y TICKETS (Sigue igual, gratis)

Desde tu ADMIN_PHONE envía WhatsApp a tu bot:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP
```

Jose: `✅ Catálogo actualizado...`

Cliente compra → tú recibes ticket por WhatsApp en ADMIN_PHONE automático (función `notificar_admin_nuevo_pedido()`)

Ver pedidos: `https://TU-JOSE.koyeb.app/admin/pedidos`

---

## 📋 LINKS FINALES PC CON GEMMA HUMANO

| Para qué | Link Gratis sin tarjeta | Acción |
|----------|-------------------------|--------|
| Tu código | https://github.com/adel02d/betting-bot | Clone en PC |
| VPN Gratis para crear Groq (Cuba bloquea) | https://protonvpn.com/free-vpn o https://windscribe.com | Download Windows → Connect USA → crear Groq key |
| IA Gratis Gemma Groq | https://console.groq.com/keys | Sign Up Gmail (con VPN) → Create Key gsk_... → Modelo gemma2-9b-it |
| IA Gratis Local Ollama Gemma | https://ollama.com/download | Download Windows → `ollama run gemma2:2b` → 100% offline |
| Evolution Repo | https://github.com/EvolutionAPI/evolution-api | Código open source |
| Deploy Evolution Koyeb | https://app.koyeb.com/services/new | Docker atendai/evolution-api:latest Port 8080 |
| Crear QR Evolution | https://TU-EVOLUTION.koyeb.app/docs → POST /instance/create | instanceName energixcu qrcode true |
| Deploy Jose Koyeb | https://app.koyeb.com/services/new | GitHub adel02d/betting-bot Python uvicorn... |
| Set Webhook Evolution | .../docs → POST /webhook/set/energixcu | url https://TU-JOSE.koyeb.app/webhook |
| Bot vivo | https://TU-JOSE.koyeb.app/ | ok agent Jose provider Evolution llm groq model gemma2-9b-it |
| Panel admin | https://TU-JOSE.koyeb.app/admin | Actualizar catálogo |
| Ver pedidos | https://TU-JOSE.koyeb.app/admin/pedidos | Tabla tickets |
| Probar sin WhatsApp | https://TU-JOSE.koyeb.app/admin/test | Probar José humano |

---

## ❓ ¿POR QUÉ GEMMA SUENA MÁS HUMANO QUE MODO FREE?

- **FREE:** Reglas `if hola → responde plantilla` → siempre igual, mecánico, cliente nota bot
- **GEMMA 2 9B:** Modelo de Google entrenado con conversaciones humanas, entiende contexto, empatía, varía lenguaje, usa expresiones naturales, no repite plantilla, parece persona real de EnergixCu. Con prompt que agregué: "Usa lenguaje natural, contracciones, expresiones cubanas suaves, muestra empatía, 1-2 emojis max, no digas como IA"

Prueba: Pregunta en modo FREE "Tengo bebé y los apagones son duros" → responde genérico catálogo. Con Gemma → "Uy, entiendo, con bebé los apagones se hacen pesadilla, sobre todo para la leche..."

**Costo:** $0 con Groq (14,400 req/día gratis, sin tarjeta, con VPN una vez) o $0 con Ollama local offline sin internet después.

---

## ✅ CHECKLIST FINAL PC CON GEMMA HUMANO

- [ ] Instalé Git, Python, VPN Proton gratis en PC
- [ ] Cloné `git clone https://github.com/adel02d/betting-bot.git` en Desktop
- [ ] `pip install -r requirements.txt` con venv
- [ ] Con VPN USA creé GROQ_API_KEY en https://console.groq.com/keys gsk_... y guardé (o instalé Ollama y `ollama run gemma2:2b`)
- [ ] Deploy Evolution en Koyeb Cuenta 1 Docker con QR escaneado state open
- [ ] Deploy Jose en Koyeb Cuenta 2 con Variables LLM_PROVIDER=groq GROQ_MODEL=gemma2-9b-it GROQ_API_KEY EVOLUTION_... ADMIN_PHONE
- [ ] Set webhook Evolution POST /webhook/set/energixcu url https://TU-JOSE.koyeb.app/webhook
- [ ] Escribí Hola desde otro teléfono y respondió humano empático (no plantilla mecánica)
- [ ] Probé `Tengo bebé, apagones duros` y respondió con empatía humana, no mecánico
- [ ] Envié Productos Nuevos del Día desde admin y respondió Catálogo actualizado
- [ ] Probé compra 5 datos y me llegó ticket a mi ADMIN_PHONE por WhatsApp

¡José ahora habla como persona real con Gemma 2 9B, 100% gratis, sin tarjeta, solo PC + teléfono! 🎉
