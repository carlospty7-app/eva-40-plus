import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { esCorreoAdmin } from "@/lib/supabase/admin";

/** Refresca la sesión de Supabase en cada request y protege `/app/*` y `/admin/*` — sin sesión
 * real, redirige a `/login`; en `/admin`, además exige que el correo esté en ADMIN_EMAILS (el
 * guard vive aquí, en el servidor — nunca basta con solo ocultar el link en la UI). */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esRutaAdmin = request.nextUrl.pathname.startsWith("/admin");

  if (!user && (request.nextUrl.pathname.startsWith("/app") || esRutaAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (esRutaAdmin && !esCorreoAdmin(user?.email)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith("/app")) {
    const { data: perfil } = await supabase.from("profiles").select("activo").eq("id", user.id).single();
    if (perfil && perfil.activo === false) {
      const url = request.nextUrl.clone();
      url.pathname = "/cuenta-desactivada";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
