"use client";

import { useState, useEffect, useCallback } from "react";

interface LiveInputWallProps {
  slideId: string;
}

export default function LiveInputWall({ slideId }: LiveInputWallProps) {
  const [items, setItems] = useState<any[]>([]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/inputs?slideId=${slideId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data.reverse());
      }
    } catch (e) {
      console.error("fetch inputs error", e);
    }
  }, [slideId]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 3000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">实时笔记墙</h3>
        <span className="text-sm text-[#c9a96e] bg-[#c9a96e]/10 px-3 py-1 rounded-full">
          {items.length} 条笔记
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-2">
        {items.length === 0 && (
          <div className="col-span-full text-center text-white/30 py-20">
            等待学员输入...
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[#c9a96e] font-semibold text-sm">{item.authorName}</span>
              <span className="text-white/20 text-xs">
                {new Date(item.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
