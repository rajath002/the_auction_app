export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/auction/:path*",
    "/player-registration/:path*",
    "/bulk-player-registration/:path*",
    "/teams/:path*",
  ],
};
