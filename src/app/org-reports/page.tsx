"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DocumentArrowDownIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface TeamPerformance {
  teamId: string;
  teamName: string;
  departmentName: string;
  memberCount: number;
  quarterlyPerformance: Record<string, number>;
  totalObjectives: number;
  completedObjectives: number;
  completionRate: number;
  avgScore: number;
}

export default function OrgReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<TeamPerformance[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartView, setChartView] = useState<'line' | 'bar'>('line');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user") || localStorage.getItem("mbo_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    loadTeamPerformance();
  }, [router]);

  const loadTeamPerformance = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching team performance data...');
      
      const response = await fetch('/api/org-reports/team-performance');
      const result = await response.json();
      
      console.log('📥 Team performance API response:', result);
      
      if (result.success && result.teams && result.teams.length > 0) {
        setTeams(result.teams);
        
        // Transform quarterly performance data for charts
        const quarters = new Set<string>();
        result.teams.forEach((team: TeamPerformance) => {
          Object.keys(team.quarterlyPerformance).forEach(q => quarters.add(q));
        });

        const sortedQuarters = Array.from(quarters).sort();
        const transformedData = sortedQuarters.map(quarter => {
          const data: any = { quarter };
          result.teams.forEach((team: TeamPerformance) => {
            data[team.teamName] = team.quarterlyPerformance[quarter] || 0;
          });
          return data;
        });

        setChartData(transformedData);
        console.log(`✅ Loaded ${result.teams.length} teams with quarterly performance`);
      } else {
        console.log('⚠️ No team data available');
        setTeams([]);
        setChartData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching team performance:', error);
      setTeams([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = [
    '#004E9E', '#007BFF', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
    '#06B6D4', '#84CC16', '#D946EF', '#FB923C', '#3B82F6'
  ];

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-text-dark">Organization Reports</h1>
              <p className="text-text-light mt-2">Team performance analytics and quarterly trends across the organization</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Export Report
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-text-dark rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Quarterly Team Performance Chart */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-dark mb-4 sm:mb-0">Team Performance by Quarter</h3>
              
              {/* Chart View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartView('line')}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    chartView === 'line'
                      ? 'bg-primary text-white'
                      : 'bg-transparent text-text-dark hover:bg-gray-200'
                  }`}
                >
                  Line Chart
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    chartView === 'bar'
                      ? 'bg-primary text-white'
                      : 'bg-transparent text-text-dark hover:bg-gray-200'
                  }`}
                >
                  Bar Chart
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              {chartView === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Legend />
                  {teams.map((team, index) => (
                    <Line
                      key={team.teamId}
                      type="monotone"
                      dataKey={team.teamName}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={3}
                      connectNulls
                      dot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => `${value}%`} />
                  <Legend />
                  {teams.map((team, index) => (
                    <Bar
                      key={team.teamId}
                      dataKey={team.teamName}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 text-center text-gray-500">
            No quarterly data available
          </div>
        )}

        {/* Team Summary Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6">Team Performance Summary</h3>
          {teams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Team</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Department</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Members</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Avg Score</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Completion Rate</th>
                    <th className="pb-3 text-sm font-semibold text-text-light uppercase tracking-wide">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.teamId} className="hover:bg-gray-50">
                      <td className="py-4 font-medium text-text-dark">{team.teamName}</td>
                      <td className="py-4 text-text-light">{team.departmentName}</td>
                      <td className="py-4 text-text-light">{team.memberCount}</td>
                      <td className="py-4">
                        <span className="text-lg font-semibold text-primary">
                          {team.avgScore > 0 ? `${team.avgScore}/100` : '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-lg font-semibold text-text-dark">
                          {team.completionRate > 0 ? `${team.completionRate}%` : '-'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          team.avgScore >= 90 ? "text-green-600 bg-green-50" :
                          team.avgScore >= 80 ? "text-blue-600 bg-blue-50" :
                          team.avgScore >= 70 ? "text-yellow-600 bg-yellow-50" :
                          team.avgScore > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50"
                        }`}>
                          {team.avgScore >= 90 ? "Excellent" :
                           team.avgScore >= 80 ? "Good" :
                           team.avgScore >= 70 ? "Average" : 
                           team.avgScore > 0 ? "Needs Improvement" : "No Data"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No team performance data available
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
