import React from 'react';

const PageLoader: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1A1A20]">
            {/* Patrones de fondo sutiles */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(217, 72, 84, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(182, 149, 191, 0.2) 0%, transparent 50%)
          `,
                }}
            />

            <div className="relative">
                {/* Logo animado */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D94854] to-[#F23D5E] flex items-center justify-center shadow-2xl shadow-[#D94854]/20 animate-pulse">
                    <span className="text-white font-black text-2xl tracking-tighter">N</span>
                </div>

                {/* Anillo de carga */}
                <div className="absolute -inset-4 border-2 border-white/5 rounded-full"></div>
                <div className="absolute -inset-4 border-2 border-t-[#D94854] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>

            <div className="mt-8 text-center">
                <h3 className="text-white font-bold text-xl tracking-tight">Notizap</h3>
                <p className="text-white/40 text-sm mt-1 animate-pulse font-medium">Cargando...</p>
            </div>
        </div>
    );
};

export default PageLoader;
