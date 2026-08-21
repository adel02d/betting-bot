# 📱 Guía Completa — Usar EnergixCu con Solo Teléfono (Sin PC)

Esta guía es para ti que solo tienes teléfono Android/iPhone y necesitas gestionar **Jose**, el agente de WhatsApp de EnergixCu, actualizar catálogo y ver pedidos sin computadora.

---

## 🚀 1. Deployar el Bot sin PC (5-10 minutos)

No necesitas PC. Todo se hace desde Chrome en tu teléfono.

### Paso A: Crear cuenta GitHub desde el teléfono
1. Entra a **github.com** desde Chrome (marca "Versión de escritorio" en el menú de Chrome)
2. Crea cuenta si no tienes
3. Entra a este repo: `https://github.com/adel02d/betting-bot`
4. Toca **Fork** (arriba a la derecha) → Crea tu copia

### Paso B: Crear cuenta Anthropic (IA) desde teléfono
1. Entra a **platform.anthropic.com** → Regístrate
2. Ve a **API Keys** → **Create Key** → Copia la key que empieza con `sk-ant-...` (guárdala en notas)

### Paso C: Elegir proveedor WhatsApp (más fácil: Whapi.cloud)
1. Entra a **https://whapi.cloud** desde tu teléfono
2. Regístrate con Google
3. Te dan sandbox gratis → Copia tu **API Token** (ej: `abc123...`)

### Paso D: Deploy en Railway (sin PC)
1. Entra a **railway.app** → Login con GitHub
2. Toca **New Project** → **Deploy from GitHub repo**
3. Elige tu fork `betting-bot`
4. Railway empieza a construir
5. Ve a **Variables** → **Add Variable** y agrega:
```
ANTHROPIC_API_KEY=sk-ant-... (la que copiaste)
WHATSAPP_PROVIDER=whapi
WHAPI_TOKEN=tu_token_de_whapi
ADMIN_PHONE=+5351234567 (tu número con código país, ej: +53 para Cuba)
PORT=8000
ENVIRONMENT=production
```
6. Railway te dará una URL pública: `https://tu-app.up.railway.app` → Cópiala

### Paso E: Conectar WhatsApp
1. En **whapi.cloud** → **Settings** → **Webhooks**
2. Pega URL: `https://tu-app.up.railway.app/webhook` 
3. Método: **POST** → Guarda y Activa
4. ¡Listo! Escribe a tu número de bot por WhatsApp y te responderá Jose ⚡

> **¿No quieres Whapi?** Alternativas:
> - **Meta Cloud API** (oficial, gratis por conversación, pero requiere Facebook Business verificado) → Configura en developers.facebook.com
> - **Twilio** (muy confiable, sandbox gratis)

### Si prefieres Render o otra plataforma que funcione con teléfono:
- **render.com** también funciona igual que Railway, 100% desde móvil

---

## 📦 2. Cómo Actualizar Catálogo SOLO con Mensaje de WhatsApp

¡Esto es lo más importante para ti! No necesitas entrar a código.

### Opción A: Por WhatsApp (Más Fácil — Recomendado para teléfono)

Desde tu número **admin** (el que pusiste en `ADMIN_PHONE`), envía un mensaje **a tu propio bot** por WhatsApp con este formato exacto:

```
Productos Nuevos del Día:
- Panel Solar 600W Bifacial - $320 USD / 80000 CUP - 600W Tier1 bifacial alta eficiencia
- Batería LiFePO4 48V 150Ah - $1600 USD / 400000 CUP - 7.68kWh rack Bluetooth
- Inversor Growatt 6000W 48V - $900 USD - MPPT 100A WiFi
```

**Reglas super simples:**
- Primera línea: `Productos Nuevos del Día:` (obligatorio para que Jose detecte que es admin)
- Cada producto en línea nueva empezando con `-`
- Menciona nombre + precio con `$` y/o `CUP` para que se extraiga automático
- Puedes agregar descripción corta al final

**Otros formatos que también funcionan desde teléfono:**
```
Admin: Agregar producto
- Panel Solar 550W $280 / 70000 CUP

Actualiza catálogo:
- Batería 24V 100Ah $650

Nuevo producto: Inversor Híbrido 3000W $450 USD
```

**Envía incluso 1 solo producto:**
```
Panel Solar 600W Bifacial $320 USD / 80000 CUP
```
Si tu número es admin, Jose lo detectará como nuevo producto.

**Qué responde Jose:**
```
✅ ¡Catálogo actualizado con 3 producto(s) nuevos! 📦

• Panel Solar 600W Bifacial - $320 USD / 80000 CUP
• Batería LiFePO4 48V 150Ah - $1600 USD...
...y 1 más

Ya están activos para clientes. Total nuevos hoy: 3 🆕
```

¡Ya está! Ahora cualquier cliente que pregunte "¿Qué tienen nuevo?" verá esos productos.

### Opción B: Por Panel Admin Web desde tu teléfono

1. Entra desde Chrome en tu teléfono a: `https://tu-app.up.railway.app/admin`
2. Verás panel con:
   - Estado del bot
   - Formulario grande para pegar productos nuevos
   - Catálogo actual
   - Últimos 5 pedidos
3. Pega tu lista en el formulario y toca **✅ Actualizar Catálogo**
4. Listo

Este panel está diseñado 100% para teléfono, sin necesidad de PC.

