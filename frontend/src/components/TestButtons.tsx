import React from 'react';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

const TestButtons: React.FC = () => {
    const { user } = useAuth();

    const handleDeleteAllCitas = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todas las citas?')) {
            try {
                await api.delete('/citas/test/deleteAll');
                alert('Todas las citas han sido eliminadas');
            } catch (error) {
                console.error('Error al eliminar citas:', error);
                alert('Error al eliminar las citas');
            }
        }
    };

    const handleCreateTestCitas = async () => {
        try {
            console.log('Intentando crear citas de prueba...');
            const token = localStorage.getItem('authToken');
            console.log('Token:', token ? 'Presente' : 'No encontrado');
            
            const response = await api.post('/citas/test/createTest', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Respuesta:', response);
            alert('Citas de prueba creadas');
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Config de la petición:', error.config);
            console.error('Respuesta del servidor:', error.response);
            alert('Error al crear citas de prueba');
        }
    };

    if (!user ) return null;

    return (
        <div className="p-4">
            <button 
                onClick={handleDeleteAllCitas}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            >
                Eliminar todas las citas
            </button>
            <button 
                onClick={handleCreateTestCitas}
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                Crear citas de prueba
            </button>
        </div>
    );
};

export default TestButtons; 