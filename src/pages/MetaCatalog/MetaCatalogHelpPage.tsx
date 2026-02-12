import React from 'react';
import { ArrowLeft, Clock, RefreshCw, Smartphone, Zap, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

const MetaCatalogHelpPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#111116] text-white p-6 md:p-10 font-[Inter]">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        to="/meta-catalog"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al catálogo
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        ¿Cómo funciona el Catálogo Meta?
                    </h1>
                    <p className="text-white/60 mt-2 text-lg">
                        Guía rápida para entender la automatización de los anuncios dinámicos.
                    </p>
                </div>

                {/* Grid of cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                            <Layers className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Conjuntos y Filtros</h3>
                        <p className="text-white/70 leading-relaxed">
                            Un "Conjunto" es un grupo de productos elegidos por el usuario (ej: "Zapatillas Alenka").
                            El sistema busca automáticamente en el catálogo original todos los productos que cumplan esos filtros
                            y los prepara para subir a Meta a un nuevo catálogo.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                            <Smartphone className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Plantillas Automáticas</h3>
                        <p className="text-white/70 leading-relaxed">
                            El sistema toma la foto original y le superpone
                            la <strong>Plantilla (marco)</strong>. Así, todos los anuncios salen con el diseño de marca, logo
                            y estética definido, sin tener que editar foto por foto.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ejecución Diaria</h3>
                        <p className="text-white/70 leading-relaxed">
                            Se define la frecuencia (ej: cada 24hs). El sistema trabaja solo: busca productos nuevos,
                            actualiza precios y baja los que no tienen stock. El catálogo de anuncios siempre está
                            igual que el stock real.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">En resumen</h3>
                        <p className="text-white/70 leading-relaxed">
                            En definitiva, este módulo lo que hace, es tener los anuncios dinámicos con imágenes de productos
                            mas estéticas, tal como se ven en marcas como Adidas, Fravega, etc.
                        </p>
                    </div>
                </div>

                {/* FAQ Style section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Preguntas Frecuentes</h2>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex gap-4">
                            <div className="mt-1"><RefreshCw className="w-5 h-5 text-white/50" /></div>
                            <div>
                                <h4 className="font-semibold text-lg text-white mb-2">¿Qué pasa si un producto se queda sin stock?</h4>
                                <p className="text-white/70">
                                    El sistema lo detecta en la siguiente ejecución automática y lo <strong>elimina</strong> del catálogo de Meta.
                                    Así se elimina la preocupación por anunciar productos que ya no hay.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex gap-4">
                            <div className="mt-1"><AlertTriangle className="w-5 h-5 text-white/50" /></div>
                            <div>
                                <h4 className="font-semibold text-lg text-white mb-2">¿Tengo que hacer algo yo?</h4>
                                <p className="text-white/70">
                                    Solo crear el conjunto la primera vez y subir la plantilla. Después, asegurarse de que el switch
                                    esté en <strong>"Activa"</strong>. El sistema se encarga del resto.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex gap-4">
                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-white/50" /></div>
                            <div>
                                <h4 className="font-semibold text-lg text-white mb-2">¿Cómo sé si está funcionando?</h4>
                                <p className="text-white/70">
                                    En la pantalla principal, vas a ver el estado "Completado" en verde y la fecha de la última ejecución.
                                    Si algo falla, aparece en rojo para que avises al administrador.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MetaCatalogHelpPage;
