import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/Landing/LandingPage";
import MailingPage from "@/pages/Mailing/MailingPage";
import { GastosPage } from "@/pages/Gastos/GastosPage";
import EnviosPage from "@/pages/Envios/EnviosPage";
import AnalisisRotacionPage from "@/pages/Analisis/AnalisisRotacionPage"
import VentasPage from "@/pages/Analisis/VentasPage";
import GraficoEvolucionPage from "@/pages/Analisis/GraficoEvolucionPage";
import { UsersPage } from "@/pages/Login/UsersPage";
import { RequireAuth } from "./RequireAuth";
import MercadoLibreReportsPage from "@/pages/MercadoLibre/MercadoLibreReportsPage";
import AdminMercadoLibrePage from "@/pages/MercadoLibre/AdminMercadoLibrePage";
import ClientesPage from "@/pages/Clientes/ClientesPage";
import ClientesRankingPage from "@/pages/Clientes/ClienteRankingPage";
import ClientesImportPage from "@/pages/Clientes/ClientesImportPage";
import ClienteDetallePage from "@/pages/Clientes/ClienteDetallePage";
import VentasResumenPage from "@/pages/Analisis/VentasResumenPage";
import { GastosListPage } from "@/pages/Gastos/GastosListPage";
import { GastosAnalysisPage } from "@/pages/Gastos/GastosAnalysisPage";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route
      path="/usuarios"
      element={
        <RequireAuth allowedRoles={["superadmin"]}>
          <UsersPage />
        </RequireAuth>
      }
    />

    <Route
      path="/analisis/ventas"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <VentasPage />
        </RequireAuth>
      }
    />
    <Route
      path="/analisis"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <AnalisisRotacionPage />
        </RequireAuth>
      }
    />    
    <Route
      path="/analisis/grafico"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <GraficoEvolucionPage />
        </RequireAuth>
      }
    />    
    <Route path="/analisis/ventas/resumen" element={<VentasResumenPage />} />
    <Route
      path="/mercadolibre"
      element={<MercadoLibreReportsPage />}
    />
    <Route
      path="/mercadolibre/admin"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <AdminMercadoLibrePage />
        </RequireAuth>
      }
    />
    <Route path="/mailing" element={<MailingPage />} />
    <Route path="/clientes" element={<ClientesPage />} />
    <Route path="/clientes/:id" element={<ClienteDetallePage />} />
    <Route path="/clientes/ranking" element={<ClientesRankingPage />} />
    <Route path="/clientes/import" element={<ClientesImportPage />} />
    <Route path="/gastos" element={<GastosPage />} />
    <Route path="/gastos/lista" element={<GastosListPage />} />
    <Route path="/gastos/analisis" element={<GastosAnalysisPage />} />
    <Route path="/envios" element={<EnviosPage />} />
    {/* 404 simple */}
    <Route path="*" element={
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-5xl font-bold text-[#D94854]">404</h1>
        <p className="text-lg text-white/80 mt-4">Página no encontrada</p>
      </div>
    } />
  </Routes>
);

export default AppRoutes;
