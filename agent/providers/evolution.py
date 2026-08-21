# agent/providers/evolution.py — Adaptador 100% GRATIS para Evolution API (Open Source, self-host)
# Evolution API: https://github.com/EvolutionAPI/evolution-api
# 100% gratis, sin tarjeta, sin pago, auto-host en Koyeb/Railway/Render gratis
# Documentación: https://doc.evolution-api.com/v1/api-reference/message-controller

import os
import logging
import httpx
from fastapi import Request
from agent.providers.base import ProveedorWhatsApp, MensajeEntrante

logger = logging.getLogger("energixcu-agent")

class ProveedorEvolution(ProveedorWhatsApp):
    """Proveedor 100% GRATIS usando Evolution API open source."""

    def __init__(self):
        # URL de tu instancia Evolution API desplegada (ej: https://evolution-xxxx.koyeb.app)
        self.api_url = os.getenv("EVOLUTION_API_URL", "").rstrip("/")
        self.api_key = os.getenv("EVOLUTION_API_KEY", "")
        self.instance = os.getenv("EVOLUTION_INSTANCE", "energixcu")  # nombre instancia

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        """Parsea webhook de Evolution API."""
        try:
            body = await request.json()
        except Exception as e:
            logger.error(f"Error parseando JSON Evolution: {e}")
            return []

        mensajes = []

        # Evolution puede enviar varios formatos:
        # Formato 1: event = messages.upsert, data = { key, pushName, message }
        # Formato 2: event = messages, data con messages
        # Formato 3: directo con phone, message
        
        # Intentar detectar evento
        event = body.get("event", "") or body.get("type", "")
        data = body.get("data", body)

        # Caso 1: data es dict con key y message (formato Evolution estándar)
        if isinstance(data, dict):
            # Si data tiene key y pushName
            key = data.get("key", {})
            push_name = data.get("pushName", "") or data.get("push_name", "")
            
            remote_jid = ""
            if isinstance(key, dict):
                remote_jid = key.get("remoteJid", "") or key.get("remote_jid", "")
                from_me = key.get("fromMe", False) or key.get("from_me", False)
            else:
                remote_jid = data.get("remoteJid", "") or data.get("from", "") or data.get("phone", "")
                from_me = data.get("fromMe", False)

            # Extraer texto del mensaje
            message_obj = data.get("message", {})
            texto = ""
            if isinstance(message_obj, dict):
                # Puede ser conversation, extendedTextMessage, etc
                texto = message_obj.get("conversation", "")
                if not texto:
                    ext = message_obj.get("extendedTextMessage", {})
                    texto = ext.get("text", "") if isinstance(ext, dict) else ""
                if not texto:
                    texto = message_obj.get("text", "") or message_obj.get("body", "")
            elif isinstance(message_obj, str):
                texto = message_obj

            # También probar data.message.conversation directo
            if not texto:
                texto = data.get("text", "") or data.get("body", "") or data.get("conversation", "")

            # Telefono: remoteJid es como 5351234567@s.whatsapp.net -> extraer número
            telefono = remote_jid
            if "@s.whatsapp.net" in str(telefono):
                telefono = str(telefono).split("@")[0]
            if not telefono:
                telefono = data.get("phone", "") or data.get("from", "") or data.get("chatId", "")

            mensaje_id = key.get("id", "") if isinstance(key, dict) else data.get("id", "") or data.get("messageId", "")

            if telefono and texto:
                mensajes.append(MensajeEntrante(
                    telefono=str(telefono),
                    texto=str(texto),
                    mensaje_id=str(mensaje_id),
                    es_propio=bool(from_me),
                    nombre=str(push_name)
                ))
                return mensajes

        # Caso 2: body es lista de mensajes
        if isinstance(body, list):
            for item in body:
                if isinstance(item, dict):
                    tel = item.get("phone", "") or item.get("from", "") or item.get("chatId", "")
                    txt = item.get("text", "") or item.get("body", "") or item.get("message", "")
                    if tel and txt:
                        mensajes.append(MensajeEntrante(
                            telefono=str(tel),
                            texto=str(txt),
                            mensaje_id=str(item.get("id", "")),
                            es_propio=False,
                            nombre=str(item.get("pushName", ""))
                        ))
            return mensajes

        # Caso 3: formato simple { phone, message, pushName }
        if isinstance(body, dict):
            # Buscar campos comunes
            tel = body.get("phone", "") or body.get("from", "") or body.get("remoteJid", "") or body.get("chatId", "")
            txt = body.get("text", "") or body.get("message", "") or body.get("body", "") or body.get("conversation", "")
            if tel and txt:
                mensajes.append(MensajeEntrante(
                    telefono=str(tel),
                    texto=str(txt),
                    mensaje_id=str(body.get("id", "")),
                    es_propio=False,
                    nombre=str(body.get("pushName", "") or body.get("name", ""))
                ))

        # Si no se pudo parsear pero hay datos, loguear
        if not mensajes:
            logger.warning(f"Evolution webhook no reconocido: {str(body)[:500]}")

        return mensajes

    async def enviar_mensaje(self, telefono: str, mensaje: str) -> bool:
        """Envía mensaje vía Evolution API — 100% gratis."""
        if not self.api_url or not self.api_key:
            logger.warning("EVOLUTION_API_URL o EVOLUTION_API_KEY no configurados — mensaje simulado")
            logger.info(f"[SIMULADO EVOLUTION] Para {telefono}: {mensaje[:100]}")
            return True

        # Normalizar teléfono: solo dígitos
        tel = telefono.replace("whatsapp:", "").replace("+", "").replace(" ", "").replace("-", "").replace("@s.whatsapp.net", "").strip()
        
        # Si empieza con 53 y tiene 8 dígitos después, es Cuba, dejar
        # Evolution espera número con código país sin +

        url = f"{self.api_url}/message/sendText/{self.instance}"
        headers = {
            "apikey": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "number": tel,
            "text": mensaje,
            "options": {
                "delay": 200,
                "presence": "composing"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(url, json=payload, headers=headers)
                if r.status_code not in (200, 201):
                    logger.error(f"Error Evolution API {r.status_code}: {r.text[:500]}")
                    # Intentar endpoint alternativo sin instance (algunas versiones)
                    alt_url = f"{self.api_url}/message/sendText"
                    alt_payload = {"number": tel, "text": mensaje, "instance": self.instance}
                    r2 = await client.post(alt_url, json=alt_payload, headers=headers)
                    if r2.status_code not in (200, 201):
                        logger.error(f"Error Evolution alt {r2.status_code}: {r2.text[:500]}")
                        return False
                logger.info(f"✅ Mensaje enviado via Evolution a {tel}")
                return True
        except Exception as e:
            logger.error(f"Error enviando Evolution: {e}")
            return False
