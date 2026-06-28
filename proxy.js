import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/admin"];
const SELECTION_PATH = "/escolher-personagem";

export async function proxy(request) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (!user && !isPublic) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/admin";
    destination.searchParams.set("retorno", pathname);
    return redirectWithCookies(destination, response);
  }

  if (user && !isPublic && pathname !== SELECTION_PATH) {
    const { data: member } = await supabase.from("member_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!member) {
      const destination = request.nextUrl.clone();
      destination.pathname = SELECTION_PATH;
      destination.search = "";
      return redirectWithCookies(destination, response);
    }
  }

  return response;
}

function redirectWithCookies(url, sourceResponse) {
  const redirect = NextResponse.redirect(url);
  sourceResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
