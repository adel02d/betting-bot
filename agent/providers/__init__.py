# agent/providers/__init__.py — Factory de proveedores WhatsApp
# Parte de EnergixCu AI Agent basado en whatsapp-agent-kit
# 100% GRATIS: whapi, meta (gratis oficial), twilio, evolution (open source 100% gratis)

import os
from agent.providers.base import ProveedorWhatsApp

def obtener_proveedor() -> ProveedorWhatsApp:
    """Retorna el proveedor de WhatsApp configurado en .env."""
    proveedor = os.getenv("WHATSAPP_PROVIDER", "evolution").lower().strip()

    if proveedor == "whapi":
        from agent.providers.whapi import ProveedorWhapi
        return ProveedorWhapi()
    elif proveedor == "meta":
        from agent.providers.meta import ProveedorMeta
        return ProveedorMeta()
    elif proveedor == "twilio":
        from agent.providers.twilio import ProveedorTwilio
        return ProveedorTwilio()
    elif proveedor in ["evolution", "evo", "baileys", "wpp"]:
        # Evolution API - 100% GRATIS sin tarjeta, open source, auto-host
        from agent.providers.evolution import ProveedorEvolution
        return ProveedorEvolution()
    else:
        # Si no especifica o pone gratis/free, usar evolution como default gratis
        if proveedor in ["free", "gratis", ""] or not proveedor:
            try:
                from agent.providers.evolution import ProveedorEvolution
                return ProveedorEvolution()
            except:
                from agent.providers.whapi import ProveedorWhapi
                return ProveedorWhapi()
        raise ValueError(f"Proveedor no soportado: {proveedor}. Usa: whapi, meta, twilio, evolution")
