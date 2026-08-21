# agent/providers/twilio.py — Adaptador para Twilio WhatsApp
# Basado en whatsapp-agent-kit

import os
import logging
import httpx
from fastapi import Request
from agent.providers.base import ProveedorWhatsApp, MensajeEntrante

logger = logging.getLogger("betting-agent")


class ProveedorTwilio(ProveedorWhatsApp):
    """Proveedor usando Twilio WhatsApp API."""

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.phone_number = os.getenv("TWILIO_PHONE_NUMBER")  # Ej: whatsapp:+14155238886
        self.url_base = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json" if self.account_sid else ""

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea webhook de Twilio (form-urlencoded)."""
        try:
            form = await request.form()
        except Exception as e:
            # Fallback a JSON por si acaso
            try:
                body = await request.json()
                # Si Twilio manda JSON (no usual)
                telefono = body.get("From", "")
                texto = body.get("Body", "")
                mensaje_id = body.get("MessageSid", "")
                return [MensajeEntrante(
                    telefono=telefono,
                    texto=texto,
                    mensaje_id=mensaje_id,
                    es_propio=False
                )]
            except Exception:
                logger.error(f"Error parseando webhook Twilio: {e}")
                return []

        telefono = form.get("From", "")  # viene como whatsapp:+535...
        texto = form.get("Body", "")
        mensaje_id = form.get("MessageSid", "")
        # Nombre no viene en Twilio por defecto
        nombre = form.get("ProfileName", "") or ""

        if not texto:
            return []

        return [MensajeEntrante(
            telefono=telefono,
            texto=texto,
            mensaje_id=mensaje_id,
            es_propio=False,
            nombre=nombre
        )]

    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envía mensaje via Twilio."""
        if not self.account_sid or not self.auth_token or not self.phone_number:
            logger.warning("Credenciales Twilio no configuradas — mensaje simulado")
            logger.info(f"[SIMULADO TWILIO] Para {telefono}: {mensaje}")
            return True

        # Asegurar formato whatsapp:
        to_number = telefono
        if not to_number.startswith("whatsapp:"):
            # Si es número limpio, agregar prefijo
            # Twilio espera whatsapp:+123456789
            if not to_number.startswith("+"):
                # Asumir que ya es E.164 sin +
                to_number = f"whatsapp:+{to_number.lstrip('whatsapp:').lstrip('+')}"
            else:
                to_number = f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number

        from_number = self.phone_number
        if not from_number.startswith("whatsapp:"):
            from_number = f"whatsapp:{from_number}"

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(
                    self.url_base,
                    data={
                        "From": from_number,
                        "To": to_number,
                        "Body": mensaje
                    },
                    auth=(self.account_sid, self.auth_token)
                )
                if r.status_code not in (200, 201):
                    logger.error(f"Error Twilio: {r.status_code} — {r.text}")
                    return False
                return True
        except Exception as e:
            logger.error(f"Error enviando Twilio: {e}")
            return False
