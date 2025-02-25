import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { JsonData } from '../types';

interface InputSectionProps {
  onDataSubmit: (allData: JsonData['data']) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onDataSubmit }) => {
  const [jsonInputs, setJsonInputs] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);

  const addInputField = () => {
    setJsonInputs([...jsonInputs, '']);
  };

  const removeInputField = (index: number) => {
    if (jsonInputs.length > 1) {
      const newInputs = [...jsonInputs];
      newInputs.splice(index, 1);
      setJsonInputs(newInputs);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...jsonInputs];
    newInputs[index] = value;
    setJsonInputs(newInputs);
  };

  const handleSubmit = () => {
    setError(null);
    let allTradeData: JsonData['data'] = [];

    try {
      // Process each JSON input
      for (const jsonInput of jsonInputs) {
        if (jsonInput.trim()) {
          const parsedData: JsonData = JSON.parse(jsonInput);
          if (!parsedData.data || !Array.isArray(parsedData.data)) {
            throw new Error('Invalid JSON format: Expected data array');
          }
          allTradeData = [...allTradeData, ...parsedData.data];
        }
      }

      // Submit all trades to parent component
      if (allTradeData.length > 0) {
        onDataSubmit(allTradeData);
      } else {
        setError('No valid data found in inputs');
      }
    } catch (err) {
      setError(`Error processing JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-medium mb-4">Import Data</h2>
      
      {jsonInputs.map((input, index) => (
        <div key={index} className="mb-3 flex items-start">
          <div className="flex-1">
            <textarea
              className="w-full h-20 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder='Paste your JSON data here...'
              value={input}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          </div>
          {jsonInputs.length > 1 && (
            <button 
              className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
              onClick={() => removeInputField(index)}
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      ))}
      
      <div className="flex items-center mt-4">
        <button 
          className="flex items-center bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100"
          onClick={addInputField}
        >
          <Plus size={16} className="mr-1" /> Add Another JSON
        </button>
        
        <button 
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default InputSection;