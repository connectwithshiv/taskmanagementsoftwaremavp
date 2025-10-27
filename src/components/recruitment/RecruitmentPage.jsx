import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRecruitment } from '../../hooks/useRecruitment';
import { RecruitmentStats } from './RecruitmentStats';
import { FunnelChart } from './FunnelChart';
import { RecruitmentList } from './RecruitmentList';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PLATFORM_OPTIONS } from '../../utils/constants';

export const RecruitmentPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { candidates, loading, error, createCandidate, updateCandidateStage, deleteCandidate } = useRecruitment();

  const handleAddCandidate = () => {
    const name = prompt('Candidate Name:');
    if (!name?.trim()) return;

    const platform = prompt('Platform (LinkedIn, Indeed, etc):') || 'LinkedIn';

    createCandidate({
      name,
      platform,
      stage: 'Applied',
      recruiter: 'Unassigned'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Recruitment Analytics</h2>
        <Button onClick={handleAddCandidate} size="lg">
          <Plus size={18} /> Add Candidate
        </Button>
      </div>

      <RecruitmentStats candidates={candidates} />
      <FunnelChart candidates={candidates} />
      <RecruitmentList 
        candidates={candidates}
        onUpdateStage={updateCandidateStage}
        onDelete={deleteCandidate}
      />
    </div>
  );
};