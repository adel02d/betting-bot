# agent/providers/whapi.py — Adaptador para Whapi.cloud
# Basado en whatsapp-agent-kit

import os
import logging
import httpx
from fastapi import Request
from agent.providers.base import ProveedorWhatsApp, MensajeEntrante

logger = logging.getLogger("betting-agent")


class ProveedorWhapi(ProveedorWhatsApp):
    """Proveedor de WhatsApp usando Whapi.cloud (REST API simple)."""

    def __init__(self):
        self.token = os.getenv("WHAPI_TOKEN")
        self.url_envio = "https://gate.whapi.cloud/messages/text"

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea el payload de Whapi.cloud."""
        try:
            body = await request.json()
        except Exception as e:
            logger.error(f"Error parseando JSON Whapi: {e}")
            return []

        mensajes = []
        for msg in body.get("messages", []):
            # Whapi estructura
            chat_id = msg.get("chat_id", "")
            texto = ""
            # Puede venir en text.body o body
            if isinstance(msg.get("text"), dict):
                texto = msg.get("text", {}).get("body", "")
            elif isinstance(msg.get("body"), str):
                texto = msg.get("body", "")
            else:
                texto = msg.get("text", "") if isinstance(msg.get("text"), str) else ""

            # Nombre si disponible
            nombre = msg.get("from_name", "") or msg.get("chat_name", "")

            mensajes.append(MensajeEntrante(
                telefono=chat_id,
                texto=texto,
                mensaje_id=msg.get("id", ""),
                es_propio=msg.get("from_me", False),
                nombre=nombre
            ))
        return mensajes

    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envía mensaje via Whapi.cloud."""
        if not self.token:
            logger.warning("WHAPI_TOKEN no configurado — mensaje no enviado (simulado)")
            logger.info(f"[SIMULADO] Para {telefono}: {mensaje}")
            return True  # Simular éxito en dev

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(
                    self.url_envio,
                    json={"to": telefono, "body": mensaje},
                    headers=headers,
                )
                if r.status_code != 200:
                    logger.error(f"Error Whapi: {r.status_code} — {r.text}")
                    return False
                return True
        except Exception as e:
            logger.error(f"Error enviando Whapi: {e}")
            return False
