"use client";

import { useState, useEffect, useCallback } from "react";

interface VoteCardProps {
  voteSessionId: string;
  voteType: "single" | "multiple";
  title: string;
  options: { id: string; label: string }[];
}

export default function VoteCard({ voteSessionId, voteType, title, options }: VoteCardProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [voted, setVoted] = useState(false);
  const [voterHash, setVoterHash] = useState("");

  useEffect(() => {
    // 生成浏览器指纹
    const hash = Math.random().toString(36).substring(2, 15);
    setVoterHash(hash);
  }, []);

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

  const toggleOption = (id: string) => {
    if (voteType === "single") {
      setSelected([id]);
    } else {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const submit = async () => {
    if (selected.length === 0) return;
    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voteSessionId,
          optionIds: selected,
          voterHash,
        }),
      });
      setVoted(true);
      fetchResults();
    } catch (e) {
      console.error("submit vote error", e);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-white mb-5">{title}</h3>

      <div className="space-y-3 mb-6">
        {options.map((option) => {
          const result = results.find((r: any) => r.id === option.id);
          const count = result?.count || 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const isSelected = selected.includes(option.id);

          return (
            <div
              key={option.id}
              onClick={() => !voted && toggleOption(option.id)}
              className={`relative rounded-xl border px-5 py-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-[#c9a96e] bg-[#c9a96e]/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              } ${voted ? "cursor-default" : ""}`}
            >
              {/* 进度条背景 */}
              {voted && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#c9a96e]/10 rounded-xl transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isSelected
                        ? "bg-[#c9a96e] border-[#c9a96e]"
                        : "border-white/30"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-white/90 text-sm">{option.label}</span>
                </div>
                {voted && (
                  <span className="text-[#c9a96e] text-sm font-medium">{count}票 ({percent}%)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!voted ? (
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className="w-full py-3 bg-[#c9a96e] text-[#0a0a0f] font-semibold rounded-xl hover:bg-[#d4b87a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          提交投票
        </button>
      ) : (
        <p className="text-center text-[#c9a96e] text-sm">✓ 已投票 · 共 {total} 人参与</p>
      )}
    </div>
  );
}
