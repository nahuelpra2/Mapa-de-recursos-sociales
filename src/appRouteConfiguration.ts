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
    childPaths: [appRoutes.adminResources.path]
  };
}

export function getRelativeAdminResourcesPath(): string {
  return appRoutes.adminResources.path.replace(`${appRoutes.admin.path}/`, "");
}