### Opción C: Por API (Avanzado)

Si usas una app como HTTPie o Postman en teléfono:

```
POST https://tu-app.up.railway.app/admin/catalogo-nuevo
Body: {"texto": "Productos Nuevos del Día:\n- Panel 600W $320"}
```

---

## 🧾 3. Cómo Ver Pedidos desde tu Teléfono

**Por WhatsApp:** Jose no muestra pedidos a clientes normales, solo a ti como admin.

**Por Web (Fácil desde teléfono):**
- Entra a: `https://tu-app.up.railway.app/admin/pedidos`
- Verás tabla con todos los tickets: fecha, cliente, producto, dirección, pago, teléfono

**Por JSON:**
- `https://tu-app.up.railway.app/pedidos`

Cada vez que un cliente completa los 5 datos, se genera automáticamente:

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

Este ticket lo recibe el cliente Y tú puedes verlo en `/admin/pedidos`. Si configuraste `ADMIN_PHONE`, también podríamos enviarte notificación (futuro).

---

## 💬 4. Cómo Habla Jose con Clientes (Ya Configurado)

- Saluda: "¡Hola! 👋 Soy Jose de EnergixCu ⚡..."
- Muestra catálogo con precios en negrita
- Si cliente pide "foto del panel 550W", Jose busca imagen real en web con `buscar_imagen_producto`
- Si pide ficha técnica, usa `buscar_producto_en_web`
- Si dice "necesito para nevera y 2 ventiladores", calcula kit con `calcular_kit_solar` y recomienda Básico/Intermedio/Pro
- Solo acepta Efectivo y Transferencia (Transfermóvil, EnZona, MLC/CUP)
- Cierra siempre con pregunta guía: "¿Te envío foto? ¿Quieres que calcule tu kit?"

Tú no tienes que hacer nada, Jose atiende solo 24/7.

---

## 🔧 5. Configuraciones Importantes desde Teléfono

### Cambiar ADMIN_PHONE
En Railway → Variables → Edita `ADMIN_PHONE=+53XXXXXXXX` (tu número). Pon varios separados por coma si hay 2 admins: `+5351234567,+5357654321`

### Limpiar productos nuevos del día (fin de día)
Actualmente productos nuevos se acumulan en `data/catalog.json`. Para limpiar:
- Entra a `/admin` → Verás total nuevos
- Próximamente botón limpiar, por ahora envía desde API:
```
POST /admin/catalogo-nuevo con {"texto": ""} no limpia
```
**Manual:** Necesitarás entrar a Railway → Volume o esperar que implementemos botón limpiar (lo agregaré).

### Ver logs si algo falla
Railway → Tu proyecto → **Deployments** → **View Logs** → Ves mensajes de Jose

---

## 📱 6. Trucos para Teléfono

1. **Guarda enlaces en pantalla inicio:**
   - Chrome → Abre `https://tu-app.up.railway.app/admin` → Menú → "Agregar a pantalla de inicio" → Ahora tienes app admin de EnergixCu como si fuera app nativa

2. **Notion/Notas con plantillas:**
   Guarda plantilla en notas de tu teléfono:
   ```
   Productos Nuevos del Día:
   - 
   - 
   - 
   ```
   Solo llenas y copias/pega a WhatsApp de tu bot

3. **WhatsApp Business:**
   Usa WhatsApp Business para tu bot si quieres catálogo y respuestas rápidas, pero el agente Jose ya maneja todo

4. **Sin PC no puedes usar `tests/test_local.py`, pero tienes `/admin/test`:**
   Entra a `https://tu-app.up.railway.app/admin/test` → Escribe como cliente y pruebas a Jose sin necesidad de WhatsApp, todo desde teléfono

---

## ❓ Preguntas Frecuentes Teléfono

**¿Puedo cambiar precios existentes por mensaje?**
Sí, envía: `Actualiza catálogo: Panel Solar 550W ahora $300 USD / 75000 CUP` → Jose lo agregará como nuevo producto con nuevo precio y dejará de ofrecer el viejo (porque busca en nuevos primero). Próximamente función de actualizar precio directo.

**¿Si cliente pide hablar con humano?**
Jose responde automático: "Con gusto te transfiero con uno de nuestros especialistas humanos de EnergixCu..." y tú puedes intervenir manualmente entrando a Whapi.cloud → Chats y respondiendo tú.

**¿Funciona si se va la luz?**
Sí, Railway está en la nube, no le afecta apagón en Cuba. Tu bot seguirá respondiendo.

**¿Cuánto cuesta?**
- Railway: ~$5/mes gratis al inicio (tier free)
- Whapi.cloud: Sandbox gratis, luego $5-20/mes según mensajes
- Anthropic Claude: ~$5-20/mes según uso (muy barato, centavos por conversación)

**¿Necesito número nuevo para bot?**
No, puedes usar Whapi con tu número actual de WhatsApp escaneando QR, o comprar número virtual Twilio.

---

## 🆘 Soporte

Si tienes problema desde tu teléfono:
1. Entra a `/admin` → Verifica que proveedor sea Whapi y ADMIN_PHONE correcto
2. Ve a Railway logs
3. Escríbeme el error que ves

¡Jose está listo para vender por ti 24/7 solo con tu teléfono! 🚀⚡

---
**EnergixCu — Energía inteligente para Cuba — Jose 🤖**
