import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/Landing/LandingPage";
import MailingPage from "@/pages/Mailing/MailingPage";
import { GastosPage } from "@/pages/Gastos/GastosPage";
import EnviosPage from "@/pages/Envios/EnviosPage";
import AnalisisRotacionPage from "@/pages/Analisis/AnalisisRotacionPage";
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
import CambiosPage from "@/pages/Cambios/CambiosPage";

const AppRoutes: React.FC = () => (
  <Routes>
    <Route
      path="/"
      element={
          <LandingPage />
      }
    />

    <Route
      path="/usuarios"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
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
    <Route
      path="/analisis/ventas/resumen"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <VentasResumenPage />
        </RequireAuth>
      }
    />

    <Route
      path="/mercadolibre"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <MercadoLibreReportsPage />
        </RequireAuth>
      }
    />
    <Route
      path="/mercadolibre/admin"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <AdminMercadoLibrePage />
        </RequireAuth>
      }
    />

    <Route
      path="/mailing"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <MailingPage />
        </RequireAuth>
      }
    />

    <Route
      path="/clientes"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <ClientesPage />
        </RequireAuth>
      }
    />
    <Route
      path="/clientes/:id"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <ClienteDetallePage />
        </RequireAuth>
      }
    />
    <Route
      path="/clientes/ranking"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <ClientesRankingPage />
        </RequireAuth>
      }
    />
    <Route
      path="/clientes/import"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <ClientesImportPage />
        </RequireAuth>
      }
    />

    <Route
      path="/gastos"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <GastosPage />
        </RequireAuth>
      }
    />
    <Route
      path="/gastos/lista"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <GastosListPage />
        </RequireAuth>
      }
    />
    <Route
      path="/gastos/analisis"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <GastosAnalysisPage />
        </RequireAuth>
      }
    />

    <Route
      path="/envios"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <EnviosPage />
        </RequireAuth>
      }
    />

    <Route
      path="/cambios"
      element={
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
          <CambiosPage />
        </RequireAuth>
      }
    />

    {/* 404 simple */}
    <Route
      path="*"
      element={
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <h1 className="text-5xl font-bold text-[#D94854]">404</h1>
            <p className="text-lg text-white/80 mt-4">Página no encontrada</p>
          </div>
      }
    />
  </Routes>
);

export default AppRoutes;
