import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { configService } from '../../services/api';

const ContractorRegister = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        nombreCompleto: '',
        email: '',
        password: '',
        especialidadPrincipal: ''
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await configService.getCategories();
            if (response.success) {
                setCategories(response.data.categorias);
                // Seleccionar Plomería por defecto (como en la imagen)
                if (response.data.categorias.length > 0) {
                    const plomeria = response.data.categorias.find(cat => cat.nombre.toLowerCase() === 'plomería') || response.data.categorias[0];
                    setFormData(prev => ({ ...prev, especialidadPrincipal: plomeria.id }));
                }
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
            // Categorías por defecto si falla la API
            const defaultCategories = [
                { id: 1, nombre: 'Gasista' },
                { id: 2, nombre: 'Plomería' },
                { id: 3, nombre: 'Electricidad' }
            ];
            setCategories(defaultCategories);
            setFormData(prev => ({ ...prev, especialidadPrincipal: 2 })); // Plomería por defecto
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Separar nombre y apellido
            const [nombre, ...apellidoParts] = formData.nombreCompleto.split(' ');
            const apellido = apellidoParts.join(' ') || 'Contratista';

            const registerData = {
                nombre: nombre,
                apellido: apellido,
                email: formData.email,
                password: formData.password,
                tipo_usuario_id: 2, // Contratista
                telefono: '+541123456789',
                whatsapp: '+541123456789',
                ciudad: 'Buenos Aires',
                provincia: 'CABA',
                especialidad_id: formData.especialidadPrincipal
            };

            const result = await register(registerData);

            if (result.success) {
                alert('Cuenta de contratista creada exitosamente. Ya puedes iniciar sesión.');
                navigate('/contractor/auth');
            } else {
                alert(result.message || 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            alert('Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCategories) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header rojo */}
            <div className="bg-red-600 h-16 w-full relative">
                <button
                    onClick={() => navigate('/contractor/auth')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="max-w-md mx-auto px-6 py-12">
                {/* Título */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        <span className="text-blue-600">ServiLink Pro</span>
                    </h1>
                </div>

                {/* Subtítulo */}
                <div className="text-center mb-8">
                    <h2 className="text-xl font-medium text-gray-800">
                        Crear Cuenta de Contratista
                    </h2>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre Completo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder=""
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder=""
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder=""
                        />
                    </div>

                    {/* Especialidad Principal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Especialidad Principal
                        </label>
                        <select
                            name="especialidadPrincipal"
                            value={formData.especialidadPrincipal}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botón de registro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Registrándose...' : 'Registrarse'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContractorRegister;