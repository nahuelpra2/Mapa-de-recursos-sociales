export const appRoutes = {
  public: { path: "/", label: "public-resources" },
  adminLogin: { path: "/admin/login", label: "admin-login" },
  admin: { path: "/admin", label: "admin-shell", protected: true }
} as const;

export const configuredAdminRoutePaths = Object.values(appRoutes)
  .map((route) => route.path)
  .filter((path) => path.startsWith("/admin"));
