import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ManualBonusAwarderProps {
  onSuccess?: () => void;
  onClose?: () => void;
  hrId: string;
  employees?: Array<{ id: string; name: string; email: string }>;
}

export default function ManualBonusAwarder({
  onSuccess,
  onClose,
  hrId,
  employees = []
}: ManualBonusAwarderProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    quarter: 'Q4',
    year: new Date().getFullYear(),
    reason: ''
  });

  const [filteredEmployees, setFilteredEmployees] = useState(employees);

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'year' ? (value ? parseFloat(value) : '') : value
    }));
  };

  const handleEmployeeSearch = (query: string) => {
    if (!query) {
      setFilteredEmployees(employees);
      return;
    }
    
    const filtered = employees.filter(emp =>
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      employeeId
    }));
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeId || !formData.amount) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/hr/manual-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount.toString()),
          year: parseInt(formData.year.toString()),
          hrId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to award bonus');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award bonus');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
          <div className="flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
            Bonus Awarded Successfully!
          </h3>
          <p className="text-center text-gray-600">
            Manual bonus of ${parseFloat(formData.amount.toString()).toLocaleString()} has been awarded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#004E9E] to-[#007BFF] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BanknotesIcon className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Award Manual Bonus</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {step === 1 ? (
            // Step 1: Select Employee
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  onChange={(e) => handleEmployeeSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleEmployeeSelect(emp.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.email}</div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No employees found
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Step 2: Enter Bonus Details
            <div className="space-y-4">
              {/* Selected Employee */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Selected Employee:</span>{' '}
                  {employees.find(e => e.id === formData.employeeId)?.name}
                </p>
              </div>

              {/* Bonus Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Amount ($) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-transparent"
                />
              </div>

              {/* Quarter and Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quarter" className="block text-sm font-medium text-gray-700 mb-2">
                    Quarter *
                  </label>
                  <select
                    id="quarter"
                    name="quarter"
                    value={formData.quarter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-transparent"
                  >
                    {quarters.map(q => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-transparent"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Override
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Explain why the calculated bonus was overridden..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004E9E] focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {step === 2 && (
              <button
                type="submit"
                disabled={loading || !formData.amount}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? 'Awarding...' : 'Award Bonus'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
