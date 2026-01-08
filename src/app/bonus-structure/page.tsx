'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceThreshold {
  minPercentage: number;
  maxPercentage: number;
  multiplier: number;
}

interface BonusStructureData {
  id: string | null;
  year: number;
  calculationMethod: string;
  baseAmount: number;
  performanceThresholds: PerformanceThreshold[];
  enableManualOverride: boolean;
  quarterlyBudget: number;
  departmentOverrides: Record<string, any>;
  roleMultipliers: Record<string, any>;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  creator: any;
  updater: any;
  isDefault?: boolean;
}

export default function BonusStructurePage() {
  const { user, isLoading: authLoading } = useAuth(true, ['HR', 'hr']);
  const router = useRouter();
  const [bonusStructure, setBonusStructure] = useState<BonusStructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<BonusStructureData>>({});

  // Check authorization
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch bonus structure
  useEffect(() => {
    fetchBonusStructure();
  }, []);

  const fetchBonusStructure = async () => {
    try {
      setLoading(true);
      setError('');
      const year = new Date().getFullYear();
      const response = await fetch(`/api/hr/bonus-structure?year=${year}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // Parse JSON fields if they're strings
        const parsedData = {
          ...data,
          performanceThresholds: typeof data.performanceThresholds === 'string' 
            ? JSON.parse(data.performanceThresholds) 
            : (Array.isArray(data.performanceThresholds) ? data.performanceThresholds : []),
          departmentOverrides: typeof data.departmentOverrides === 'string'
            ? JSON.parse(data.departmentOverrides)
            : (data.departmentOverrides || {}),
          roleMultipliers: typeof data.roleMultipliers === 'string'
            ? JSON.parse(data.roleMultipliers)
            : (data.roleMultipliers || {})
        };
        
        setBonusStructure(parsedData);
        setFormData(parsedData);
      } else {
        setError(result.error || 'Failed to fetch bonus structure');
      }
    } catch (err) {
      console.error('Error fetching bonus structure:', err);
      setError('Failed to fetch bonus structure');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThresholdChange = (index: number, field: string, value: number) => {
    const thresholds = [...(formData.performanceThresholds || [])];
    thresholds[index] = {
      ...thresholds[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      performanceThresholds: thresholds
    }));
  };

  const addThreshold = () => {
    const newThreshold: PerformanceThreshold = {
      minPercentage: 0,
      maxPercentage: 100,
      multiplier: 1.0
    };
    setFormData(prev => ({
      ...prev,
      performanceThresholds: [...(prev.performanceThresholds || []), newThreshold]
    }));
  };

  const removeThreshold = (index: number) => {
    const thresholds = formData.performanceThresholds?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({
      ...prev,
      performanceThresholds: thresholds
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.baseAmount || formData.baseAmount <= 0) {
      setError('Base amount must be greater than 0');
      return false;
    }
    if (!formData.quarterlyBudget || formData.quarterlyBudget <= 0) {
      setError('Quarterly budget must be greater than 0');
      return false;
    }
    if (!formData.performanceThresholds || formData.performanceThresholds.length === 0) {
      setError('At least one performance threshold is required');
      return false;
    }

    // Validate thresholds
    for (const threshold of formData.performanceThresholds) {
      if (threshold.multiplier < 0 || threshold.multiplier > 1.0) {
        setError('Performance multiplier must be between 0 and 1.0');
        return false;
      }
      if (threshold.minPercentage < 0 || threshold.maxPercentage > 100) {
        setError('Performance percentages must be between 0 and 100%');
        return false;
      }
      if (threshold.minPercentage >= threshold.maxPercentage) {
        setError('Min percentage must be less than max percentage');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        ...formData,
        userId: user?.id,
        year: formData.year || new Date().getFullYear()
      };

      const method = bonusStructure?.id && !bonusStructure.isDefault ? 'PUT' : 'POST';
      if (method === 'PUT') {
        payload.id = bonusStructure?.id;
      }

      const response = await fetch('/api/hr/bonus-structure', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        const data = result.data;
        
        // Parse JSON fields if they're strings
        const parsedData = {
          ...data,
          performanceThresholds: typeof data.performanceThresholds === 'string' 
            ? JSON.parse(data.performanceThresholds) 
            : (Array.isArray(data.performanceThresholds) ? data.performanceThresholds : []),
          departmentOverrides: typeof data.departmentOverrides === 'string'
            ? JSON.parse(data.departmentOverrides)
            : (data.departmentOverrides || {}),
          roleMultipliers: typeof data.roleMultipliers === 'string'
            ? JSON.parse(data.roleMultipliers)
            : (data.roleMultipliers || {})
        };
        
        setBonusStructure(parsedData);
        setFormData(parsedData);
        setEditMode(false);
        setSuccessMessage('Bonus structure saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to save bonus structure');
      }
    } catch (err) {
      console.error('Error saving bonus structure:', err);
      setError('Failed to save bonus structure');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004E9E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#333333] mb-2">Bonus Structure Configuration</h1>
          <p className="text-[#666666]">Manage bonus calculation parameters and settings for the current year</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Year and Status */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-[#F5F7FA]">
            <div>
              <p className="text-sm text-[#666666] mb-1">Year</p>
              <p className="text-xl font-semibold text-[#333333]">{bonusStructure?.year}</p>
            </div>
            <div>
              <p className="text-sm text-[#666666] mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                bonusStructure?.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {bonusStructure?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {!editMode ? (
            // View Mode
            <div>
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-[#666666] mb-2">Calculation Method</p>
                  <p className="text-lg font-medium text-[#333333]">{bonusStructure?.calculationMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-2">Base Amount</p>
                  <p className="text-lg font-medium text-[#333333]">${bonusStructure?.baseAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-2">Quarterly Budget</p>
                  <p className="text-lg font-medium text-[#333333]">${bonusStructure?.quarterlyBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#666666] mb-2">Manual Override</p>
                  <p className="text-lg font-medium text-[#333333]">{bonusStructure?.enableManualOverride ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {/* Performance Thresholds Display */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#333333] mb-4">Performance Thresholds</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F5F7FA] border-b border-[#E0E0E0]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[#666666] font-medium">Min Performance %</th>
                        <th className="px-4 py-3 text-left text-[#666666] font-medium">Max Performance %</th>
                        <th className="px-4 py-3 text-left text-[#666666] font-medium">Bonus Multiplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonusStructure?.performanceThresholds.map((threshold, idx) => (
                        <tr key={idx} className="border-b border-[#F5F7FA]">
                          <td className="px-4 py-3 text-[#333333]">{threshold.minPercentage}%</td>
                          <td className="px-4 py-3 text-[#333333]">{threshold.maxPercentage}%</td>
                          <td className="px-4 py-3 text-[#333333]">{threshold.multiplier.toFixed(2)}x</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Description */}
              {bonusStructure?.description && (
                <div className="mb-8">
                  <p className="text-sm text-[#666666] mb-2">Description</p>
                  <p className="text-[#333333]">{bonusStructure.description}</p>
                </div>
              )}

              {/* Created/Updated Info */}
              <div className="pt-6 border-t border-[#F5F7FA] text-xs text-[#999999]">
                <p>Created by: {bonusStructure?.creator?.name || 'System'} on {new Date(bonusStructure?.createdAt!).toLocaleDateString()}</p>
                {bonusStructure?.updater && (
                  <p>Last updated by: {bonusStructure.updater.name} on {new Date(bonusStructure.updatedAt).toLocaleDateString()}</p>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setEditMode(true)}
                className="mt-6 w-full bg-[#004E9E] text-white py-3 rounded-lg font-medium hover:bg-[#003A7A] transition"
              >
                Edit Structure
              </button>
            </div>
          ) : (
            // Edit Mode
            <div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Calculation Method</label>
                  <select
                    value={formData.calculationMethod || ''}
                    onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#004E9E]"
                  >
                    <option value="weighted_performance">Weighted Performance</option>
                    <option value="tiered_performance">Tiered Performance</option>
                    <option value="flat_rate">Flat Rate</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Base Amount ($)</label>
                  <input
                    type="number"
                    value={formData.baseAmount || ''}
                    onChange={(e) => handleInputChange('baseAmount', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#004E9E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333333] mb-2">Quarterly Budget ($)</label>
                  <input
                    type="number"
                    value={formData.quarterlyBudget || ''}
                    onChange={(e) => handleInputChange('quarterlyBudget', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#004E9E]"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableManualOverride || false}
                      onChange={(e) => handleInputChange('enableManualOverride', e.target.checked)}
                      className="w-4 h-4 mr-3"
                    />
                    <span className="text-sm font-medium text-[#333333]">Enable Manual Override</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#333333] mb-2">Description (Optional)</label>
                <div className="relative">
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#004E9E]"
                    rows={3}
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-[#004E9E] hover:bg-gray-100 rounded-md transition-colors"
                    title="Voice input (Coming soon)"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Performance Thresholds */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#333333]">Performance Thresholds</h3>
                  <button
                    onClick={addThreshold}
                    className="px-4 py-2 bg-[#007BFF] text-white rounded-lg text-sm font-medium hover:bg-[#0056b3] transition"
                  >
                    Add Threshold
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.performanceThresholds?.map((threshold, idx) => (
                    <div key={idx} className="flex gap-4 items-end p-4 bg-[#F5F7FA] rounded-lg">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[#666666] mb-1">Min %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={threshold.minPercentage}
                          onChange={(e) => handleThresholdChange(idx, 'minPercentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E0E0E0] rounded text-sm focus:outline-none focus:border-[#004E9E]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[#666666] mb-1">Max %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={threshold.maxPercentage}
                          onChange={(e) => handleThresholdChange(idx, 'maxPercentage', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E0E0E0] rounded text-sm focus:outline-none focus:border-[#004E9E]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-[#666666] mb-1">Multiplier (Max 1.0)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={threshold.multiplier}
                          onChange={(e) => handleThresholdChange(idx, 'multiplier', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-[#E0E0E0] rounded text-sm focus:outline-none focus:border-[#004E9E]"
                        />
                      </div>
                      <button
                        onClick={() => removeThreshold(idx)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-[#F5F7FA]">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#004E9E] text-white py-3 rounded-lg font-medium hover:bg-[#003A7A] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData(bonusStructure || {});
                    setError('');
                  }}
                  className="flex-1 border border-[#E0E0E0] text-[#333333] py-3 rounded-lg font-medium hover:bg-[#F5F7FA] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-[#F5F7FA] rounded-lg p-6 border border-[#E0E0E0]">
          <h3 className="font-semibold text-[#333333] mb-3">How Bonus Calculation Works</h3>
          <ul className="space-y-2 text-sm text-[#666666]">
            <li>• <strong>Weighted Performance:</strong> Sum of (Completion % × Weight) for all active objectives</li>
            <li>• <strong>Performance Thresholds:</strong> Different bonus multipliers based on achievement levels</li>
            <li>• <strong>Final Bonus:</strong> Base Amount × Performance Multiplier</li>
            <li>• <strong>Manual Override:</strong> When enabled, HR can manually adjust individual bonuses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
