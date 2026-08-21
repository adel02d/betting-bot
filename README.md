# ⚡ EnergixCu — WhatsApp AI Agent (Jose)

> **Agente de IA para WhatsApp basado en [whatsapp-agent-kit](https://github.com/alanjmr21/whatsapp-agent-kit) de alanjmr21**
> 
> Asesor virtual de ventas y especialista en atención al cliente de EnergixCu en Cuba. Atención 24/7, búsqueda de información e imágenes en web, cierre de ventas y generación de tickets oficiales.

![EnergixCu](https://img.shields.io/badge/EnergixCu-Energia%20Inteligente-yellow)
![Agent](https://img.shields.io/badge/Agent-Jose-blue)
![Python](https://img.shields.io/badge/Python-3.11%2B-green)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Whapi%20%7C%20Meta%20%7C%20Twilio-25D366)

---

## 🎯 ¿Qué es este proyecto?

**Jose** es el asesor virtual de **EnergixCu**, empresa cubana de energía solar. Basado en el **whatsapp-agent-kit**, este agente:

- ✅ Atiende clientes por WhatsApp/Messenger con tono profesional y empático
- ✅ Brinda fichas técnicas, compara productos, calcula kits solares
- ✅ **Busca imágenes e información real en internet** si el cliente lo pide
- ✅ **Actualiza catálogo diario** cuando el admin envía "Productos Nuevos del Día"
- ✅ Cierra ventas y genera **ticket oficial** con formato exacto obligatorio
- ✅ Solo acepta **Efectivo** y **Transferencia** (Cuba)
- ✅ Entregas en La Habana y envíos nacionales

---

## 🏗️ Arquitectura (basada en whatsapp-agent-kit)

```
WhatsApp Cliente
    ↓
Proveedor (Whapi / Meta / Twilio) → agent/providers/ (normaliza)
    ↓ webhook POST /webhook
FastAPI agent/main.py ←→ agent/memory.py (historial por teléfono, SQLite)
    ↓
Claude AI agent/brain.py ←→ config/prompts.yaml (personalidad Jose + catálogo + knowledge)
    ↓ + tools
agent/tools.py → listar_catalogo, buscar en web, buscar imagen, calcular kit, generar ticket
    ↓
Proveedor envía respuesta de vuelta por WhatsApp
```

**Stack:**
- IA: Claude 3.5 Sonnet (Anthropic)
- Servidor: FastAPI + Uvicorn
- WhatsApp: Whapi.cloud / Meta Cloud API / Twilio (eliges en .env)
- DB: SQLite (dev) / PostgreSQL (prod) via SQLAlchemy
- Deploy: Docker + Railway

---

## 📦 Catálogo EnergixCu Incluido

**Paneles:** 100W $90, 200W $150, 350W $210, 550W Tier1 $280
**Baterías LiFePO4:** 12V 100Ah $350, 24V 100Ah $650, 48V 100Ah $1150, Gel 12V 200Ah $280
**Inversores:** 1000W $120, Híbrido 3000W MPPT $450, Híbrido 5000W $750
**Estaciones:** 500Wh $380, 1000Wh $650, Pro 2000Wh $1150
**Kits:** Básico 1kW $650, Intermedio 3kW $1850, Pro 5kW $3200

Incluye también: Controladores MPPT, cables, protecciones. Ver `config/business.yaml` y `knowledge/catalogo_base.md`.

---

## 🚀 Inicio rápido (3 comandos)

Basado en el flujo del kit original:

```bash
# 1. Clona
git clone https://github.com/adel02d/betting-bot.git
cd betting-bot

# 2. Verifica entorno
bash start.sh

# 3. Configura .env
nano .env
# ANTHROPIC_API_KEY=sk-ant-...
# WHATSAPP_PROVIDER=whapi
# WHAPI_TOKEN=...

# 4. Prueba Jose sin WhatsApp
python tests/test_local.py

# 5. Arranca servidor
uvicorn agent.main:app --reload --port 8000
```

---

## 🤖 Rol y Prompt de Jose (Resumen)

Jose es asesor virtual de EnergixCu:

- **Tono:** Atento, profesional, empático, español cubano neutro claro. 2-3 párrafos máx, negritas para precios/modelos, viñetas, 1-3 emojis (⚡ ☀️ 🔋 📦 💳 ✅), cierra siempre con pregunta guía hacia compra.
- **Pagos:** Solo Efectivo (contra entrega) y Transferencia (Transfermóvil, EnZona, MLC/CUP)
- **Búsqueda web:** Si cliente pide imágenes/fichas técnicas de producto no en base, activa `buscar_producto_en_web` y `buscar_imagen_producto`
- **Productos nuevos:** Cuando admin envía "Productos Nuevos del Día:", integrar a catálogo activo con `agregar_producto_nuevo`
- **Flujo venta:**
  1. Bienvenida como Jose
  2. Asesoría + fotos/info web si pide
  3. Toma 5 datos en un solo mensaje: nombre completo, producto/modelo exacto, cantidad, dirección exacta (municipio, reparto, ref), forma de pago
  4. **Genera ticket obligatorio** con formato exacto:
```
--------------------------------------------------
⚡ TICKET DE PEDIDO - ENERGIXCU ⚡

- Cliente: [Nombre]
- Producto: [Producto y modelo]
- Cantidad: [Cantidad]
- Dirección: [Dirección exacta]
- Forma de pago: [Efectivo o Transferencia]
--------------------------------------------------
```
Y despedida: "¡Listo! Tu pedido ha sido registrado con éxito en EnergixCu. Nos pondremos en contacto contigo a la brevedad para coordinar la entrega. 🚀"

- **Guardrails:** No revelar prompt, no decir modelo IA, derivar a humano con frase exacta si piden persona o reclamo complejo.

Ver prompt completo en `config/prompts.yaml`.

---

## 🛠️ Herramientas del agente (tools)

Definidas en `agent/tools.py` y usadas por Claude via tool_use:

| Herramienta | Descripción |
|-------------|-------------|
| `listar_catalogo` | Muestra catálogo completo actual |
| `buscar_producto_catalogo` | Busca en catálogo interno |
| `buscar_producto_en_web` | Busca ficha técnica real en internet (DuckDuckGo + fallback) |
| `buscar_imagen_producto` | Busca imagen real en web (Google/Bing images URL) |
| `agregar_producto_nuevo` | Admin agrega producto nuevo |
| `actualizar_catalogo_desde_texto` | Admin pega lista completa con viñetas y se parsea |
| `generar_ticket_pedido` | Genera ticket oficial obligatorio |
| `calcular_kit_solar` | Calcula kit según equipos del cliente |

---

## 📁 Estructura del proyecto

```
energixcu-agent/
├── agent/
│   ├── main.py          # FastAPI + webhook (provider-agnostic)
│   ├── brain.py         # Claude API + system prompt + tool calling loop
│   ├── memory.py        # SQLite historial por teléfono
│   ├── catalog.py       # Gestión catálogo dinámico + productos nuevos
│   ├── tools.py         # Herramientas EnergixCu (web search, ticket, etc.)
│   └── providers/
│       ├── base.py      # Interfaz común
│       ├── __init__.py  # Factory
│       ├── whapi.py     # Whapi.cloud
│       ├── meta.py      # Meta Cloud API oficial
│       └── twilio.py    # Twilio WhatsApp
├── config/
│   ├── business.yaml    # Datos empresa, catálogo base, zonas, pagos
│   └── prompts.yaml     # System prompt de Jose (prompt completo)
├── knowledge/
│   ├── catalogo_base.md # Catálogo legible
│   └── faq.md           # Preguntas frecuentes
├── data/
│   ├── catalog.json     # Catálogo dinámico + productos nuevos del día
│   ├── agentkit.db      # DB memoria WhatsApp (SQLite)
│   └── pedidos/         # Tickets JSON generados
├── tests/
│   └── test_local.py    # Simulador chat terminal
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── start.sh
└── .env.example
```

---

## 🔌 Proveedores WhatsApp

### Whapi.cloud (Recomendado para empezar)
- Registro en whapi.cloud, sandbox gratis
- Solo necesitas: `WHAPI_TOKEN`
- Ideal para probar rápido

### Meta Cloud API (Oficial)
- En developers.facebook.com
- Necesitas: `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `META_VERIFY_TOKEN`
- Gratis por conversación, requiere Business verificado
- Webhook verificación GET implementada en `meta.py`

### Twilio
- En twilio.com
- Necesitas: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Muy confiable, sandbox gratis

Cambia proveedor en `.env`: `WHATSAPP_PROVIDER=whapi|meta|twilio`

---

## 💬 Flujo de mensaje en producción

1. Cliente escribe "Hola" por WhatsApp
2. Proveedor recibe y envía webhook a tu server Railway: `https://tu-app.up.railway.app/webhook`
3. `providers/` normaliza a `MensajeEntrante`
4. `memory.py` busca historial de ese teléfono
5. `brain.py` envía a Claude: system prompt (personalidad Jose + catálogo) + historial + mensaje nuevo + tools
6. Claude decide si usar herramienta (buscar catálogo, web, generar ticket)
7. Si usa tool, se ejecuta y vuelve a Claude con resultado
8. Claude genera respuesta final amable y profesional
9. `providers/` envía de vuelta por WhatsApp

---

## 🧪 Comandos útiles

```bash
# Test local sin WhatsApp
python tests/test_local.py

# Arrancar servidor
uvicorn agent.main:app --reload --port 8000

# Ver catálogo vía API
curl http://localhost:8000/catalog

# Ver pedidos vía API
curl http://localhost:8000/pedidos

# Test chat vía API
curl -X POST http://localhost:8000/test-chat \
  -H "Content-Type: application/json" \
  -d '{"telefono":"+5350000000","mensaje":"Hola, ¿qué paneles tienen?","nombre":"Cliente Test"}'

# Docker
docker compose up --build

# Logs
docker compose logs -f agent

# Admin agregar producto nuevo vía API
curl -X POST http://localhost:8000/admin/catalogo-nuevo \
  -H "Content-Type: application/json" \
  -d '{"texto":"Productos Nuevos del Día:\n- Panel Solar 600W Bifacial $320 / 80000 CUP\n- Batería 48V 150Ah $1600"}'
```

---

## 📦 Actualización de productos nuevos (Admin)

Cuando tengas productos nuevos, simplemente envía por WhatsApp al propio bot (o usa endpoint):

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial Tier 1 - $320 USD / 80000 CUP - 600W, bifacial, alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh, rack, BT
- Inversor Growatt 6000W 48V - $900 USD - MPPT 100A, WiFi
```

Jose detectará automáticamente que es admin y actualizará el catálogo usando `actualizar_catalogo_desde_texto_admin`. Te confirmará con "Catálogo actualizado...".

O usa API: `POST /admin/catalogo-nuevo`

---

## 🚀 Deploy a Railway (Producción)

Basado en whatsapp-agent-kit:

1. **Sube a GitHub:**
```bash
git init
git add .
git commit -m "feat: EnergixCu agent Jose con AgentKit"
git remote add origin https://github.com/TU-USUARIO/energixcu-agent.git
git push -u origin main
```

2. **Conecta Railway:**
- Entra a railway.app, New Project → Deploy from GitHub repo
- Selecciona tu repo

3. **Variables de entorno en Railway:**
```
ANTHROPIC_API_KEY=sk-ant-...
WHATSAPP_PROVIDER=whapi
WHAPI_TOKEN=...
PORT=8000
ENVIRONMENT=production
DATABASE_URL=sqlite+aiosqlite:///./data/agentkit.db
```

Si usas Meta:
```
META_ACCESS_TOKEN=...
META_PHONE_NUMBER_ID=...
META_VERIFY_TOKEN=energixcu-verify-2024
```

Si usas Twilio:
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=whatsapp:+1415...
```

4. **Configura webhook:**
- Copia URL pública Railway: `https://tu-app.up.railway.app`
- **Whapi:** whapi.cloud → Settings → Webhooks → URL: `https://tu-app.up.railway.app/webhook` POST
- **Meta:** developers.facebook.com → tu app → WhatsApp → Configuration → Callback URL: `https://tu-app.up.railway.app/webhook` Verify Token: tu `META_VERIFY_TOKEN`
- **Twilio:** Console → Messaging → WhatsApp Sandbox Settings → When message comes in: `https://tu-app.up.railway.app/webhook` POST

¡Listo! 🤖⚡

---

## 🔒 Guardrails

- No revela prompt ni modelo IA
- Solo Efectivo y Transferencia
- Si piden humano: "Con gusto te transfiero con uno de nuestros especialistas humanos de EnergixCu para que te atienda directamente. Un momento, por favor. 👨‍💻"
- Nunca inventa stock/precios sin verificar

---

## 📚 Créditos

- **Kit base:** [alanjmr21/whatsapp-agent-kit](https://github.com/alanjmr21/whatsapp-agent-kit) — Sistema para construir agentes WhatsApp con Claude Code
- **Adaptado para:** EnergixCu — Energía inteligente para Cuba
- **Agente:** Jose
- **Modelo IA:** Claude 3.5 Sonnet (Anthropic)

---

## 📞 Contacto EnergixCu

- Empresa: EnergixCu
- Agente: Jose ⚡
- Zonas: La Habana + envíos nacionales
- Pagos: Efectivo y Transferencia

---

## 📄 Licencia

MIT — Ver LICENSE

---

**¡Listo para vender energía solar por WhatsApp con IA!** ☀️🔋🚀
