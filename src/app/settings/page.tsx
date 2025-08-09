"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import {
  Cog6ToothIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BellIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  type: "boolean" | "number" | "select" | "text";
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadSettings();
  }, [router]);

  const loadSettings = () => {
    // Sample settings data
    const systemSettings: SystemSetting[] = [
      // General Settings
      {
        id: "1",
        category: "general",
        name: "System Maintenance Mode",
        description: "Enable maintenance mode to prevent user access during updates",
        type: "boolean",
        value: false
      },
      {
        id: "2",
        category: "general",
        name: "Default Objective Weight",
        description: "Default weight percentage for new objectives",
        type: "number",
        value: 20,
        min: 1,
        max: 100,
        unit: "%"
      },
      {
        id: "3",
        category: "general",
        name: "Performance Review Cycle",
        description: "Frequency of performance review cycles",
        type: "select",
        value: "quarterly",
        options: ["monthly", "quarterly", "bi-annual", "annual"]
      },
      
      // Scoring Settings
      {
        id: "4",
        category: "scoring",
        name: "AI Scoring Enabled",
        description: "Enable AI-powered objective scoring",
        type: "boolean",
        value: true
      },
      {
        id: "5",
        category: "scoring",
        name: "Manager Override Threshold",
        description: "Maximum percentage difference allowed for manager overrides",
        type: "number",
        value: 15,
        min: 5,
        max: 50,
        unit: "%"
      },
      {
        id: "6",
        category: "scoring",
        name: "Auto-Score Frequency",
        description: "How often to automatically update AI scores",
        type: "select",
        value: "weekly",
        options: ["daily", "weekly", "bi-weekly", "monthly"]
      },

      // Bonus Settings
      {
        id: "7",
        category: "bonus",
        name: "Bonus Pool Allocation",
        description: "Total annual bonus pool amount",
        type: "number",
        value: 500000,
        min: 0,
        unit: "$"
      },
      {
        id: "8",
        category: "bonus",
        name: "Minimum Performance Score",
        description: "Minimum score required for bonus eligibility",
        type: "number",
        value: 70,
        min: 0,
        max: 100,
        unit: "/100"
      },
      {
        id: "9",
        category: "bonus",
        name: "Bonus Distribution Method",
        description: "Method for calculating individual bonus amounts",
        type: "select",
        value: "performance_weighted",
        options: ["equal_distribution", "performance_weighted", "role_based", "hybrid"]
      },

      // Notifications
      {
        id: "10",
        category: "notifications",
        name: "Email Notifications",
        description: "Send email notifications for system events",
        type: "boolean",
        value: true
      },
      {
        id: "11",
        category: "notifications",
        name: "Reminder Frequency",
        description: "How often to send objective completion reminders",
        type: "select",
        value: "weekly",
        options: ["never", "daily", "weekly", "bi-weekly"]
      },
      {
        id: "12",
        category: "notifications",
        name: "Approval Escalation Time",
        description: "Hours before escalating pending approvals",
        type: "number",
        value: 48,
        min: 1,
        max: 168,
        unit: "hours"
      },

      // Security
      {
        id: "13",
        category: "security",
        name: "Multi-Factor Authentication",
        description: "Require MFA for all user accounts",
        type: "boolean",
        value: false
      },
      {
        id: "14",
        category: "security",
        name: "Session Timeout",
        description: "Automatic session timeout duration",
        type: "number",
        value: 8,
        min: 1,
        max: 24,
        unit: "hours"
      },
      {
        id: "15",
        category: "security",
        name: "Audit Log Retention",
        description: "How long to retain audit logs",
        type: "select",
        value: "1_year",
        options: ["3_months", "6_months", "1_year", "2_years", "indefinite"]
      }
    ];
    
    setSettings(systemSettings);
  };

  const updateSetting = (id: string, newValue: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Saving settings:", settings);
      setHasChanges(false);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      loadSettings();
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: Cog6ToothIcon },
    { id: "scoring", name: "Scoring", icon: ChartBarIcon },
    { id: "bonus", name: "Bonus", icon: CurrencyDollarIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
  ];

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case "boolean":
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => updateSetting(setting.id, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        );
      
      case "number":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={setting.value}
              onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
              min={setting.min}
              max={setting.max}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {setting.unit && <span className="text-sm text-text-light">{setting.unit}</span>}
          </div>
        );
      
      case "select":
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );
      
      case "text":
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        );
      
      default:
        return null;
    }
  };

  if (!user) return <div>Loading...</div>;

  const filteredSettings = settings.filter(setting => setting.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-dark">System Settings</h1>
              <p className="text-text-light mt-2">Configure system parameters and organizational preferences</p>
            </div>
            
            {hasChanges && (
              <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                <div className="flex items-center text-yellow-600">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-text-light hover:text-text-dark hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="p-6">
            <div className="space-y-6">
              {filteredSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 pr-8">
                    <h3 className="text-lg font-medium text-text-dark">{setting.name}</h3>
                    <p className="text-sm text-text-light mt-1">{setting.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              System Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-light">System Version:</span>
                <span className="text-text-dark font-medium">2.4.1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Last Updated:</span>
                <span className="text-text-dark font-medium">Dec 1, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Database Status:</span>
                <span className="text-green-600 font-medium flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Connected
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Total Users:</span>
                <span className="text-text-dark font-medium">204</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Recent Changes
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Bonus Pool Updated</p>
                <p className="text-xs text-blue-600">Increased by 15% for Q4 2024</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">AI Scoring Improved</p>
                <p className="text-xs text-green-600">Algorithm updated to v2.1</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Security Update</p>
                <p className="text-xs text-yellow-600">MFA implementation in progress</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
