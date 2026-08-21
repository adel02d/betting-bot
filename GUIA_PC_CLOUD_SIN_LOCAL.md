# ☁️ GUÍA FINAL PC — TODO EN LA NUBE, NADA LOCAL — José con Gemma 2 9B (Habla como persona) — Evolution 100% Gratis

**Entendido: NADA LOCAL. Todo en la nube, tu PC solo para desplegar, luego lo apagas y José sigue 24/7 vendiendo.**

**Stack 100% nube, 100% gratis sin tarjeta, sin Whapi pago, sin nada local:**

- **Código:** GitHub (nube) — https://github.com/adel02d/betting-bot
- **IA:** Groq Cloud con Gemma 2 9B (nube, gratis sin tarjeta) — https://console.groq.com/keys — Modelo `gemma2-9b-it` de Google, habla como persona real
- **WhatsApp:** Evolution API Cloud (nube, open source, gratis sin tarjeta) — https://github.com/EvolutionAPI/evolution-api — Desplegado en Koyeb nube
- **Servidor José:** Koyeb Cloud (nube, gratis sin tarjeta) — https://app.koyeb.com — 2 servicios gratis (Evolution + José) con 2 Gmail

**NADA en tu PC después de deploy. Ni Ollama local, ni base de datos local, todo en Koyeb nube.**

---

## 🤖 ¿QUÉ IA USA JOSÉ PARA SONAR HUMANO Y NO MECÁNICO? (TODO EN LA NUBE)

**José usa Google Gemma 2 9B Instruct vía Groq Cloud — 100% nube, gratis, sin tarjeta, humano:**

