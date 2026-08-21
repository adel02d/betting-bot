# agent/providers/meta.py — Adaptador para Meta Cloud API (WhatsApp oficial)
# Basado en whatsapp-agent-kit

import os
import logging
import httpx
from fastapi import Request
from agent.providers.base import ProveedorWhatsApp, MensajeEntrante

logger = logging.getLogger("betting-agent")


class ProveedorMeta(ProveedorWhatsApp):
    """Proveedor usando Meta Cloud API oficial de WhatsApp."""

    def __init__(self):
        self.access_token = os.getenv("META_ACCESS_TOKEN")
        self.phone_number_id = os.getenv("META_PHONE_NUMBER_ID")
        self.verify_token = os.getenv("META_VERIFY_TOKEN", "betting-agent-verify")
        self.url_base = f"https://graph.facebook.com/v19.0/{self.phone_number_id}/messages" if self.phone_number_id else ""

    async def validar_webhook(self, request: Request):
        """
        Verificación GET del webhook requerida por Meta.
        Meta envía: hub.mode, hub.verify_token, hub.challenge
        """
        params = request.query_params
        mode = params.get("hub.mode")
        token = params.get("hub.verify_token")
        challenge = params.get("hub.challenge")

        if mode == "subscribe" and token == self.verify_token:
            logger.info("Webhook Meta verificado correctamente")
            return int(challenge) if challenge and challenge.isdigit() else challenge
        elif mode or token:
            logger.warning(f"Verificación Meta fallida: token recibido={token}")
            return None
        return None

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea payload de Meta Cloud API."""
        try:
            body = await request.json()
        except Exception as e:
            logger.error(f"Error parseando JSON Meta: {e}")
            return []

        mensajes: list[MensajeEntrante] = []

        # Estructura: entry -> changes -> value -> messages
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                # Ignorar status updates
                if "messages" not in value:
                    continue

                contacts = {}
                # Mapear nombres por wa_id
                for contact in value.get("contacts", []):
                    contacts[contact.get("wa_id", "")] = contact.get("profile", {}).get("name", "")

                for msg in value.get("messages", []):
                    # Solo procesar texto
                    if msg.get("type") != "text":
                        continue

                    wa_id = msg.get("from", "")
                    texto = msg.get("text", {}).get("body", "")
                    msg_id = msg.get("id", "")
                    nombre = contacts.get(wa_id, "")

                    mensajes.append(MensajeEntrante(
                        telefono=wa_id,
                        texto=texto,
                        mensaje_id=msg_id,
                        es_propio=False,
                        nombre=nombre
                    ))

        return mensajes

    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envía mensaje via Meta Cloud API."""
        if not self.access_token or not self.phone_number_id:
            logger.warning("META_ACCESS_TOKEN o PHONE_NUMBER_ID no configurado — mensaje simulado")
            logger.info(f"[SIMULADO META] Para {telefono}: {mensaje}")
            return True

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": telefono,
            "type": "text",
            "text": {"body": mensaje}
        }

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(self.url_base, json=payload, headers=headers)
                if r.status_code != 200:
                    logger.error(f"Error Meta API: {r.status_code} — {r.text}")
                    return False
                return True
        except Exception as e:
            logger.error(f"Error enviando Meta: {e}")
            return False
