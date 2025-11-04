"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cog6ToothIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
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
  const [darkMode, setDarkMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loadingSystemInfo, setLoadingSystemInfo] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    applyDarkMode(savedDarkMode);
    
    // Load settings from localStorage or initialize defaults
    loadSettings();
    
    // Load system info
    loadSystemInfo();
  }, [router]);

  const loadSystemInfo = async () => {
    try {
      setLoadingSystemInfo(true);
      const response = await fetch('/api/system/info');
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ System info loaded:', result.data);
        setSystemInfo(result.data);
      } else {
        console.error('Error loading system info:', result.error);
        setSystemInfo(null);
      }
    } catch (error) {
      console.error('❌ Error fetching system info:', error);
      setSystemInfo(null);
    } finally {
      setLoadingSystemInfo(false);
    }
  };

  const applyDarkMode = (isDark: boolean) => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  };

  const loadSettings = () => {
    // Try to load from localStorage, otherwise use defaults
    const savedSettings = localStorage.getItem("systemSettings");
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
        id: "appearance",
        category: "general",
        name: "Dark Mode",
        description: "Enable dark mode for the entire application",
        type: "boolean",
        value: darkMode
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
      {
        id: "notification_sound",
        category: "notifications",
        name: "Enable Sound Notifications",
        description: "Play sound when receiving notifications",
        type: "boolean",
        value: true
      }
    ];    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const merged = systemSettings.map(setting => ({
          ...setting,
          value: parsed[setting.id]?.value !== undefined ? parsed[setting.id].value : setting.value
        }));
        setSettings(merged);
        return;
      } catch (e) {
        console.error("Error loading saved settings:", e);
      }
    }
    
    setSettings(systemSettings);
  };

  const updateSetting = (id: string, newValue: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ));
    setHasChanges(true);

    // Handle dark mode immediately
    if (id === "appearance") {
      setDarkMode(newValue);
      applyDarkMode(newValue);
      
      // Save dark mode to localStorage immediately
      localStorage.setItem("darkMode", newValue.toString());
      
      // Dispatch custom event for sidebar to listen to
      window.dispatchEvent(new CustomEvent('darkModeChanged', { 
        detail: { darkMode: newValue } 
      }));
      
      // Also update document class for dark mode
      const htmlElement = document.documentElement;
      if (newValue) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    }

    // Handle maintenance mode update
    if (id === "1") {
      updateMaintenanceMode(newValue);
    }
  };

  const updateMaintenanceMode = async (enabled: boolean) => {
    try {
      console.log(`🔧 Updating maintenance mode to: ${enabled}`);
      const response = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Maintenance mode updated:', result.message);
      } else {
        console.error('❌ Error updating maintenance mode:', result.error);
      }
    } catch (error) {
      console.error('❌ Error updating maintenance mode:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      // Save to localStorage
      const settingsToSave: Record<string, any> = {};
      settings.forEach(setting => {
        settingsToSave[setting.id] = { value: setting.value };
      });
      
      localStorage.setItem("systemSettings", JSON.stringify(settingsToSave));
      localStorage.setItem("darkMode", darkMode.toString());
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setSaveMessage("✅ Settings saved successfully!");
      
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("❌ Error saving settings. Please try again.");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      loadSettings();
      setDarkMode(false);
      applyDarkMode(false);
      localStorage.removeItem("systemSettings");
      localStorage.removeItem("darkMode");
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: Cog6ToothIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
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
            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
              darkMode
                ? 'bg-gray-700 peer-checked:bg-primary after:bg-gray-800'
                : 'bg-gray-200 peer-checked:bg-primary after:bg-white'
            }`}></div>
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
              className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'border-gray-300 bg-white text-text-dark'
              }`}
            />
            {setting.unit && <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-text-light'}`}>{setting.unit}</span>}
          </div>
        );
      
      case "select":
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className={`w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 bg-white text-text-dark'
            }`}
          >
            {setting.options?.map(option => (
              <option key={option} value={option} className={darkMode ? 'bg-gray-800' : ''}>
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
            className={`w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'border-gray-300 bg-white text-text-dark'
            }`}
          />
        );
      
      default:
        return null;
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const filteredSettings = settings.filter(setting => setting.category === activeTab);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-text-dark'}`}>System Settings</h1>
              <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-text-light'}`}>Configure system parameters and organizational preferences</p>
            </div>
            
            {/* Dark Mode Toggle in Header */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={() => {
                  const newDarkMode = !darkMode;
                  setDarkMode(newDarkMode);
                  applyDarkMode(newDarkMode);
                  setHasChanges(true);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              </button>

              {hasChanges && (
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Unsaved changes</span>
                  </div>
                  <button
                    onClick={resetSettings}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      darkMode
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                        : 'border-gray-300 text-text-dark hover:bg-gray-50'
                    }`}
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

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              saveMessage.includes('✅')
                ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800'
                : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'
            }`}>
              {saveMessage}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={`rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} mb-8`}>
          <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                        ? `border-primary ${darkMode ? 'text-primary' : 'text-primary'}`
                        : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'text-text-light hover:text-text-dark hover:border-gray-300'}`
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
                <div key={setting.id} className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'} last:border-b-0`}>
                  <div className="flex-1 pr-8">
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-text-dark'}`}>{setting.name}</h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-text-light'}`}>{setting.description}</p>
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
          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-text-dark'}`}>
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              System Information
            </h3>
            {loadingSystemInfo ? (
              <div className="flex items-center justify-center py-8">
                <p className={darkMode ? 'text-gray-400' : 'text-text-light'}>Loading system info...</p>
              </div>
            ) : systemInfo ? (
              <div className={`space-y-3 text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-text-light'}>System Version:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-text-dark'}`}>{systemInfo.systemVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-text-light'}>Last Updated:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-text-dark'}`}>
                    {new Date(systemInfo.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-text-light'}>Database Status:</span>
                  <span className="text-green-600 font-medium flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    {systemInfo.databaseStatus}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3" style={{borderTopColor: darkMode ? '#374151' : '#e5e7eb'}}>
                  <span className={darkMode ? 'text-gray-400' : 'text-text-light'}>Total Users:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-text-dark'}`}>{systemInfo.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-text-light'}>Total Departments:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-text-dark'}`}>{systemInfo.totalDepartments}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-text-light'}>Total Teams:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-text-dark'}`}>{systemInfo.totalTeams}</span>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-text-light'}`}>
                Failed to load system information
              </div>
            )}
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-text-dark'}`}>
              <ClockIcon className="w-5 h-5 mr-2" />
              Recent Changes
            </h3>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Bonus Pool Updated</p>
                <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Increased by 15% for Q4 2024</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-green-300' : 'text-green-800'}`}>AI Scoring Improved</p>
                <p className={`text-xs ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Algorithm updated to v2.1</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-50'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>Security Update</p>
                <p className={`text-xs ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>MFA implementation in progress</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
