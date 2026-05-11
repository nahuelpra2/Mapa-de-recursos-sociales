import { appRoutes } from "./routes";

export type ProtectedAdminRouteConfiguration = {
  parentPath: string;
  indexPath: string;
  childPaths: string[];
};

export function getProtectedAdminRouteConfiguration(): ProtectedAdminRouteConfiguration {
  return {
    parentPath: appRoutes.admin.path,
    indexPath: appRoutes.admin.path,
    childPaths: [appRoutes.adminResources.path, appRoutes.adminResourceNew.path, appRoutes.adminResourceEdit.path]
  };
}

export function getRelativeAdminResourcesPath(): string {
  return appRoutes.adminResources.path.replace(`${appRoutes.admin.path}/`, "");
}

export function getRelativeAdminResourceNewPath(): string {
  return appRoutes.adminResourceNew.path.replace(`${appRoutes.admin.path}/`, "");
}

export function getRelativeAdminResourceEditPath(): string {
  return appRoutes.adminResourceEdit.path.replace(`${appRoutes.admin.path}/`, "");
}
