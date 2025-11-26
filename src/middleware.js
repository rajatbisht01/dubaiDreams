// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Redirect to login if not logged in
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  console.log("🛂 [middleware] User is logged in:", user.id);

  // Fetch role from public.profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  console.log("🛂 [middleware] User role:", profile);

  // Role-based access control
  if (path.startsWith("/admin") && !["admin", "superAdmin"].includes(role) ) {
    const url = request.nextUrl.clone();
    url.pathname = "/unauthorized"; // create a simple unauthorized page
    return NextResponse.redirect(url);
  }

  // if (path.startsWith("/products") && !["user", "admin"].includes(role)) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/unauthorized";
  //   return NextResponse.redirect(url);
  // }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
