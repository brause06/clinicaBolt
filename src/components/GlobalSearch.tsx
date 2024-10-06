import React, { useState } from 'react';
import { Search } from 'lucide-react';

const GlobalSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de búsqueda
    console.log('Buscando:', searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder="Buscar pacientes, citas, tratamientos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      <button type="submit" className="absolute right-3 top-2 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600">
        <Search size={16} />
      </button>
    </form>
  );
};

export default GlobalSearch;