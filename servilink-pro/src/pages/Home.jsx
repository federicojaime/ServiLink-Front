import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wrench } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header rojo */}
            <div className="bg-red-600 h-16 w-full"></div>

            <div className="max-w-md mx-auto px-6 py-12">
                {/* Título principal */}
                <div className="text-center mb-16">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Bienvenido a <span className="text-blue-600">ServiLink Pro</span>
                    </h1>
                </div>

                {/* Cards de selección */}
                <div className="space-y-6">
                    {/* Card Cliente */}
                    <div
                        onClick={() => navigate('/client/auth')}
                        className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Soy Cliente
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Necesito contratar un servicio
                            </p>
                        </div>
                    </div>

                    {/* Card Contratista */}
                    <div
                        onClick={() => navigate('/contractor/auth')}
                        className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Wrench className="w-8 h-8 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Soy Contratista
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Quiero ofrecer mis servicios
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;