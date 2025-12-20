"use client";

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function SettingsPanel() {
  const [requireDescription, setRequireDescription] = useState(true);
  const [generationMode, setGenerationMode] = useState<'batch' | 'interactive'>('batch');
  const [batchQuantity, setBatchQuantity] = useState(5);

  const incrementQuantity = () => {
    setBatchQuantity(prev => Math.min(prev + 1, 50));
  };

  const decrementQuantity = () => {
    setBatchQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark transition-colors duration-200">
      
      {/* Setting 1: Require Description */}
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Require brief description to generate requirement
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When enabled, a description must be provided before generating requirements
            </p>
          </div>
          <button
            onClick={() => setRequireDescription(!requireDescription)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              requireDescription ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                requireDescription ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Setting 2: Generation Mode */}
      <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Generation mode
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose between batch or interactive requirement generation
            </p>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setGenerationMode('batch')}
              className={`px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
                generationMode === 'batch'
                  ? 'bg-primary text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Batch
            </button>
            <button
              onClick={() => setGenerationMode('interactive')}
              className={`px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
                generationMode === 'interactive'
                  ? 'bg-primary text-white dark:text-black'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Interactive
            </button>
          </div>
        </div>
      </div>

      {/* Setting 3: Batch Quantity */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Quantity of requirements for batch generation
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of requirements to generate in batch mode
            </p>
          </div>
          <div className="flex items-center">
            <div className="flex items-center border border-border-light dark:border-gray-600 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white min-w-[50px] text-center">
                {batchQuantity}
              </div>
              <div className="flex flex-col border-l border-border-light dark:border-gray-600">
                <button
                  onClick={incrementQuantity}
                  disabled={generationMode === 'interactive'}
                  className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={decrementQuantity}
                  disabled={generationMode === 'interactive'}
                  className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-border-light dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-3 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
