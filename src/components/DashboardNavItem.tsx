import React from 'react'

interface DashboardNavItemProps {
  icon: React.ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
  showTitle: boolean;
}

const DashboardNavItem: React.FC<DashboardNavItemProps> = ({ icon, title, active, onClick, showTitle }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-2 rounded-md transition-colors ${
        active ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className={`mr-3 ${active ? 'text-white' : 'text-gray-500'}`}>{icon}</span>
      {showTitle && <span className="text-sm font-medium">{title}</span>}
      {active && showTitle && (
        <span className="ml-auto">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </button>
  )
}

export default DashboardNavItem