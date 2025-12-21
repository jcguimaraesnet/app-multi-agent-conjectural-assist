from supabase import create_client, Client
from app.config import get_settings


def get_supabase_client() -> Client:
    """Create and return a Supabase client instance with service role key.
    
    Uses service_role_key to bypass RLS for backend operations.
    Falls back to anon_key if service_role_key is not configured.
    """
    settings = get_settings()
    # Use service role key for backend operations (bypasses RLS)
    # Fall back to anon key if service role key is not set
    key = settings.supabase_service_role_key or settings.next_public_supabase_anon_key
    return create_client(
        settings.next_public_supabase_url, 
        key
    )
