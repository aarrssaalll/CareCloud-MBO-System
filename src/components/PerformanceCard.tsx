import { memo } from 'react';

interface PerformanceCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
  progress: number;
}

const PerformanceCard = memo(({ title, value, change, icon: Icon, color, progress }: PerformanceCardProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold flex items-center ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d={change >= 0 ? "M7 14l5-5 5 5z" : "M17 10l-5 5-5-5z"}/>
            </svg>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-gray-600">{title}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
});

PerformanceCard.displayName = 'PerformanceCard';

export default PerformanceCard;
