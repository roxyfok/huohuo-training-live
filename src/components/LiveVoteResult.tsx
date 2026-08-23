"use client";

import { useState, useEffect, useCallback } from "react";

interface LiveVoteResultProps {
  voteSessionId: string;
  title: string;
}

export default function LiveVoteResult({ voteSessionId, title }: LiveVoteResultProps) {
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/votes?voteSessionId=${voteSessionId}`);
      const data = await res.json();
      setResults(data.options || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("fetch votes error", e);
    }
  }, [voteSessionId]);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 3000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  const maxCount = Math.max(...results.map((r: any) => r.count || 0), 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <span className="text-sm text-[#c9a96e] bg-[#c9a96e]/10 px-3 py-1 rounded-full">
          {total} 人参与
        </span>
      </div>

      <div className="space-y-4">
        {results.map((option: any) => {
          const percent = total > 0 ? Math.round((option.count / total) * 100) : 0;
          const barWidth = maxCount > 0 ? (option.count / maxCount) * 100 : 0;

          return (
            <div key={option.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white/80 text-sm">{option.label}</span>
                <span className="text-[#c9a96e] text-sm font-medium">
                  {option.count} 票 ({percent}%)
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c9a96e] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
