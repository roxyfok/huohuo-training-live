"use client";

import { useState, useEffect, useCallback } from "react";

interface InputWallProps {
  slideId: string;
  inputType: string;
  placeholder?: string;
  hint?: string;
}

export default function InputWall({ slideId, inputType, placeholder, hint }: InputWallProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 轮询获取最新内容（每3秒）
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/inputs?slideId=${slideId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data.reverse()); // 正序显示，最新的在底部
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

  const submit = async () => {
    if (!name.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/inputs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideId, inputType, authorName: name.trim(), content: content.trim() }),
      });
      setContent("");
      fetchItems();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 输入区 */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            placeholder="你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-shrink-0 w-28 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e]/50"
          />
          <input
            type="text"
            placeholder={placeholder || "输入内容..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e]/50"
          />
        </div>
        {hint && <p className="text-xs text-white/40 mb-3">{hint}</p>}
        <button
          onClick={submit}
          disabled={loading || !name.trim() || !content.trim()}
          className="px-6 py-2 bg-[#c9a96e] text-[#0a0a0f] font-medium text-sm rounded-xl hover:bg-[#d4b87a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "发送中..." : "发送"}
        </button>
      </div>

      {/* 内容墙 */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {items.length === 0 && (
          <p className="text-center text-white/30 text-sm py-10">还没有内容，快来抢沙发~</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white/3 border border-white/5 rounded-xl px-4 py-3 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#c9a96e] font-medium text-sm">{item.authorName}</span>
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
