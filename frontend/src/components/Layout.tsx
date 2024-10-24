import React, { ReactNode } from 'react'
import Navbar from './Navbar'; // Asegúrate de que la ruta sea correcta

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar /> {/* Asegúrate de que el Navbar esté aquí */}
      {children}
    </div>
  );
};

export default Layout
