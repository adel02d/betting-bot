# tests/test_local.py — Simulador de chat en terminal para probar a Jose de EnergixCu
# Basado en whatsapp-agent-kit

"""
Prueba tu agente sin necesitar WhatsApp.
Simula una conversación en la terminal con Jose.
"""

import asyncio
import sys
import os

# Agregar directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.brain import generar_respuesta
from agent.memory import inicializar_db, guardar_mensaje, obtener_historial, limpiar_historial

TELEFONO_TEST = "test-energixcu-001"
NOMBRE_TEST = "Cliente Prueba"

async def main():
    await inicializar_db()

    print()
    print("=" * 60)
    print("   ⚡ EnergixCu — Test Local — Jose 🤖")
    print("=" * 60)
    print()
    print("  Soy Jose, tu asesor virtual de EnergixCu.")
    print("  Escribe mensajes como si fueras un cliente por WhatsApp.")
    print()
    print("  Comandos especiales:")
    print("    'limpiar'  — borra historial de conversación")
    print("    'catalogo' — muestra catálogo actual")
    print("    'pedidos'  — lista últimos pedidos")
    print("    'salir'    — termina el test")
    print()
    print("  Ejemplos para probar:")
    print("    - Hola, ¿qué productos tienen?")
    print("    - Busco panel solar 550W, ¿me envías foto?")
    print("    - Necesito batería para nevera, ¿qué me recomiendas?")
    print("    - Productos Nuevos del Día: - Panel 600W $300 ... (simula admin)")
    print("    - Quiero comprar 2 paneles 550W (prueba flujo ticket)")
    print()
    print("-" * 60)
    print()

    # Mensaje de bienvenida automático de Jose
    print("Jose: ¡Hola! 👋 Soy *Jose* de *EnergixCu* ⚡. ¡Qué bueno que nos escribes! ¿En qué puedo ayudarte hoy? ¿Estás buscando paneles solares, baterías, alguna estación portátil o un kit completo para tu casa? ☀️")
    print()

    while True:
        try:
            mensaje = input("Tú: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nTest finalizado. ¡Gracias por probar EnergixCu! ⚡")
            break

        if not mensaje:
            continue

        if mensaje.lower() == "salir":
            print("\nTest finalizado. ¡Nos vemos en WhatsApp! 🚀")
            break

        if mensaje.lower() == "limpiar":
            await limpiar_historial(TELEFONO_TEST)
            print("[Historial borrado]\n")
            continue

        if mensaje.lower() == "catalogo":
            try:
                from agent.catalog import listar_catalogo_completo
                cat = listar_catalogo_completo()
                print(f"\n[Catálogo]\n{cat}\n")
            except Exception as e:
                print(f"Error catálogo: {e}\n")
            continue

        if mensaje.lower() == "pedidos":
            try:
                from pathlib import Path
                import json
                tickets_dir = Path("./data/pedidos")
                if not tickets_dir.exists():
                    print("[No hay pedidos aún]\n")
                    continue
                archivos = sorted(tickets_dir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:5]
                if not archivos:
                    print("[No hay pedidos]\n")
                    continue
                print("\n[Últimos Pedidos]:\n")
                for arch in archivos:
                    with open(arch, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        print(f"- {data.get('cliente')} | {data.get('producto')} x{data.get('cantidad')} | {data.get('fecha')}")
                print()
            except Exception as e:
                print(f"Error pedidos: {e}\n")
            continue

        # Obtener historial antes
        historial = await obtener_historial(TELEFONO_TEST)

        # Generar respuesta
        print("\nJose: ", end="", flush=True)
        try:
            respuesta = await generar_respuesta(mensaje, historial, TELEFONO_TEST, NOMBRE_TEST)
            print(respuesta)
        except Exception as e:
            print(f"❌ Error generando respuesta: {e}")
            respuesta = "Lo siento, tuve un error técnico. ¿Podrías repetir?"

        print()

        # Guardar
        await guardar_mensaje(TELEFONO_TEST, "user", mensaje)
        await guardar_mensaje(TELEFONO_TEST, "assistant", respuesta)

if __name__ == "__main__":
    asyncio.run(main())
