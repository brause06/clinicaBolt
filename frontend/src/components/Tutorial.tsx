import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  image: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Bienvenido a FisioClínica",
    description: "Esta guía te ayudará a familiarizarte con las principales funciones de nuestra plataforma.",
    image: "/img/tutorial/welcome.png"
  },
  {
    title: "Tu Historial Médico",
    description: "Accede a tu historial médico completo, incluyendo diagnósticos y tratamientos anteriores.",
    image: "/img/tutorial/medical-history.png"
  },
  {
    title: "Plan de Ejercicios",
    description: "Visualiza y sigue tu plan de ejercicios personalizado directamente desde la aplicación.",
    image: "/img/tutorial/exercise-plan.png"
  },
  {
    title: "Programación de Citas",
    description: "Programa y gestiona tus citas de fisioterapia de manera fácil y rápida.",
    image: "/img/tutorial/appointments.png"
  },
  {
    title: "¡Listo para Comenzar!",
    description: "Ahora estás listo para sacar el máximo provecho de FisioClínica. ¡Comencemos!",
    image: "/img/tutorial/ready.png"
  }
];

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{tutorialSteps[currentStep].title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <img 
          src={tutorialSteps[currentStep].image} 
          alt={tutorialSteps[currentStep].title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <p className="text-gray-600 mb-6">{tutorialSteps[currentStep].description}</p>
        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrevious} 
            className={`flex items-center ${currentStep === 0 ? 'invisible' : ''}`}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>
          <div className="flex space-x-1">
            {tutorialSteps.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleNext} 
            className="flex items-center text-blue-500 font-semibold"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

