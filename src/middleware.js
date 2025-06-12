// -----------------------------------------------------------------------------
//  middleware.js  –  Always land on /login first                              
// -----------------------------------------------------------------------------
//  Behaviour summary                                                          
//  • Every visit to the root URL ("/") is redirected to "/login".            
//  • Only /login and static/_next/api assets are public.                      
//  • Once authenticated (user cookie present) users may enter their own       
//    role area (/admin/dashboard, etc.).                                      
//  • Attempting to access another role’s area redirects back to their own.    
//  • Unauthenticated access to any role area → /login                         
// -----------------------------------------------------------------------------
import { NextResponse } from "next/server";

const roleHome = {
  admin: "/admin/dashboard",
  siswa: "/siswa/paket",
  mitra: "/mitra/siswa",
  tentor: "/tentor/presensi",
};

export function middleware(request) {
  const { pathname, origin } = request.nextUrl;

  // Always send root URL to /login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // Try to read user cookie (JSON string)
  let role;
  try {
    const raw = request.cookies.get("user")?.value;
    if (raw) role = JSON.parse(raw).role;
  } catch {
    /* ignore malformed cookie */
  }

  // If user is already logged‑in but tries to open /login, kirim ke dashboard
  if (role && pathname === "/login") {
    return NextResponse.redirect(new URL(roleHome[role], origin));
  }

  // public assets & login page remain accessible & login page remain accessible
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon");


  const rolePrefixes = Object.keys(roleHome).map((r) => `/${r}`); // ["/admin", ...]
  const isProtected = rolePrefixes.some((p) => pathname.startsWith(p));

  // ─── Unauthenticated flow ─────────────────────────────────────────────────
  if (!role) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", origin));
    }
    return NextResponse.next(); // allow /login or static
  }

  // ─── Authenticated flow ───────────────────────────────────────────────────
  // Prevent user opening another role’s area
  if (isProtected && !pathname.startsWith(`/${role}`)) {
    return NextResponse.redirect(new URL(roleHome[role], origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", // root
    "/login",
    "/admin/:path*",
    "/siswa/:path*",
    "/mitra/:path*",
    "/tentor/:path*",
  ],
};
