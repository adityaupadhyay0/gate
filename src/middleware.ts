export { auth as middleware } from "@/lib/auth/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/roadmap/:path*", "/topic/:path*", "/revision/:path*", "/test/:path*"],
}
