const API_URL = 'http://localhost:3000/api';

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

// Añade más funciones para otras llamadas a la API según sea necesario
