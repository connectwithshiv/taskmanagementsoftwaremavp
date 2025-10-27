const STORAGE_KEYS = {
  RECRUITMENT_DATA: 'app_recruitment_data'
};

export const RecruitmentService = {
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECRUITMENT_DATA);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recruitment data:', error);
      return [];
    }
  },

  create: (candidateData) => {
    const candidates = RecruitmentService.getAll();
    const newCandidate = {
      id: Date.now().toString(),
      ...candidateData,
      stage: candidateData.stage || 'Applied',
      appliedAt: new Date().toISOString(),
      logs: [{ 
        action: 'Applied', 
        timestamp: new Date().toISOString() 
      }]
    };
    
    const updated = [...candidates, newCandidate];
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_DATA, JSON.stringify(updated));
    return newCandidate;
  },

  update: (id, candidateData) => {
    const candidates = RecruitmentService.getAll();
    const updated = candidates.map(c =>
      c.id === id
        ? {
            ...c,
            ...candidateData,
            modifiedAt: new Date().toISOString()
          }
        : c
    );
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_DATA, JSON.stringify(updated));
    return updated.find(c => c.id === id);
  },

  updateStage: (id, newStage) => {
    const candidate = RecruitmentService.getById(id);
    if (!candidate) return null;

    const updated = {
      ...candidate,
      stage: newStage,
      logs: [...(candidate.logs || []), { 
        action: `Moved to ${newStage}`, 
        timestamp: new Date().toISOString() 
      }]
    };

    const allCandidates = RecruitmentService.getAll();
    const updatedList = allCandidates.map(c => c.id === id ? updated : c);
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_DATA, JSON.stringify(updatedList));
    return updated;
  },

  delete: (id) => {
    const candidates = RecruitmentService.getAll();
    const updated = candidates.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_DATA, JSON.stringify(updated));
    return true;
  },

  getById: (id) => {
    const candidates = RecruitmentService.getAll();
    return candidates.find(c => c.id === id);
  },

  getByStage: (stage) => {
    const candidates = RecruitmentService.getAll();
    return candidates.filter(c => c.stage === stage);
  },

  getByPlatform: (platform) => {
    const candidates = RecruitmentService.getAll();
    return candidates.filter(c => c.platform === platform);
  },

  getByRecruiter: (recruiter) => {
    const candidates = RecruitmentService.getAll();
    return candidates.filter(c => c.recruiter === recruiter);
  },

  getFunnelStats: () => {
    const candidates = RecruitmentService.getAll();
    const stages = ['Applied', 'Initial Contact', 'Interview', 'Offer', 'Hired', 'Rejected'];
    
    return stages.map(stage => ({
      stage,
      count: candidates.filter(c => c.stage === stage).length
    }));
  },

  getConversionRate: () => {
    const candidates = RecruitmentService.getAll();
    if (candidates.length === 0) return 0;
    const hired = candidates.filter(c => c.stage === 'Hired').length;
    return ((hired / candidates.length) * 100).toFixed(2);
  },

  getPlatformStats: () => {
    const candidates = RecruitmentService.getAll();
    const platforms = [...new Set(candidates.map(c => c.platform))];
    
    return platforms.map(platform => ({
      name: platform,
      total: candidates.filter(c => c.platform === platform).length,
      hired: candidates.filter(c => c.platform === platform && c.stage === 'Hired').length
    }));
  }
};