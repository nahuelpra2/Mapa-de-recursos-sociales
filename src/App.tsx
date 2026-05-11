import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminShell } from "./pages/AdminShell";
import { AdminResourcesListPage } from "./pages/admin/AdminResourcesListPage";
import { PublicResourcesPage } from "./pages/PublicResourcesPage";
import { getRelativeAdminResourcesPath } from "./appRouteConfiguration";
import { appRoutes } from "./routes";

function AdminIndexPage() {
  return <p className="text-sm text-slate-300">Elegí una sección para administrar los recursos sociales.</p>;
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path={appRoutes.public.path} element={<PublicResourcesPage />} />
          <Route path={appRoutes.adminLogin.path} element={<AdminLoginPage />} />
          <Route
            path={appRoutes.admin.path}
            element={
              <RequireAdmin>
                <AdminShell />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminIndexPage />} />
            <Route path={getRelativeAdminResourcesPath()} element={<AdminResourcesListPage />} />
          </Route>
          <Route path="*" element={<Navigate to={appRoutes.public.path} replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
