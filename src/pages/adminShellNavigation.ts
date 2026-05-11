import { appRoutes } from "../routes";

export function getAdminShellNavigation() {
  return [
    { label: "Inicio", href: appRoutes.admin.path },
    { label: "Recursos", href: appRoutes.adminResources.path }
  ];
}
