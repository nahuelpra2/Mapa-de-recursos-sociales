export const appRoutes = {
  public: { path: "/", label: "public-resources" },
  adminLogin: { path: "/admin/login", label: "admin-login" },
  admin: { path: "/admin", label: "admin-shell", protected: true },
  adminResources: { path: "/admin/resources", label: "admin-resources", protected: true },
  adminResourceNew: { path: "/admin/resources/new", label: "admin-resource-new", protected: true },
  adminResourceEdit: { path: "/admin/resources/:id/edit", label: "admin-resource-edit", protected: true }
} as const;

export const configuredAdminRoutePaths = Object.values(appRoutes)
  .map((route) => route.path)
  .filter((path) => path.startsWith("/admin"));
