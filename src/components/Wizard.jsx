import React from 'react';

const Wizard = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="w-full py-6 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between w-full px-2 min-w-[700px]">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="flex flex-col items-center flex-1 relative group cursor-pointer"
                        onClick={() => onStepClick && onStepClick(index)}
                    >
                        {/* Circle Icon */}
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mb-2 transition-all duration-300 z-10 shadow-sm
                                ${index === currentStep
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-lg'
                                    : index < currentStep
                                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-400'
                                        : 'bg-white text-gray-400 border-2 border-gray-200'
                                } group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500`}
                        >
                            {index < currentStep ? '✓' : index + 1}
                        </div>

                        {/* Text Label */}
                        <span
                            className={`text-[11px] font-black text-center whitespace-nowrap transition-colors
                                ${index === currentStep ? 'text-blue-700' : 'text-gray-500'}
                                group-hover:text-blue-600`}
                        >
                            {step}
                        </span>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`absolute top-5 left-1/2 w-full h-[3px] -translate-y-1/2 -z-0 transition-colors duration-300
                                    ${index < currentStep ? 'bg-blue-400' : 'bg-gray-200'}`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wizard;
