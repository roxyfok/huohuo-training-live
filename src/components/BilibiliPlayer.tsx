"use client";

interface BilibiliPlayerProps {
  bvid: string;
  page?: number;
}

export default function BilibiliPlayer({ bvid, page = 1 }: BilibiliPlayerProps) {
  const src = `//player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1&danmaku=0`;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={src}
          scrolling="no"
          frameBorder="0"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
}
