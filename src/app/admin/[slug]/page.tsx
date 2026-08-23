"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LiveInputWall from "@/components/LiveInputWall";
import LiveVoteResult from "@/components/LiveVoteResult";

export default function AdminPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [session, setSession] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"slides" | "inputs" | "votes">("slides");
  const [updating, setUpdating] = useState(false);

  // 获取场次
  useEffect(() => {
    fetch(`/api/sessions/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setCurrentSlide(data.currentSlide || 0);
      });
  }, [slug]);

  // 更新当前页（推送给所有学员）
  const goToSlide = async (index: number) => {
    setUpdating(true);
    setCurrentSlide(index);
    try {
      await fetch(`/api/sessions/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentSlide: index }),
      });
    } catch (e) {
      console.error("update slide error", e);
    } finally {
      setUpdating(false);
    }
  };

  const slide = session?.slides?.[currentSlide];

  return (
    <div className="min-h-screen p-6">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{session?.title || "管理后台"}</h1>
          <p className="text-white/40 text-sm">讲师控制面板 · 学员会实时同步你的翻页</p>
        </div>
        <div className="flex gap-2">
          {(["slides", "inputs", "votes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-[#c9a96e] text-[#0a0a0f]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {tab === "slides" && "📑 课件控制"}
              {tab === "inputs" && "📝 实时笔记"}
              {tab === "votes" && "📊 投票结果"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* 课件控制页 */}
        {activeTab === "slides" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 幻灯片列表 + 遥控 */}
            <div className="lg:col-span-1">
              <div className="bg-white/3 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white/60 mb-3">课件导航（点击切换）</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {session?.slides?.map((s: any, i: number) => (
                    <button
                      key={s.id}
                      onClick={() => goToSlide(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        i === currentSlide
                          ? "border-[#c9a96e] bg-[#c9a96e]/10 text-white"
                          : "border-white/5 bg-white/3 text-white/50 hover:border-white/10"
                      }`}
                    >
                      <span className="text-white/30 mr-2">{i + 1}.</span>
                      <span className="capitalize">{s.type}</span>
                      {s.title && <span className="text-white/30 ml-1">· {s.title}</span>}
                    </button>
                  ))}
                </div>

                {/* 翻页控制 */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => currentSlide > 0 && goToSlide(currentSlide - 1)}
                    disabled={currentSlide === 0}
                    className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 disabled:opacity-30"
                  >
                    ⬅ 上一页
                  </button>
                  <button
                    onClick={() =>
                      currentSlide < (session?.slides?.length || 0) - 1 &&
                      goToSlide(currentSlide + 1)
                    }
                    disabled={currentSlide >= (session?.slides?.length || 0) - 1}
                    className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 disabled:opacity-30"
                  >
                    下一页 ➡
                  </button>
                </div>
                {updating && <p className="text-xs text-[#c9a96e] mt-2 text-center">同步中...</p>}
              </div>

              {/* 学员端链接 */}
              <div className="mt-4 bg-white/3 border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white/60 mb-2">学员入口</h3>
                <p className="text-xs text-white/40 mb-2">让学员打开这个链接：</p>
                <div className="bg-black/30 rounded-lg px-3 py-2 text-xs text-[#c9a96e] break-all">
                  {typeof window !== "undefined" ? `${window.location.origin}/s/${slug}` : `/s/${slug}`}
                </div>
              </div>
            </div>

            {/* 当前页预览 */}
            <div className="lg:col-span-2">
              <div className="bg-white/3 border border-white/10 rounded-2xl p-6 min-h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    第 {currentSlide + 1} 页预览
                  </h3>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded">
                    {slide?.type}
                  </span>
                </div>

                {slide?.title && (
                  <p className="text-white/60 text-sm mb-4">{slide.title}</p>
                )}

                {slide?.type === "vote" && slide.config?.voteSessionId && (
                  <LiveVoteResult
                    voteSessionId={slide.config.voteSessionId}
                    title={slide.config.question || "投票结果"}
                  />
                )}

                {slide?.type === "input" && (
                  <LiveInputWall slideId={slide.id} />
                )}

                {slide?.type === "video" && slide.config?.bvid && (
                  <div className="text-white/40 text-sm">
                    <p>视频页 · BV号：{slide.config.bvid}</p>
                    <p className="mt-2">学员端会显示B站播放器</p>
                  </div>
                )}

                {slide?.type === "content" && (
                  <div className="text-white/40 text-sm">
                    <p>内容页</p>
                    {slide.config?.content && (
                      <p className="mt-2 whitespace-pre-wrap">{slide.config.content}</p>
                    )}
                  </div>
                )}

                {!slide && (
                  <p className="text-white/30 text-center py-20">请先选择一页课件</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 实时笔记大屏 */}
        {activeTab === "inputs" && slide?.type === "input" && (
          <LiveInputWall slideId={slide.id} />
        )}
        {activeTab === "inputs" && slide?.type !== "input" && (
          <div className="text-center text-white/30 py-20">
            当前页不是键入页，切换到键入页查看实时笔记
          </div>
        )}

        {/* 投票结果大屏 */}
        {activeTab === "votes" && slide?.type === "vote" && slide.config?.voteSessionId && (
          <div className="max-w-3xl mx-auto">
            <LiveVoteResult
              voteSessionId={slide.config.voteSessionId}
              title={slide.config.question || "投票结果"}
            />
          </div>
        )}
        {activeTab === "votes" && slide?.type !== "vote" && (
          <div className="text-center text-white/30 py-20">
            当前页不是投票页，切换到投票页查看结果
          </div>
        )}
      </main>
    </div>
  );
}
