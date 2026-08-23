"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">霍霍AI实训营</h1>
          <p className="text-white/40">互动课件管理系统</p>
        </header>

        {/* 创建新场次 */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">创建新培训场次</h2>
          <CreateSessionForm onCreated={(s) => setSessions((prev) => [s, ...prev])} />
        </div>

        {/* 场次列表 */}
        <h2 className="text-lg font-semibold text-white mb-4">培训场次</h2>
        {loading ? (
          <p className="text-white/30 text-center py-10">加载中...</p>
        ) : sessions.length === 0 ? (
          <p className="text-white/30 text-center py-10">还没有场次，创建一个吧</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="bg-white/3 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{s.title}</h3>
                    <p className="text-white/30 text-sm mt-1">
                      标识：{s.slug} · 状态：{s.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/s/${s.slug}`}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      学员端
                    </Link>
                    <Link
                      href={`/admin/${s.slug}`}
                      className="px-4 py-2 bg-[#c9a96e] text-[#0a0a0f] rounded-lg text-sm font-medium hover:bg-[#d4b87a] transition-colors"
                    >
                      讲师控制
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateSessionForm({ onCreated }: { onCreated: (s: any) => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const generateSlug = (t: string) => {
    const base = t
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);
    const date = new Date().toISOString().slice(0, 10);
    return base ? `${base}-${date}` : `session-${date}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    const finalSlug = slug.trim() || generateSlug(title);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), slug: finalSlug }),
      });
      const data = await res.json();
      onCreated(data);
      setTitle("");
      setSlug("");
    } catch (e) {
      alert("创建失败，slug可能已存在");
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">培训标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) setSlug(generateSlug(e.target.value));
          }}
          placeholder="例如：AI赋能高效办公"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a96e]/50"
        />
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">
          标识（URL用，可留空自动生成）
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="ai-office-2026-08-23"
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#c9a96e]/50"
        />
      </div>
      <button
        type="submit"
        disabled={creating || !title.trim()}
        className="px-6 py-2.5 bg-[#c9a96e] text-[#0a0a0f] font-medium text-sm rounded-xl hover:bg-[#d4b87a] disabled:opacity-40 transition-colors"
      >
        {creating ? "创建中..." : "创建场次"}
      </button>
    </form>
  );
}
