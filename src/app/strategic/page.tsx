"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrophyIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Interfaces for live data
interface StrategicKPI {
  title: string;
  value: string;
  unit: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: any;
  color: string;
  bgColor: string;
}

interface DepartmentData {
  name: string;
  score: number;
  employees: number;
  completion: number;
}

interface QuarterlyTrend {
  quarter: string;
  score: number;
  engagement: number;
  completion: number;
}

interface StrategicInitiative {
  name: string;
  progress: number;
  status: string;
  owner: string;
  dueDate: string;
  impact: string;
}

export default function StrategicPage() {
  const { user, isLoading } = useAuth(true, ['SENIOR_MANAGEMENT', 'senior-management']);
  const [selectedPeriod, setSelectedPeriod] = useState("Q4-2024");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for live data
  const [strategicKPIs, setStrategicKPIs] = useState<StrategicKPI[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [quarterlyTrends, setQuarterlyTrends] = useState<QuarterlyTrend[]>([]);
  const [strategicInitiatives, setStrategicInitiatives] = useState<StrategicInitiative[]>([]);

  // Load all data when component mounts
  useEffect(() => {
    if (!isLoading && user) {
      loadStrategicData();
    }
  }, [isLoading, user, selectedPeriod]);

  const loadStrategicData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadStrategicKPIs(),
        loadDepartmentData(),
        loadQuarterlyTrends(),
        loadStrategicInitiatives()
      ]);
    } catch (error) {
      console.error('Error loading strategic data:', error);
      setError('Failed to load strategic data');
    } finally {
      setLoading(false);
    }
  };

  const loadStrategicKPIs = async () => {
    try {
      console.log('🔍 Loading strategic KPIs from strategic API...');
      
      if (!user || !user.id) {
        console.log('⚠️ No user ID available');
        return;
      }

      const response = await fetch(`/api/senior-management/strategic-trends?userId=${user.id}`);
      const result = await response.json();
      
      console.log('📊 Strategic KPIs API response:', result);
      
      if (result.success && result.overallMetrics) {
        const metrics = result.overallMetrics;
        
        const kpis: StrategicKPI[] = [
          {
            title: "Manager Performance Score",
            value: metrics.avgScore > 0 ? metrics.avgScore.toString() : "-",
            unit: "/100",
            change: "-",
            trend: "stable",
            icon: TrophyIcon,
            color: "text-green-600",
            bgColor: "bg-green-50",
          },
          {
            title: "Total Managers",
            value: metrics.totalManagers > 0 ? metrics.totalManagers.toString() : "-",
            unit: "Managers",
            change: "-",
            trend: "stable",
            icon: UsersIcon,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
          },
          {
            title: "Objectives Completion Rate",
            value: metrics.completionRate > 0 ? `${metrics.completionRate}%` : "-",
            unit: "",
            change: "-",
            trend: metrics.completionRate >= 80 ? "up" : metrics.completionRate >= 60 ? "stable" : "down",
            icon: CheckCircleIcon,
            color: "text-primary",
            bgColor: "bg-primary-50",
          },
          {
            title: "Total Manager Objectives",
            value: metrics.totalObjectives > 0 ? metrics.totalObjectives.toString() : "-",
            unit: "Objectives",
            change: "-",
            trend: "stable",
            icon: ChartBarIcon,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
          },
        ];
        
        setStrategicKPIs(kpis);
        console.log('✅ Strategic KPIs loaded successfully');
      } else {
        setStrategicKPIs([]);
        console.log('⚠️ No KPI data available');
      }
      
    } catch (error) {
      console.error('❌ Error loading strategic KPIs:', error);
      setStrategicKPIs([]);
    }
  };

  const loadDepartmentData = async () => {
    try {
      console.log('🔍 Loading department data from strategic API...');
      
      if (!user || !user.id) {
        console.log('⚠️ No user ID available');
        return;
      }

      const response = await fetch(`/api/senior-management/strategic-trends?userId=${user.id}`);
      const result = await response.json();
      
      console.log('📊 Department performance API response:', result);
      
      if (result.success && result.departmentPerformance) {
        setDepartmentData(result.departmentPerformance);
        console.log(`✅ Loaded ${result.departmentPerformance.length} department records`);
      } else {
        setDepartmentData([]);
        console.log('⚠️ No department data available');
      }
      
    } catch (error) {
      console.error('❌ Error loading department data:', error);
      setDepartmentData([]);
    }
  };

  const loadQuarterlyTrends = async () => {
    try {
      console.log('🔍 Loading quarterly trends from strategic API...');
      
      if (!user || !user.id) {
        console.log('⚠️ No user ID available');
        return;
      }

      const response = await fetch(`/api/senior-management/strategic-trends?userId=${user.id}`);
      const result = await response.json();
      
      console.log('📊 Strategic trends API response:', result);
      
      if (result.success && result.quarterlyTrends) {
        setQuarterlyTrends(result.quarterlyTrends);
        console.log(`✅ Loaded ${result.quarterlyTrends.length} quarterly trend records`);
      } else {
        setQuarterlyTrends([]);
        console.log('⚠️ No quarterly trends data available');
      }
    } catch (error) {
      console.error('❌ Error loading quarterly trends:', error);
      setQuarterlyTrends([]);
    }
  };

  const loadStrategicInitiatives = async () => {
    try {
      console.log('🔍 Loading strategic initiatives...');
      
      // TODO: Implement strategic initiatives when database table is created
      // For now, set empty array since we don't have this data structure
      setStrategicInitiatives([]);
      
      console.log('⚠️ Strategic initiatives: Data structure not implemented');
    } catch (error) {
      console.error('❌ Error loading strategic initiatives:', error);
      setStrategicInitiatives([]);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ahead":
        return { color: "text-green-600", bg: "bg-green-50", label: "Ahead of Schedule" };
      case "on_track":
        return { color: "text-blue-600", bg: "bg-blue-50", label: "On Track" };
      case "at_risk":
        return { color: "text-yellow-600", bg: "bg-yellow-50", label: "At Risk" };
      case "delayed":
        return { color: "text-red-600", bg: "bg-red-50", label: "Delayed" };
      default:
        return { color: "text-gray-600", bg: "bg-gray-50", label: "Unknown" };
    }
  };

  const COLORS = ['#004E9E', '#007BFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading || loading) {
    return <LoadingSpinner message="Loading strategic overview..." />;
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Authentication required</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={loadStrategicData}
            className="mt-4 px-4 py-2 bg-[#004E9E] text-white rounded-md hover:bg-[#003875]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Strategic Overview</h1>
            <p className="text-text-light mt-2">Executive dashboard for organizational performance and strategic initiatives</p>
          </div>
          
        </div>

        {/* Strategic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {strategicKPIs.map((kpi, index) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === "up" ? ArrowUpIcon : ArrowDownIcon;
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div className={`flex items-center space-x-1 ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{kpi.change}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-dark mb-2">{kpi.title}</h3>
                <div className="flex items-end space-x-1">
                  <span className="text-3xl font-bold text-text-dark">{kpi.value}</span>
                  <span className="text-lg text-text-light mb-1">{kpi.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quarterly Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Quarterly Performance Trends</h3>
            {quarterlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={quarterlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#004E9E" strokeWidth={3} name="Overall Score" />
                  <Line type="monotone" dataKey="engagement" stroke="#007BFF" strokeWidth={3} name="Engagement" />
                  <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={3} name="Completion Rate" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Historical quarterly data not available</p>
                  <p className="text-sm mt-2">Trends will appear after multiple quarters of data collection</p>
                </div>
              </div>
            )}
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-text-dark mb-6">Department Performance</h3>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="score" fill="#004E9E" name="Performance Score" />
                  <Bar dataKey="completion" fill="#007BFF" name="Completion Rate" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No department data available</p>
                  <p className="text-sm mt-2">Department performance will appear when data is available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strategic Initiatives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Strategic Initiatives</h3>
          {strategicInitiatives.length > 0 ? (
            <div className="space-y-6">
              {strategicInitiatives.map((initiative, index) => {
                const statusConfig = getStatusConfig(initiative.status);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-text-dark">{initiative.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {initiative.impact} Impact
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-text-light">
                          <span>Owner: <span className="font-medium text-text-dark">{initiative.owner}</span></span>
                          <span>Due: <span className="font-medium text-text-dark">{initiative.dueDate}</span></span>
                        </div>
                      </div>
                      <div className="mt-4 lg:mt-0 text-right">
                        <div className="text-2xl font-bold text-primary">{initiative.progress}%</div>
                        <div className="text-sm text-text-light">Complete</div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{ width: `${initiative.progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Strategic Initiatives</h4>
              <p className="text-gray-500">Strategic initiatives tracking is not yet implemented</p>
              <p className="text-sm text-gray-400 mt-2">This section will display organization-wide strategic projects and their progress</p>
            </div>
          )}
        </div>

        {/* Department Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Department Summary</h3>
          {departmentData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Department</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Employees</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Performance Score</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Completion Rate</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-4 font-medium text-text-dark">{dept.name}</td>
                      <td className="py-4 text-text-light">{dept.employees}</td>
                      <td className="py-4">
                        <span className="text-lg font-semibold text-primary">
                          {dept.score > 0 ? `${dept.score}/100` : '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-lg font-semibold text-text-dark">
                          {dept.completion > 0 ? `${dept.completion}%` : '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dept.score >= 90 ? "text-green-600 bg-green-50" :
                          dept.score >= 80 ? "text-blue-600 bg-blue-50" :
                          dept.score >= 70 ? "text-yellow-600 bg-yellow-50" :
                          dept.score > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50"
                        }`}>
                          {dept.score >= 90 ? "Excellent" :
                           dept.score >= 80 ? "Good" :
                           dept.score >= 70 ? "Average" : 
                           dept.score > 0 ? "Needs Improvement" : "No Data"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Department Data</h4>
              <p className="text-gray-500">Department performance data will appear when available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