- **Qué es:** Gemma 2 9B es modelo de Google (familia Gemini), 9 mil millones parámetros, entrenado para conversar natural, empático, con variaciones, como persona real. No es plantilla mecánica.
- **Dónde corre:** En la nube de Groq (https://console.groq.com), empresa USA con GPUs super rápidas, hostea Gemma gratis. Tú sacas API key `gsk_...` gratis sin tarjeta (con VPN gratis una vez por bloqueo Cuba), luego Koyeb (servidor en USA) llama a Groq en la nube, sin necesidad de tu PC.
- **Por qué humano:** En `agent/brain.py` función `generar_respuesta_groq()` uso:
  - Modelo `gemma2-9b-it` (Google Gemma 2 9B Instruct)
  - `temperature=0.7` para variar respuestas, no repetir
  - Prompt humano: "Usa lenguaje natural, contracciones, expresiones cubanas suaves, varía respuestas, muestra empatía, ej 'Entiendo, con los apagones está dura la cosa...', 1-2 emojis max, no digas como IA, di soy Jose de EnergixCu"
  - Herramientas: `listar_catalogo`, `buscar_producto`, `calcular_kit`, `generar_ticket_pedido` → Gemma decide cuándo usarlas y responde humano

- **Diferencia:**
  - **Modo FREE mecánico (sin IA):** `if hola → responde plantilla fija` → cliente nota bot
  - **Con Gemma 2 9B nube:** Cliente dice "Mi mamá mayor necesita oxígeno por las noches" → José responde: "Uy, para tu mamá lo mejor es algo silencioso que no falle de noche... Te recomendaría Kit Intermedio 3kW con batería 24V 100Ah que te da 6-8h para concentrador... ¿Te armo los números?" → Parece persona real de EnergixCu

- **Costo nube:** $0, Groq gratis 14,400 req/día sin tarjeta, sin límite, 100% nube, no local.

**Si no puedes crear Groq ni con VPN, alternativa nube gratis sin tarjeta:** Hugging Face Inference API con Gemma 2 2B: https://huggingface.co/settings/tokens → Create Token gratis → Modelo `google/gemma-2-2b-it` también nube, gratis, sin tarjeta. Pero Groq Gemma 2 9B es más humano y rápido.

---

## 🖥️ TODO PASO A PASO DESDE TU PC, TODO EN LA NUBE, NADA LOCAL (30 min)

### PASO 0: PREPARA PC (5 min)

1.  Instala **Git**: https://git-scm.com/download/win → Download → Instalar por defecto
2.  Instala **Python 3.11**: https://www.python.org/downloads/ → Download → Marca **Add python.exe to PATH**
3.  Instala **VPN gratis** para crear Groq key (Cuba bloqueada, necesitas VPN solo 1 vez para crear key, luego todo en nube sin VPN):
    - **ProtonVPN gratis sin tarjeta:** https://protonvpn.com/free-vpn → Download Windows → Sign Up Gmail → Connect USA
    - Alternativa: Windscribe https://windscribe.com (10GB gratis)

### PASO 1: CLONAR TU REPO (2 min) — Solo para verificar, no quedará local después

Abre **CMD** (Windows → escribe `cmd` → Enter):

```
cd Desktop
git clone https://github.com/adel02d/betting-bot.git
cd betting-bot
dir
```

Debes ver `agent/`, `config/`, `GUIA_PC_CLOUD_SIN_LOCAL.md` (esta guía). Si no, `git pull`.

Este clon es solo para ver código, **NO quedará corriendo local**. Todo se desplegará en la nube Koyeb.

### PASO 2: CREAR API KEY GROQ GEMMA 2 9B 100% GRATIS EN LA NUBE (5 min) — Con VPN solo una vez

1.  **Activa VPN:** ProtonVPN → Connect **United States**
2.  Entra a https://console.groq.com/keys (con VPN activada)
3.  Sign Up con Gmail → Verify email
4.  **Create API Key** → Nombre `energixcu-jose-gemma-nube` → Create → Copia `gsk_...` largo → Guarda en Bloc de notas como `GROQ_API_KEY`
5.  **Desactiva VPN** → Ya no la necesitas nunca más, Koyeb está en USA y usará Groq en la nube sin bloqueo

**¿Por qué VPN solo una vez?** Groq bloquea IPs Cuba para crear cuenta, pero una vez creada la key, Koyeb (servidor en USA) la usa en la nube sin VPN, sin bloqueo, 100% nube.

Guarda en nota:
```
GROQ_API_KEY = gsk_...
GROQ_MODEL = gemma2-9b-it
```

### PASO 3: DESPLEGAR EVOLUTION API EN LA NUBE KOYEB (5 min) — 100% GRATIS SIN TARJETA, NADA LOCAL

**¿Qué es Evolution?** Tu propio Whapi gratis para siempre en la nube, open source, conectas tu número escaneando QR, sin pagar.

- GitHub: https://github.com/EvolutionAPI/evolution-api
- Docs Koyeb: https://doc.evolution-api.com/v1/installation/koyeb
- Koyeb: https://app.koyeb.com
- Nuevo servicio: https://app.koyeb.com/services/new

**Con Gmail 1 (Cuenta 1):**

1.  https://app.koyeb.com → Sign Up → Continue with GitHub → autoriza `adel02d`
2.  Create Service → **Docker** (NO Buildpack) → Imagen `atendai/evolution-api:latest` → Search → Selecciona
3.  Service name: `evolution-energixcu` → Instance Eco e2-micro gratis → Port `8080`
4.  Variables (4):

```
SERVER_URL = https://tu-evolution-xxxx.koyeb.app (temporal)
AUTHENTICATION_TYPE = apikey
AUTHENTICATION_API_KEY = energixcu123456 (inventa, guarda como EVOLUTION_API_KEY)
QRCODE_LIMIT = 30
```

5.  Deploy → 4-6 min → Healthy verde → copia URL `https://evolution-energixcu-xxxx.koyeb.app` → guarda como `EVOLUTION_API_URL`
6.  Settings → Environment → edita `SERVER_URL` con tu URL real `https://evolution-...koyeb.app` → Save → Redeploy

**Ahora tu Evolution vive en la nube, nada local.**

### PASO 4: CONECTAR TU NÚMERO WHATSAPP A EVOLUTION NUBE (QR) (3 min) — Todo en nube

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
3.  WhatsApp → Ajustes → Dispositivos vinculados → Vincular dispositivo → Escanea QR → state `open` (verifica con GET `/instance/fetchInstances`)

Guarda:
```
EVOLUTION_INSTANCE = energixcu
```

### PASO 5: DESPLEGAR JOSÉ EN LA NUBE KOYEB CON GEMMA 2 9B NUBE (5 min) — NADA LOCAL, TODO NUBE

**Con Gmail 2 (Cuenta 2) para segundo servicio gratis:**

1.  https://app.koyeb.com con Gmail 2 → Create Service → GitHub → `adel02d/betting-bot` → Branch `main` → Buildpack Python → Run command copia EXACTO:
```
uvicorn agent.main:app --host 0.0.0.0 --port 8000
```
2.  Port `8000` → Eco gratis → Variables 8 (TODO NUBE, NADA LOCAL):

```
LLM_PROVIDER = groq
GROQ_API_KEY = gsk_tu_key_de_Paso_2 (Groq nube con Gemma 2 9B)
GROQ_MODEL = gemma2-9b-it
WHATSAPP_PROVIDER = evolution
EVOLUTION_API_URL = https://tu-evolution-xxxx.koyeb.app (del Paso 3)
EVOLUTION_API_KEY = energixcu123456
EVOLUTION_INSTANCE = energixcu
ADMIN_PHONE = +5351234567 (TU número con +53 donde recibirás tickets por WhatsApp)
PORT = 8000
ENVIRONMENT = production
```

3.  Deploy → Healthy verde → copia URL José `https://tu-jose-xxxx.koyeb.app` → webhook `https://TU-JOSE.koyeb.app/webhook`

**Ahora José vive en la nube Koyeb, con IA Gemma en la nube Groq, WhatsApp Evolution en la nube, NADA en tu PC. Puedes apagar tu PC y sigue 24/7.**

### PASO 6: CONECTAR EVOLUTION NUBE CON JOSÉ NUBE (Webhook) (2 min) — Nube con nube

- En `https://TU-EVOLUTION.koyeb.app/docs` → POST `/webhook/set/energixcu` → Body:
```json
{
  "webhook": {
    "enabled": true,
    "url": "https://TU-JOSE.koyeb.app/webhook",
    "events": ["MESSAGES_UPSERT"]
  }
}
```
- Execute → success

### PASO 7: PROBAR JOSÉ HUMANO CON GEMMA NUBE (1 min) — Nada local

- Desde OTRO teléfono escribe a tu número bot (el conectado a Evolution): `Hola, busco algo para mi bebé, los apagones están duros`
- **Con Gemma 2 9B nube debe responder humano:** "Hola! Entiendo perfectamente, con un bebé los apagones se hacen más difíciles 😔... Para tu caso con nevera para leche y ventilador, te recomendaría Kit Intermedio 3kW..."
- Sin WhatsApp: `https://TU-JOSE.koyeb.app/admin/test` → escribe `Mi mamá mayor necesita oxígeno por las noches` → debe responder empático humano, no plantilla mecánica
- Vivo?: `https://TU-JOSE.koyeb.app/` → `{"provider":"ProveedorEvolution","llm":"groq","model":"gemma2-9b-it"}` → dice groq gemma2-9b-it nube
- Panel: `https://TU-JOSE.koyeb.app/admin` → actualizar catálogo
- Pedidos: `https://TU-JOSE.koyeb.app/admin/pedidos`

**Si no responde:** Koyeb Jose Logs → ¿GROQ_API_KEY invalid? → copia bien key. Koyeb Evolution Logs → ¿state close? → repite QR.

### PASO 8: ACTUALIZAR CATÁLOGO Y TICKETS (Nube, sin PC local)

- Desde tu ADMIN_PHONE envía WhatsApp a tu bot (número conectado a Evolution nube):
```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP
```
Jose: `✅ Catálogo actualizado...` (guarda en `data/catalog.json` en la nube Koyeb, no local)

- Cliente compra → tú recibes ticket por WhatsApp en ADMIN_PHONE automático (función `notificar_admin_nuevo_pedido()` en la nube, usa Evolution nube para enviarte)

Ver todos: `https://TU-JOSE.koyeb.app/admin/pedidos` (nube)

**NADA LOCAL:** Ni catálogo, ni pedidos, ni IA, todo en Koyeb nube.

---

## 📋 LINKS FINALES TODO EN LA NUBE, NADA LOCAL, GEMMA HUMANO

| Para qué | Link Gratis sin tarjeta | Acción |
|----------|-------------------------|--------|
| Tu código José nube | https://github.com/adel02d/betting-bot | Clone solo para ver, no queda local |
| VPN Gratis para crear Groq (Cuba bloquea) | https://protonvpn.com/free-vpn | Download → Connect USA → crear Groq key |
| IA Gratis Gemma nube (humano) | https://console.groq.com/keys | Con VPN → Create Key gsk_... → Modelo gemma2-9b-it |
| Evolution GitHub | https://github.com/EvolutionAPI/evolution-api | Código open source nube |
| Deploy Evolution nube gratis | https://app.koyeb.com/services/new (Cuenta 1) | Docker atendai/evolution-api:latest Port 8080 Variables |
| Crear QR Evolution nube | https://TU-EVOLUTION.koyeb.app/docs → POST /instance/create | instanceName energixcu token energixcu123456 qrcode true → QR → Escanear |
| Deploy José nube con Gemma | https://app.koyeb.com/services/new (Cuenta 2) | GitHub adel02d/betting-bot main Python Run uvicorn... Variables 8 con GROQ Gemma |
| Set Webhook nube a nube | https://TU-EVOLUTION.koyeb.app/docs → POST /webhook/set/energixcu | url https://TU-JOSE.koyeb.app/webhook events MESSAGES_UPSERT |
| Bot vivo nube | https://TU-JOSE.koyeb.app/ | Debe decir provider Evolution llm groq model gemma2-9b-it |
| Panel admin nube | https://TU-JOSE.koyeb.app/admin | Actualizar catálogo |
| Ver pedidos nube | https://TU-JOSE.koyeb.app/admin/pedidos | Tabla tickets + te llega WhatsApp |
| Probar sin WhatsApp nube | https://TU-JOSE.koyeb.app/admin/test | Escribir como cliente, prueba humano |

**Costo: $0 sin tarjeta, sin Whapi pago, sin nada local, todo en la nube Koyeb + Groq Gemma, funciona 24/7 aunque apagues tu PC.**

---

## ✅ CHECKLIST FINAL TODO NUBE, NADA LOCAL, GEMMA HUMANO

- [ ] Instalé Git, Python, ProtonVPN gratis en PC
- [ ] Cloné repo (solo para ver, no queda local corriendo)
- [ ] Con VPN USA creé GROQ_API_KEY gsk_... en https://console.groq.com/keys
- [ ] Deploy Evolution en Koyeb Cuenta 1 Docker Port 8080 Healthy verde URL copiada
- [ ] Creé instancia energixcu POST /instance/create QR escaneado state open
- [ ] Deploy José en Koyeb Cuenta 2 con Variables LLM_PROVIDER=groq GROQ_MODEL=gemma2-9b-it GROQ_API_KEY EVOLUTION_... ADMIN_PHONE Healthy verde URL copiada
- [ ] Set webhook Evolution POST /webhook/set/energixcu url https://TU-JOSE.koyeb.app/webhook
- [ ] Escribí Hola desde otro teléfono a mi número bot y respondió humano empático con Gemma (no plantilla mecánica) → Probé "Mi mamá mayor necesita oxígeno" y respondió humano
- [ ] Verifiqué https://TU-JOSE.koyeb.app/ dice llm groq model gemma2-9b-it
- [ ] Envié Productos Nuevos del Día desde admin y respondió Catálogo actualizado (nube)
- [ ] Probé compra 5 datos y me llegó ticket a ADMIN_PHONE por WhatsApp y a /admin/pedidos (todo nube)
- [ ] Apagué mi PC y probé de nuevo escribir a bot → Sigue respondiendo porque todo está en la nube Koyeb + Groq

¡José ahora habla como persona real con Gemma 2 9B en la nube, 100% gratis, sin tarjeta, nada local, 24/7! 🎉
