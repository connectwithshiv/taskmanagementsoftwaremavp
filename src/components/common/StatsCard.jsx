import React from 'react';

const StatsCard = ({ stats, isDarkMode }) => {
  const statItems = [
    { label: 'Total', value: stats.total, gradient: 'from-blue-600 to-blue-700' },
    { label: 'Active', value: stats.active, gradient: 'from-green-600 to-green-700' },
    { label: 'High Priority', value: stats.highPriority, gradient: 'from-red-600 to-red-700' },
    { label: 'With Fields', value: stats.withFields, gradient: 'from-purple-600 to-purple-700' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, idx) => (
        <div key={idx} className={`bg-gradient-to-br ${item.gradient} p-4 rounded-lg text-white`}>
          <div className="text-2xl font-bold">{item.value}</div>
          <p className="text-xs mt-1 opacity-90">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;