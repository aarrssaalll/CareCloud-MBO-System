import { memo } from 'react';

interface ObjectiveCardProps {
  objective: {
    title: string;
    description: string;
    progress: number;
    status: string;
  };
  index: number;
}

const ObjectiveCard = memo(({ objective, index }: ObjectiveCardProps) => {
  return (
    <div 
      key={index} 
      className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {objective.title}
          </h4>
          <p className="text-gray-600 leading-relaxed">
            {objective.description}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ml-4 ${
          objective.status === 'Completed' ? 'bg-green-100 text-green-800' :
          objective.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {objective.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 group-hover:shadow-lg" 
              style={{ width: `${objective.progress}%` }}
            ></div>
          </div>
        </div>
        <span className="text-lg font-bold text-gray-900">
          {objective.progress}%
        </span>
      </div>
    </div>
  );
});

ObjectiveCard.displayName = 'ObjectiveCard';

export default ObjectiveCard;
