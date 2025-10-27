import React from 'react';
import { Card } from '../shared/Card';
import { Users, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

export const RecruitmentStats = ({ candidates }) => {
  const stats = [
    {
      label: 'Total Candidates',
      value: candidates.length,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Hired',
      value: candidates.filter(c => c.stage === 'Hired').length,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'In Progress',
      value: candidates.filter(c => !['Hired', 'Rejected'].includes(c.stage)).length,
      icon: TrendingUp,
      color: 'yellow'
    },
    {
      label: 'Conversion Rate',
      value: `${candidates.length ? ((candidates.filter(c => c.stage === 'Hired').length / candidates.length) * 100).toFixed(1) : 0}%`,
      icon: AlertCircle,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colorClass = {
          blue: 'text-blue-600 bg-blue-50',
          green: 'text-green-600 bg-green-50',
          yellow: 'text-yellow-600 bg-yellow-50',
          purple: 'text-purple-600 bg-purple-50'
        };

        return (
          <Card key={idx}>
            <div className="text-center">
              <div className={`${colorClass[stat.color]} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                <Icon size={24} />
              </div>
              <p className="text-slate-600 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 text-${stat.color}-600`}>{stat.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};