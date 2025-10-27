import React from 'react';
import { Card } from '../components/shared/Card';
import { Settings, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';

export const Dashboard = () => {
  const stats = AnalyticsService.getDashboardStats();
  const categoryStats = AnalyticsService.getCategoryStats();
  const recruitmentStats = AnalyticsService.getRecruitmentStats();

  const dashboardCards = [
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      icon: Settings,
      color: 'blue'
    },
    {
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Hired',
      value: stats.hiredCandidates,
      icon: CheckCircle,
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>

      {/* Main Stats */}
      <div className="grid grid-cols-4 gap-4">
        {dashboardCards.map((card, idx) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
          };

          return (
            <Card key={idx}>
              <div className="text-center">
                <div className={`${colorClasses[card.color]} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Icon size={24} />
                </div>
                <p className="text-slate-600 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Category Stats">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Total:</span>
              <span className="font-semibold">{categoryStats.total}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Active:</span>
              <span className="font-semibold text-green-600">{categoryStats.active}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Total Fields:</span>
              <span className="font-semibold">{categoryStats.totalFields}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Avg Fields/Cat:</span>
              <span className="font-semibold">{categoryStats.averageFieldsPerCategory}</span>
            </div>
          </div>
        </Card>

        <Card title="Recruitment Stats">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Total Candidates:</span>
              <span className="font-semibold">{recruitmentStats.total}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Hired:</span>
              <span className="font-semibold text-green-600">{recruitmentStats.hired}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">In Progress:</span>
              <span className="font-semibold text-yellow-600">{recruitmentStats.inProgress}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span className="text-slate-600">Conversion:</span>
              <span className="font-semibold text-blue-600">{recruitmentStats.conversionRate}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel Overview */}
      <Card title="Recruitment Funnel Overview">
        <div className="space-y-2">
          {stats.funnelStats.map((stage, idx) => (
            <div key={stage.stage} className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">{stage.stage}:</span>
              <span className="text-sm font-semibold text-slate-900">{stage.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Platform Performance */}
      {stats.platformStats.length > 0 && (
        <Card title="Platform Performance">
          <div className="grid grid-cols-2 gap-4">
            {stats.platformStats.map(platform => (
              <div key={platform.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-900">{platform.name}</p>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-slate-600">Total: {platform.total}</span>
                  <span className="text-green-600 font-semibold">Hired: {platform.hired}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};  