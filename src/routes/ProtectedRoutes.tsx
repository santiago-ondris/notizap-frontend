import { lazy } from "react";
import { Route } from "react-router-dom";

const UsersPage = lazy(() => import("@/pages/Login/UsersPage").then(m => ({ default: m.UsersPage })));
const CambiosPage = lazy(() => import("@/pages/Cambios/CambiosPage"));
const DevolucionesPage = lazy(() => import("@/pages/Cambios/DevolucionesPage"));
const DevolucionesMercadoLibrePage = lazy(() => import("@/pages/Cambios/DevolucionesMercadoLibrePage"));
const VentasVendedorasPage = lazy(() => import("@/pages/Vendedoras/VentasVendedorasPage").then(m => ({ default: m.VentasVendedorasPage })));
const LocalesStatsPage = lazy(() => import("@/pages/Vendedoras/LocalesStatsPage"));
const ComisionesVendedorasPage = lazy(() => import("@/pages/Vendedoras/ComisionesVendedorasPage").then(m => ({ default: m.ComisionesVendedorasPage })));
const ReposicionPage = lazy(() => import("@/pages/Reposicion/ReposicionPage").then(m => ({ default: m.ReposicionPage })));
const ReposicionSelectorPage = lazy(() => import("@/pages/Reposicion/ReposicionSelectorPage").then(m => ({ default: m.ReposicionSelectorPage })));
const ReposicionNinosPage = lazy(() => import("@/pages/Reposicion/ReposicionNinosPage").then(m => ({ default: m.ReposicionNinosPage })));
const ReposicionLogicaPage = lazy(() => import("@/pages/Reposicion/ReposicionLogicaPage").then(m => ({ default: m.ReposicionLogicaPage })));
const InfoComisionesPage = lazy(() => import("@/pages/Vendedoras/InfoComisionesPage").then(m => ({ default: m.InfoComisionesPage })));

export const ProtectedRoutes = (
  <>
    <Route path="usuarios" element={<UsersPage />} />
    <Route path="cambios">
      <Route index element={<CambiosPage />} />
      <Route path="devoluciones" element={<DevolucionesPage />} />
      <Route path="devolucionesML" element={<DevolucionesMercadoLibrePage />} />
    </Route>
    <Route path="vendedoras">
      <Route index element={<VentasVendedorasPage />} />
      <Route path="rendimiento" element={<LocalesStatsPage />} />
      <Route path="comisioneslocales" element={<ComisionesVendedorasPage />} />
      <Route path="comisioneslocales/info" element={<InfoComisionesPage />} />
    </Route>
    <Route path="reposicion">
      <Route index element={<ReposicionSelectorPage />} />
      <Route path="adultos" element={<ReposicionPage />} />
      <Route path="ninos" element={<ReposicionNinosPage />} />
      <Route path="logica" element={<ReposicionLogicaPage />} />
    </Route>
  </>
);
