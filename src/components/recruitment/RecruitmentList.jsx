import React, { useState, useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Select } from '../shared/Select';
import { EmptyState } from '../shared/EmptyState';
import { formatDate } from '../../utils/formatters';
import { STAGE_OPTIONS } from '../../utils/constants';

export const RecruitmentList = ({ candidates, onUpdateStage, onDelete }) => {
  const [filterStage, setFilterStage] = useState('all');

  const filteredCandidates = useMemo(() => {
    return filterStage === 'all' 
      ? candidates 
      : candidates.filter(c => c.stage === filterStage);
  }, [candidates, filterStage]);

  const getStageColor = (stage) => {
    const colorMap = {
      'Applied': 'info',
      'Initial Contact': 'info',
      'Interview': 'warning',
      'Offer': 'success',
      'Hired': 'success',
      'Rejected': 'danger'
    };
    return colorMap[stage] || 'default';
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="w-64">
          <Select 
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            options={[
              { value: 'all', label: 'All Stages' },
              ...STAGE_OPTIONS
            ]}
          />
        </div>

        {filteredCandidates.length === 0 ? (
          <EmptyState title="No Candidates" description={`No candidates found in ${filterStage === 'all' ? 'pipeline' : 'this stage'}`} />
        ) : (
          <div className="space-y-2">
            {filteredCandidates.map(candidate => (
              <div key={candidate.id} className="p-4 border border-slate-200 rounded-lg flex justify-between items-center hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{candidate.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-slate-600">{candidate.platform}</span>
                    <span className="text-xs text-slate-600">{formatDate(candidate.appliedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                  <Select 
                    value={candidate.stage}
                    onChange={(e) => onUpdateStage(candidate.id, e.target.value)}
                    options={STAGE_OPTIONS}
                  />
                  <Button variant="ghost" size="sm" onClick={() => onDelete(candidate.id)}>
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};