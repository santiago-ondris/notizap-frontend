import { Route } from "react-router-dom";
import { UsersPage }                 from "@/pages/Login/UsersPage";
import EnviosPage                from "@/pages/Envios/EnviosPage";
import CambiosPage               from "@/pages/Cambios/CambiosPage";
import DevolucionesPage from "@/pages/Cambios/DevolucionesPage";
import DevolucionesMercadoLibrePage from "@/pages/Cambios/DevolucionesMercadoLibrePage";
import { VentasVendedorasPage } from "@/pages/Vendedoras/VentasVendedorasPage";
import LocalesStatsPage from "@/pages/Vendedoras/LocalesStatsPage";
import { ComisionesVendedorasPage } from "@/pages/Vendedoras/ComisionesVendedorasPage";
import { ReposicionPage } from "@/pages/Reposicion/ReposicionPage";
import { ReposicionSelectorPage } from "@/pages/Reposicion/ReposicionSelectorPage";
import { ReposicionNinosPage } from "@/pages/Reposicion/ReposicionNinosPage";
import { ReposicionLogicaPage } from "@/pages/Reposicion/ReposicionLogicaPage";
import { InfoComisionesPage } from "@/pages/Vendedoras/InfoComisionesPage";

export const ProtectedRoutes = (
  <>
    <Route path="usuarios"          element={<UsersPage />} />
    <Route path="envios"            element={<EnviosPage />} />
    <Route path="cambios">
      <Route index                   element={<CambiosPage />} />
      <Route path="devoluciones"            element={<DevolucionesPage />} />
      <Route path="devolucionesML"            element={<DevolucionesMercadoLibrePage />} />
    </Route>
    <Route path="vendedoras">
      <Route index                   element={<VentasVendedorasPage />} />
      <Route path="rendimiento"            element={<LocalesStatsPage />} />
      <Route path="comisioneslocales"            element={<ComisionesVendedorasPage />} />
      <Route path="comisioneslocales/info" element={<InfoComisionesPage />} />
    </Route>
    <Route path="reposicion">
      <Route index                   element={<ReposicionSelectorPage />} />
      <Route path="adultos"            element={<ReposicionPage />} />
      <Route path="ninos"            element={<ReposicionNinosPage />} />
      <Route path="logica"         element={<ReposicionLogicaPage />} />
    </Route>
  </>
);
