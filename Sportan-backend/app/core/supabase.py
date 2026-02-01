from supabase import Client, create_client

from app.core.config import settings

_public_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
_admin_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_supabase_client() -> Client:
    return _public_client


def get_supabase_admin_client() -> Client:
    return _admin_client
