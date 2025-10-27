import { RecruitmentService } from './recruitmentService';
import { CategoryService } from './categoryService';

export const AnalyticsService = {
  getDashboardStats: () => {
    const candidates = RecruitmentService.getAll();
    const categories = CategoryService.getAll();

    return {
      totalCategories: categories.length,
      activeCategories: categories.filter(c => c.status === 'active').length,
      totalCandidates: candidates.length,
      hiredCandidates: candidates.filter(c => c.stage === 'Hired').length,
      inProgressCandidates: candidates.filter(c => !['Hired', 'Rejected'].includes(c.stage)).length,
      rejectedCandidates: candidates.filter(c => c.stage === 'Rejected').length,
      conversionRate: RecruitmentService.getConversionRate(),
      funnelStats: RecruitmentService.getFunnelStats(),
      platformStats: RecruitmentService.getPlatformStats()
    };
  },

  getCategoryStats: () => {
    const categories = CategoryService.getAll();
    const totalFields = categories.reduce((sum, cat) => sum + (cat.fields?.length || 0), 0);

    return {
      total: categories.length,
      active: categories.filter(c => c.status === 'active').length,
      inactive: categories.filter(c => c.status === 'inactive').length,
      totalFields: totalFields,
      averageFieldsPerCategory: categories.length ? (totalFields / categories.length).toFixed(2) : 0
    };
  },

  getRecruitmentStats: () => {
    const candidates = RecruitmentService.getAll();
    const funnelStats = RecruitmentService.getFunnelStats();

    return {
      total: candidates.length,
      hired: candidates.filter(c => c.stage === 'Hired').length,
      rejected: candidates.filter(c => c.stage === 'Rejected').length,
      inProgress: candidates.filter(c => !['Hired', 'Rejected'].includes(c.stage)).length,
      conversionRate: RecruitmentService.getConversionRate(),
      funnelStats: funnelStats,
      platformStats: RecruitmentService.getPlatformStats()
    };
  },

  getTimelineData: (days = 30) => {
    const candidates = RecruitmentService.getAll();
    const now = new Date();
    const timeline = {};

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      timeline[dateStr] = 0;
    }

    candidates.forEach(candidate => {
      const dateStr = candidate.appliedAt.split('T')[0];
      if (timeline.hasOwnProperty(dateStr)) {
        timeline[dateStr]++;
      }
    });

    return Object.entries(timeline).map(([date, count]) => ({ date, count }));
  }
};