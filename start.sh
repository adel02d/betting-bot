#!/bin/bash
# start.sh — Verificación de entorno para EnergixCu Agent (Jose)
# Basado en whatsapp-agent-kit

echo "==========================================================="
echo "   ⚡ EnergixCu — WhatsApp AI Agent (Jose) — Setup"
echo "==========================================================="
echo ""

# Verificar Python
echo "Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no encontrado. Instálalo desde https://python.org/downloads"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || { [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]; }; then
    echo "❌ Necesitas Python 3.11 o superior. Tienes: $PYTHON_VERSION"
    echo "   Descárgalo en: https://python.org/downloads"
    exit 1
fi

echo "✅ Python $PYTHON_VERSION OK"

# Crear carpetas necesarias
echo ""
echo "Creando estructura de carpetas..."
mkdir -p agent/providers config knowledge tests data/pedidos
echo "✅ Carpetas creadas"

# Verificar requirements.txt
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt no encontrado"
    exit 1
fi

# Instalar dependencias
echo ""
echo "Instalando dependencias Python..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Crear .env desde template si no existe
if [ ! -f ".env" ]; then
    echo ""
    echo "Creando .env desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env creado. ¡IMPORTANTE! Edítalo con tus API keys:"
        echo "   - ANTHROPIC_API_KEY"
        echo "   - WHAPI_TOKEN o META_ / TWILIO_ según proveedor"
        echo ""
        echo "   Edita con: nano .env"
    else
        echo "⚠️ .env.example no encontrado, crea .env manualmente"
    fi
else
    echo ""
    echo "✅ .env ya existe"
fi

# Verificar API keys
echo ""
echo "Verificación final:"
if grep -q "sk-ant-..." .env 2>/dev/null || ! grep -q "ANTHROPIC_API_KEY" .env 2>/dev/null; then
    echo "⚠️ Configura tu ANTHROPIC_API_KEY en .env"
else
    echo "✅ ANTHROPIC_API_KEY parece configurada"
fi

if grep -q "WHAPI_TOKEN=" .env 2>/dev/null && ! grep -q "WHAPI_TOKEN=$" .env; then
    echo "✅ WHATSAPP_PROVIDER configurado"
else
    echo "⚠️ Configura WHAPI_TOKEN o credenciales de tu proveedor en .env"
fi

echo ""
echo "==========================================================="
echo "   Fase 1 completada — Entorno listo ✅"
echo "==========================================================="
echo ""
echo "Próximos pasos:"
echo "  1. Edita .env con tus API keys: nano .env"
echo "  2. Prueba el agente local sin WhatsApp:"
echo "     python3 tests/test_local.py"
echo "  3. Arranca el servidor:"
echo "     uvicorn agent.main:app --reload --port 8000"
echo "  4. O con Docker:"
echo "     docker compose up --build"
echo ""
echo "Documentación completa en README.md"
echo "==========================================================="
