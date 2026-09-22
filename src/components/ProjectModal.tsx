"use client";

import { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  Layers,
  CheckCircle2,
  Cpu,
  BookOpen,
  Sparkles,
  Share2,
  Check,
} from "lucide-react";
import type { Project } from "./PortfolioView";
import { CURATED_PROJECT_DETAILS, getProjectArchitecture } from "@/data/projectDetails";
import ArchitectureVisualizer from "./ArchitectureVisualizer";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const curated = CURATED_PROJECT_DETAILS[project.name] || null;
  const archSteps = getProjectArchitecture(
    project.name,
    project.language,
    project.topics,
    project.homepage
  );

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}/#${project.name}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto flex flex-col text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-5 sm:p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {project.featured && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured
                </span>
              )}
              {project.language && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {project.language}
                </span>
              )}
              {curated?.role && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-950/70 text-blue-300 border border-blue-800/50">
                  {curated.role}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-all">
              {project.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300"
                  : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title="프로젝트 고유 링크 복사"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">공유</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Overview Section */}
          <section className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> 프로젝트 개요 (Overview)
            </h3>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {curated?.overview || project.description}
            </p>
          </section>

          {/* Archify Section (Architecture Diagram) */}
          <section>
            <ArchitectureVisualizer steps={archSteps} />
          </section>

          {/* Tech Stack Section */}
          <section>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> 기술 스택 (Tech Stack)
            </h3>
            {curated?.techStack ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curated.techStack.map((stack) => (
                  <div
                    key={stack.category}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80"
                  >
                    <span className="text-xs font-medium text-slate-400 block mb-1.5">
                      {stack.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {stack.items.map((item) => (
                        <span
                          key={item}
                          className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-200 border border-indigo-800/40"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {project.language && (
                  <span className="text-xs font-medium px-3 py-1 rounded-lg bg-indigo-950/70 text-indigo-200 border border-indigo-800/50">
                    {project.language}
                  </span>
                )}
                {project.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    #{topic}
                  </span>
                ))}
                {!project.language && project.topics.length === 0 && (
                  <span className="text-xs text-slate-500">지정된 태그가 없습니다.</span>
                )}
              </div>
            )}
          </section>

          {/* Architecture Highlights Section */}
          {(curated?.architecture || curated?.highlights) && (
            <section>
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 주요 설계 및 해결 과제 (Highlights)
              </h3>
              <div className="space-y-2.5">
                {curated.architecture?.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-sm text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
                {curated.highlights?.map((point, index) => (
                  <div
                    key={`hl-${index}`}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-sm text-slate-300"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repository Meta Info */}
          <section className="pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                <span className="text-slate-400 block mb-1">저장소 유형</span>
                <span className="font-semibold text-sm text-emerald-400 flex items-center justify-center">
                  Public Open Source
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                <span className="text-slate-400 block mb-1">주요 스택</span>
                <span className="font-semibold text-sm text-indigo-300 flex items-center justify-center">
                  {project.language || "Multi-stack"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                <span className="text-slate-400 block mb-1">최근 Push</span>
                <span className="font-semibold text-slate-200">
                  {new Date(project.pushedAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60">
                <span className="text-slate-400 block mb-1">최초 생성</span>
                <span className="font-semibold text-slate-200">
                  {new Date(project.createdAt).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer (Action Buttons) */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 sm:p-5 flex items-center justify-end gap-3">
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              <ExternalLink className="w-4 h-4" /> Live Demo 방문
            </a>
          )}
          <a
            href={project.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
          >
            <GithubIcon className="w-4 h-4" /> GitHub 저장소 열기
          </a>
        </div>
      </div>
    </div>
  );
}
