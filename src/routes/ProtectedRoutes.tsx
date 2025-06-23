import { Route } from "react-router-dom";

import { UsersPage }                 from "@/pages/Login/UsersPage";
import AnalisisRotacionPage      from "@/pages/Analisis/AnalisisRotacionPage";
import VentasPage                from "@/pages/Analisis/VentasPage";
import GraficoEvolucionPage      from "@/pages/Analisis/GraficoEvolucionPage";
import VentasResumenPage         from "@/pages/Analisis/VentasResumenPage";
import MailingPage               from "@/pages/Mailing/MailingPage";
import MercadoLibreReportsPage   from "@/pages/MercadoLibre/MercadoLibreReportsPage";
import AdminMercadoLibrePage     from "@/pages/MercadoLibre/AdminMercadoLibrePage";
import ClientesPage              from "@/pages/Clientes/ClientesPage";
import ClienteDetallePage        from "@/pages/Clientes/ClienteDetallePage";
import ClientesRankingPage       from "@/pages/Clientes/ClienteRankingPage";
import ClientesImportPage        from "@/pages/Clientes/ClientesImportPage";
import { GastosPage }           from "@/pages/Gastos/GastosPage";
import { GastosListPage }            from "@/pages/Gastos/GastosListPage";
import { GastosAnalysisPage }       from "@/pages/Gastos/GastosAnalysisPage";
import EnviosPage                from "@/pages/Envios/EnviosPage";
import CambiosPage               from "@/pages/Cambios/CambiosPage";
import DevolucionesPage from "@/pages/Cambios/DevolucionesPage";
import MercadoLibreAnalysisPage from "@/pages/MercadoLibre/MercadoLibreAnalysisPage";

export const ProtectedRoutes = (
  <>
    <Route path="usuarios"          element={<UsersPage />} />
    <Route path="analisis">
      <Route index                   element={<AnalisisRotacionPage />} />
      <Route path="ventas"           element={<VentasPage />} />
      <Route path="grafico"          element={<GraficoEvolucionPage />} />
      <Route path="ventas/resumen"   element={<VentasResumenPage />} />
    </Route>
    <Route path="mailing"           element={<MailingPage />} />
    <Route path="mercadolibre">
      <Route index                   element={<MercadoLibreReportsPage />} />
      <Route path="admin"            element={<AdminMercadoLibrePage />} />
      <Route path="analysisML"            element={<MercadoLibreAnalysisPage />} />
    </Route>
    <Route path="clientes">
      <Route index                   element={<ClientesPage />} />
      <Route path="import"           element={<ClientesImportPage />} />
      <Route path="ranking"          element={<ClientesRankingPage />} />
      <Route path=":id"              element={<ClienteDetallePage />} />
    </Route>
    <Route path="gastos">
      <Route index                   element={<GastosPage />} />
      <Route path="lista"            element={<GastosListPage />} />
      <Route path="analisis"         element={<GastosAnalysisPage />} />
    </Route>
    <Route path="envios"            element={<EnviosPage />} />
    <Route path="cambios">
      <Route index                   element={<CambiosPage />} />
      <Route path="devoluciones"            element={<DevolucionesPage />} />
    </Route>
  </>
);
