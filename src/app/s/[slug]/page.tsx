"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InputWall from "@/components/InputWall";
import VoteCard from "@/components/VoteCard";
import BilibiliPlayer from "@/components/BilibiliPlayer";

export default function StudentPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [session, setSession] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取场次信息
  useEffect(() => {
    fetch(`/api/sessions/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // 轮询讲师当前页码
  useEffect(() => {
    if (!session) return;
    const checkSlide = async () => {
      try {
        const res = await fetch(`/api/sessions/${slug}`);
        const data = await res.json();
        if (data.currentSlide !== undefined) {
          setCurrentSlide(data.currentSlide);
        }
      } catch (e) {
        // ignore
      }
    };
    checkSlide();
    const interval = setInterval(checkSlide, 3000);
    return () => clearInterval(interval);
  }, [session, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">加载中...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">课程不存在</p>
      </div>
    );
  }

  const slide = session.slides?.[currentSlide];

  return (
    <div className="min-h-screen p-6">
      {/* 顶部导航 */}
      <header className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{session.title}</h1>
          <p className="text-white/40 text-sm mt-1">
            第 {currentSlide + 1} / {session.slides?.length || 0} 页
          </p>
        </div>
        <div className="text-xs text-white/30 bg-white/5 px-3 py-1.5 rounded-full">
          学员端
        </div>
      </header>

      {/* 页面内容 */}
      <main className="max-w-3xl mx-auto">
        {slide ? (
          <div>
            {/* 页面标题 */}
            {slide.title && (
              <h2 className="text-2xl font-bold text-white mb-6">{slide.title}</h2>
            )}

            {/* 根据类型渲染不同组件 */}
            {slide.type === "vote" && slide.config?.voteSessionId && (
              <VoteCard
                voteSessionId={slide.config.voteSessionId}
                voteType={slide.config.voteType || "single"}
                title={slide.config.question || "投票"}
                options={slide.config.options || []}
              />
            )}

            {slide.type === "input" && (
              <InputWall
                slideId={slide.id}
                inputType={slide.config?.inputType || "notes"}
                placeholder={slide.config?.placeholder}
                hint={slide.config?.hint}
              />
            )}

            {slide.type === "video" && slide.config?.bvid && (
              <div className="space-y-6">
                <BilibiliPlayer bvid={slide.config.bvid} page={slide.config.page || 1} />
                {slide.config.showNotes !== false && (
                  <InputWall
                    slideId={slide.id}
                    inputType="notes"
                    placeholder="边看边记笔记..."
                    hint="💡 请使用【姓名】XXXX 格式记录笔记"
                  />
                )}
              </div>
            )}

            {slide.type === "content" && (
              <div className="text-white/80 text-base leading-relaxed whitespace-pre-wrap">
                {slide.config?.content || "本页为内容页"}
              </div>
            )}

            {slide.type === "mixed" && (
              <div className="space-y-6">
                {slide.config?.bvid && <BilibiliPlayer bvid={slide.config.bvid} />}
                {slide.config?.showInput && (
                  <InputWall
                    slideId={slide.id}
                    inputType={slide.config.inputType || "notes"}
                    placeholder={slide.config.placeholder}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/50 text-center py-20">等待讲师开始...</p>
        )}
      </main>
    </div>
  );
}
