import React, { useMemo } from 'react';
import { Card } from '../shared/Card';
import { STAGE_OPTIONS } from '../../utils/constants';

export const FunnelChart = ({ candidates }) => {
  const funnelData = useMemo(() => {
    return STAGE_OPTIONS.map(option => ({
      stage: option.value,
      count: candidates.filter(c => c.stage === option.value).length
    })).filter(item => item.count > 0 || STAGE_OPTIONS.indexOf({ value: item.stage }) === 0);
  }, [candidates]);

  const maxCount = Math.max(...funnelData.map(d => d.count), 1);

  return (
    <Card title="Recruitment Funnel">
      <div className="space-y-4">
        {funnelData.map((item, idx) => (
          <div key={item.stage}>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-slate-900">{item.stage}</span>
              <span className="text-sm text-slate-600">{item.count} candidates</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '40px' : '0px' }}
              >
                {item.count > 0 && item.count}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};