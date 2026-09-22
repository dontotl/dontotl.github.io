"use client";

import { useState } from "react";
import { Terminal, ArrowUpRight, Sparkles, ZoomIn, ZoomOut, Pin } from "lucide-react";
import type { Project } from "./PortfolioView";
import { CURATED_PROJECT_DETAILS } from "@/data/projectDetails";

interface RetroTerminalViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  searchQuery?: string;
  pinnedRepos?: string[];
  onTogglePin?: (repoName: string, e?: React.MouseEvent) => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}달 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

export default function RetroTerminalView({
  projects,
  onSelectProject,
  searchQuery = "",
  pinnedRepos,
  onTogglePin,
}: RetroTerminalViewProps) {
  // 글씨 크기 모드 (기본: "large"로 넉넉하고 시원하게)
  const [fontSize, setFontSize] = useState<"normal" | "large">("large");

  const isLarge = fontSize === "large";

  return (
    <div className="w-full font-mono rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950/95 shadow-[0_0_50px_rgba(16,185,129,0.15)] transition-all animate-in fade-in duration-300">
      {/* Terminal Window Titlebar */}
      <div className="bg-slate-900/95 border-b border-emerald-950/80 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="ml-2.5 text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 font-medium">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-100 font-bold">dontotl@matrix-station</span>
            <span className="text-slate-500">:</span>
            <span className="text-indigo-400 font-semibold">~/projects</span>
            <span className="text-slate-500">(zsh)</span>
          </span>
        </div>

        {/* Font Size Zoom Controls & Status */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center bg-slate-950 border border-emerald-900/60 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setFontSize("normal")}
              className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                !isLarge
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-400 hover:text-emerald-300"
              }`}
              title="글씨 보통 크기 (14px)"
            >
              <ZoomOut className="w-3 h-3" /> 보통
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                isLarge
                  ? "bg-emerald-600 text-white font-bold"
                  : "text-slate-400 hover:text-emerald-300"
              }`}
              title="글씨 크게 보기 (16px)"
            >
              <ZoomIn className="w-3 h-3" /> 크게
            </button>
          </div>

          <span className="hidden md:inline text-xs px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-semibold">
            {projects.length} REPOSITORIES
          </span>
        </div>
      </div>

      {/* Terminal Interactive Header / Command */}
      <div className="p-4 sm:p-5 border-b border-emerald-900/40 bg-slate-950/80 space-y-2.5">
        <div className={`flex items-center gap-2 text-emerald-400 flex-wrap ${isLarge ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
          <span className="text-indigo-400 font-bold">dontotl@github</span>
          <span className="text-slate-500">:</span>
          <span className="text-blue-400 font-bold">~/portfolio</span>
          <span className="text-emerald-400 font-bold">$</span>
          <span className="text-slate-100 font-semibold tracking-wide">
            list-matrix --all --interactive {searchQuery ? `--filter="${searchQuery}"` : ""}
          </span>
          <span className="inline-block w-2.5 h-4 bg-emerald-400 animate-pulse ml-0.5 align-middle" />
        </div>
        <div className={`${isLarge ? "text-xs sm:text-sm" : "text-xs"} text-slate-400 space-y-1 pt-1`}>
          <p className="text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>[SYS-MATRIX] {projects.length}개 프로젝트 아키텍처 인덱싱 완료 · 행(Row)을 클릭하면 <strong>Archify 시스템 구조도</strong>가 열립니다.</span>
          </p>
        </div>
      </div>

      {/* Retro Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b border-emerald-800/60 bg-emerald-950/30 text-emerald-300 uppercase tracking-wider select-none ${isLarge ? "text-xs sm:text-sm font-bold py-3.5" : "text-xs font-semibold py-2.5"}`}>
              <th className="py-3.5 px-4 w-14 text-center text-emerald-400">#</th>
              <th className="py-3.5 px-4 min-w-[220px]">REPOSITORY</th>
              <th className="py-3.5 px-4 min-w-[280px]">ROLE / SPECIALTY</th>
              <th className="py-3.5 px-4 min-w-[340px]">CORE TECH STACK CATEGORY</th>
              <th className="py-3.5 px-4 min-w-[110px] text-right">PUSHED</th>
              <th className="py-3.5 px-4 w-24 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-slate-200">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                  [WARN] 일치하는 레포지토리가 없습니다. 검색어를 재입력하거나 초기화하세요.
                </td>
              </tr>
            ) : (
              projects.map((project, idx) => {
                const curated = CURATED_PROJECT_DETAILS[project.name];
                const role = curated?.role || "Software Architecture & Dev";
                const techCategories = curated?.techStack
                  ? curated.techStack.map((s) => s.category).join(", ")
                  : project.topics.slice(0, 3).join(", ") || project.language;
                const topItems = curated?.techStack
                  ? curated.techStack.flatMap((s) => s.items).slice(0, 4)
                  : project.topics.slice(0, 3);

                const isFeatured = pinnedRepos
                  ? pinnedRepos.includes(project.name)
                  : project.featured;

                return (
                  <tr
                    key={project.id}
                    id={`term-${project.name}`}
                    onClick={() => onSelectProject(project)}
                    className="group hover:bg-emerald-950/40 hover:border-emerald-500/50 transition-all cursor-pointer border-b border-slate-900/90"
                  >
                    {/* Index */}
                    <td className={`py-4 px-4 text-center text-slate-500 group-hover:text-emerald-400 font-bold ${isLarge ? "text-sm" : "text-xs"}`}>
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* Repository Name & Lang */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {onTogglePin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(project.name, e);
                            }}
                            title={isFeatured ? "Featured 해제" : "Featured 지정"}
                            className={`p-1 rounded transition-colors ${
                              isFeatured
                                ? "text-amber-400 hover:text-amber-300"
                                : "text-slate-600 hover:text-slate-400"
                            }`}
                          >
                            <Pin className={`w-3.5 h-3.5 ${isFeatured ? "fill-amber-400" : ""}`} />
                          </button>
                        )}
                        <span className={`font-bold text-cyan-300 group-hover:text-cyan-100 group-hover:underline underline-offset-4 transition-colors ${isLarge ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                          {project.name}
                        </span>
                        {isFeatured && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                            ★ Featured
                          </span>
                        )}
                        <span className={`text-slate-400 group-hover:text-slate-300 font-medium ${isLarge ? "text-xs sm:text-sm" : "text-xs"}`}>
                          [{project.language}]
                        </span>
                      </div>
                    </td>

                    {/* Role / Specialty */}
                    <td className="py-4 px-4">
                      <span className={`text-amber-300 font-semibold leading-relaxed block group-hover:text-amber-200 ${isLarge ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>
                        {role}
                      </span>
                    </td>

                    {/* Core Tech Stack Categories */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <span className={`text-emerald-300 block font-semibold group-hover:text-emerald-200 ${isLarge ? "text-xs sm:text-sm" : "text-xs"}`}>
                          {techCategories}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {topItems.map((item) => (
                            <span
                              key={item}
                              className={`rounded bg-slate-900/90 text-slate-300 border border-slate-700/80 group-hover:border-emerald-700/60 group-hover:text-emerald-200 font-medium ${
                                isLarge ? "text-xs px-2 py-0.5" : "text-[11px] px-1.5 py-0.5"
                              }`}
                            >
                              [{item}]
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Pushed At */}
                    <td className={`py-4 px-4 text-right text-slate-400 group-hover:text-slate-200 whitespace-nowrap font-medium ${isLarge ? "text-xs sm:text-sm" : "text-xs"}`}>
                      {timeAgo(project.pushedAt)}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-700/60 transition-all font-bold cursor-pointer shadow-md ${
                          isLarge ? "px-3 py-1.5 text-xs sm:text-sm" : "px-2.5 py-1 text-xs"
                        }`}
                      >
                        <span>[VIEW]</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Terminal Footer Bar */}
      <div className="p-3.5 bg-slate-900/95 border-t border-emerald-950/80 px-5 flex items-center justify-between gap-3 text-xs sm:text-sm text-slate-300 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-400 font-bold">[ONLINE]</span>
          <span>총 <strong>{projects.length}</strong>개 아키텍처 레코드 렌더링 완료</span>
        </div>
        <div className="text-slate-400 text-xs flex items-center gap-2">
          <span>HINT: 각 행을 클릭하면 Archify 상세 다이어그램 팝업</span>
          <span className="text-emerald-400 font-bold text-sm">█</span>
        </div>
      </div>
    </div>
  );
}
