import { useState, useCallback } from 'react';
import { RecruitmentService } from '../services/recruitmentService';

export const useRecruitment = () => {
  const [candidates, setCandidates] = useState(() => RecruitmentService.getAll());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCandidate = useCallback((data) => {
    try {
      setLoading(true);
      const result = RecruitmentService.create(data);
      setCandidates(RecruitmentService.getAll());
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCandidate = useCallback((id, data) => {
    try {
      setLoading(true);
      const result = RecruitmentService.update(id, data);
      setCandidates(RecruitmentService.getAll());
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCandidateStage = useCallback((id, stage) => {
    try {
      setLoading(true);
      const result = RecruitmentService.updateStage(id, stage);
      setCandidates(RecruitmentService.getAll());
      setError(null);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCandidate = useCallback((id) => {
    try {
      setLoading(true);
      RecruitmentService.delete(id);
      setCandidates(RecruitmentService.getAll());
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    candidates,
    loading,
    error,
    createCandidate,
    updateCandidate,
    updateCandidateStage,
    deleteCandidate,
    refreshCandidates: () => setCandidates(RecruitmentService.getAll()),
    stats: {
      funnelStats: RecruitmentService.getFunnelStats(),
      conversionRate: RecruitmentService.getConversionRate(),
      platformStats: RecruitmentService.getPlatformStats()
    }
  };
};