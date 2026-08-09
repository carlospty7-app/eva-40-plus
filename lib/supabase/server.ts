import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente de Supabase para usar en Route Handlers y Server Components — lee/escribe la sesión
 * desde las cookies de la petición. */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Se llama desde un Server Component sin permiso de escritura — el middleware
            // ya se encarga de refrescar la sesión en ese caso, así que se puede ignorar.
          }
        },
      },
    },
  );
}
