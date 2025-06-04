import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";

import LandingPage from "@/pages/Landing/LandingPage";
import CambiosPage from "@/pages/Cambios/CambiosPage";
import InstagramPage from "@/pages/Instagram/InstagramPage";
import WooCommercePage from "@/pages/WooCommerce/WooCommercePage";
import MercadoLibrePage from "@/pages/MercadoLibre/MercadoLibrePage";
import MailingPage from "@/pages/Mailing/MailingPage";
import GastosPage from "@/pages/Gastos/GastosPage";
import EnviosPage from "@/pages/Envios/EnviosPage";
import PublicidadPage from "@/pages/Publicidad/PublicidadPage";
import AnalisisRotacionPage from "@/pages/Analisis/AnalisisRotacionPage"
import VentasPage from "@/pages/Analisis/VentasPage";
import GraficoEvolucionPage from "@/pages/Analisis/GraficoEvolucionPage";
import ProcesadorImagenesPage from "@/pages/ProcesadorImagenes/ProcesadorImagenesPage";
import { UsersPage } from "@/pages/Login/UsersPage";
import { RequireAuth } from "./RequireAuth";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<AppLayout><LandingPage /></AppLayout>} />
    <Route
      path="/usuarios"
      element={
        <AppLayout>
          <RequireAuth allowedRoles={["superadmin"]}>
            <UsersPage />
          </RequireAuth>
        </AppLayout>
      }
    />
    <Route
      path="/analisis/ventas"
      element={
        <AppLayout>
          <RequireAuth allowedRoles={["admin", "superadmin"]}>
            <VentasPage />
          </RequireAuth>
        </AppLayout>
      }
    />
    <Route path="/cambios" element={<AppLayout><CambiosPage /></AppLayout>} />
    <Route path="/instagram" element={<AppLayout><InstagramPage /></AppLayout>} />
    <Route path="/woocommerce" element={<AppLayout><WooCommercePage /></AppLayout>} />
    <Route path="/mercadolibre" element={<AppLayout><MercadoLibrePage /></AppLayout>} />
    <Route path="/mailing" element={<AppLayout><MailingPage /></AppLayout>} />
    <Route path="/gastos" element={<AppLayout><GastosPage /></AppLayout>} />
    <Route path="/envios" element={<AppLayout><EnviosPage /></AppLayout>} />
    <Route path="/publicidad" element={<AppLayout><RequireAuth allowedRoles={["viewer"]}><PublicidadPage /> </RequireAuth></AppLayout>} />
    <Route path="/analisis" element={<AppLayout><AnalisisRotacionPage /></AppLayout>} />
    <Route path="/analisis/grafico" element={<AppLayout><GraficoEvolucionPage /></AppLayout>} />
    <Route path="procesador-imagenes" element={<AppLayout><ProcesadorImagenesPage /></AppLayout>} />
    {/* 404 simple */}
    <Route path="*" element={
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <h1 className="text-5xl font-bold text-[#D94854]">404</h1>
          <p className="text-lg text-white/80 mt-4">Página no encontrada</p>
        </div>
      </AppLayout>
    } />
  </Routes>
);

export default AppRoutes;
