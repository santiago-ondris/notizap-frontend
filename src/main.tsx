import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/routes/AppRoutes";
import { AuthProvider } from "@/contexts/AuthContext";
import Lenis from "lenis";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/layouts/AppLayout";
import "@/store/useArchivosAnalisis";

const queryClient = new QueryClient();

const LenisWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    return () => lenis.destroy();
  }, []);
  return <>{children}</>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <LenisWrapper>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
            <ToastContainer position="top-center" autoClose={2500} />
          </BrowserRouter>
        </AuthProvider>
      </LenisWrapper>
    </QueryClientProvider>
  </React.StrictMode>
);
