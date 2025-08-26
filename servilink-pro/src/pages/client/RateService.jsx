import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { evaluationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const RateService = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const { serviceType, description, appointmentId } = location.state || {};

    const [ratings, setRatings] = useState({
        overall: 0,
        punctuality: 0,
        quality: 0,
        communication: 0,
        cleanliness: 0
    });

    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStarRating = (category, rating) => {
        setRatings(prev => ({
            ...prev,
            [category]: rating
        }));
    };

    const handleSubmit = async () => {
        if (ratings.overall === 0) {
            alert('Por favor califica el servicio general');
            return;
        }

        setLoading(true);
        try {
            const evaluationData = {
                cita_id: appointmentId || 1,
                evaluado_id: 4, // ID del contratista (ejemplo)
                tipo_evaluador: 'cliente',
                calificacion: ratings.overall,
                comentario: comment,
                puntualidad: ratings.punctuality || ratings.overall,
                calidad_trabajo: ratings.quality || ratings.overall,
                comunicacion: ratings.communication || ratings.overall,
                limpieza: ratings.cleanliness || ratings.overall
            };

            const response = await evaluationService.createEvaluation(evaluationData);

            if (response.success) {
                alert('¡Gracias por tu calificación!');
                navigate('/client/dashboard');
            } else {
                throw new Error(response.message || 'Error al enviar calificación');
            }
        } catch (error) {
            console.error('Error enviando calificación:', error);
            alert('Error al enviar la calificación. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({ category, value, onChange, label }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(category, star)}
                        className="focus:outline-none"
                    >
                        <Star
                            className={`w-6 h-6 ${star <= value
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header rojo */}
            <div className="bg-red-600 h-16 w-full relative">
                <button
                    onClick={() => navigate('/client/dashboard')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="max-w-md mx-auto px-6 py-8">
                {/* Título */}
                <div className="text-center mb-8">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Calificar Servicios Finalizados
                    </h1>
                </div>

                {/* Servicios completados */}
                <div className="space-y-6">
                    {/* Plomería */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Plomería</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Cambio de grifería completa en el baño principal.
                            </p>
                        </div>

                        <StarRating
                            category="overall"
                            value={ratings.overall}
                            onChange={handleStarRating}
                            label="Calificación General"
                        />

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Deja un comentario sobre el servicio..."
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none mb-4"
                            rows="3"
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={loading || ratings.overall === 0}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Calificar Trabajo'}
                        </button>
                    </div>

                    {/* Gasista */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-800 mb-2">Gasista</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Instalación de cocina nueva y revisión de conexión.
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setRatings({ overall: 5, punctuality: 5, quality: 5, communication: 5, cleanliness: 5 });
                                setComment('Excelente trabajo, muy profesional');
                                setTimeout(() => handleSubmit(), 100);
                            }}
                            className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors duration-200"
                        >
                            Calificar Trabajo
                        </button>
                    </div>
                </div>

                {/* Botón cerrar sesión */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/client/dashboard')}
                        className="text-gray-500 text-sm hover:text-gray-700"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RateService;