import React from 'react';

const Wizard = ({ steps, currentStep }) => {
    return (
        <div className="w-full py-6 overflow-x-auto">
            <div className="flex items-center justify-between w-full px-2 min-w-[600px]">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 relative">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors duration-300 z-10
                ${index <= currentStep
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {index + 1}
                        </div>
                        <span
                            className={`text-xs font-medium text-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                                }`}
                        >
                            {step}
                        </span>
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`absolute top-4 left-1/2 w-full h-[2px] -translate-y-1/2 -z-0 transition-colors duration-300
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wizard;
