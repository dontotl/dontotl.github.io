"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  ExternalLink,
  Sparkles,
  Calendar,
  Layers,
  Code2,
  RefreshCw,
  ArrowUpRight,
  Terminal,
  LayoutGrid,
  Pin,
  RotateCcw,
  Check,
  Share2,
} from "lucide-react";
import ProjectModal from "./ProjectModal";
import RetroTerminalView from "./RetroTerminalView";
import { CURATED_PROJECT_DETAILS } from "@/data/projectDetails";

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

export interface Project {
  id: number;
  name: string;
  fullName: string;
  description: string;
  htmlUrl: string;
  homepage: string | null;
  language: string;
  topics: string[];
  stars: number;
  forks: number;
  isFork: boolean;
  isPrivate: boolean;
  isArchived: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}

export interface PortfolioData {
  updatedAt: string;
  username: string;
  totalCount: number;
  projects: Project[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500 text-white",
  JavaScript: "bg-amber-400 text-slate-900",
  Python: "bg-sky-500 text-white",
  HTML: "bg-orange-500 text-white",
  CSS: "bg-purple-500 text-white",
  Java: "bg-amber-600 text-white",
  Go: "bg-cyan-500 text-white",
  Rust: "bg-orange-700 text-white",
  Shell: "bg-emerald-600 text-white",
  "Jupyter Notebook": "bg-amber-600 text-white",
  PLSQL: "bg-rose-600 text-white",
  Other: "bg-slate-600 text-slate-200",
};

const DEFAULT_FEATURED: string[] = [
  "how-to-use-OCI",
  "genai-benchmark",
  "workplace-toolkit",
  "ai-lecture-environment",
  "MSA-k8s-cicd",
];

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

export default function PortfolioView({ data }: { data: PortfolioData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<"terminal" | "cards">("terminal");
  const [pinnedRepos, setPinnedRepos] = useState<string[]>(DEFAULT_FEATURED);
  const [copiedFeatured, setCopiedFeatured] = useState(false);

  // Fork된 저장소는 제외 (단, how-to-use-OCI 등 예외 허용 프로젝트 포함)
  const originalProjects = useMemo(() => {
    return data.projects.filter((p) => !p.isFork || p.name === "how-to-use-OCI");
  }, [data.projects]);

  // Load pinned repos from URL search param or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const featuredParam = params.get("featured");
      if (featuredParam) {
        const list = featuredParam.split(",").map((s) => s.trim()).filter(Boolean);
        if (list.length > 0) {
          setPinnedRepos(list);
          return;
        }
      }
      const saved = localStorage.getItem("dontotl_featured_repos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPinnedRepos(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const togglePin = useCallback((repoName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPinnedRepos((prev) => {
      const next = prev.includes(repoName)
        ? prev.filter((name) => name !== repoName)
        : [...prev, repoName];
      try {
        localStorage.setItem("dontotl_featured_repos", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const resetFeatured = useCallback(() => {
    setPinnedRepos(DEFAULT_FEATURED);
    try {
      localStorage.removeItem("dontotl_featured_repos");
    } catch {
      // ignore
    }
  }, []);

  const copyCustomFeaturedLink = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("featured", pinnedRepos.join(","));
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedFeatured(true);
      setTimeout(() => setCopiedFeatured(false), 2000);
    });
  }, [pinnedRepos]);

  // URL Hash Deep Linking
  const handleSelectProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
    if (typeof window !== "undefined") {
      if (project) {
        window.history.replaceState(null, "", `#${project.name}`);
      } else {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (hash) {
        const match = originalProjects.find(
          (p) => p.name.toLowerCase() === hash.toLowerCase()
        );
        if (match) {
          setSelectedProject(match);
        }
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [originalProjects]);

  // 언어 목록 추출
  const languages = useMemo(() => {
    const langs = new Set<string>();
    originalProjects.forEach((p) => {
      if (p.language) langs.add(p.language);
    });
    return ["All", ...Array.from(langs).sort()];
  }, [originalProjects]);

  // 필터링 및 정렬
  const filteredProjects = useMemo(() => {
    return originalProjects
      .filter((project) => {
        const curated = CURATED_PROJECT_DETAILS[project.name];
        const searchTarget = `${project.name} ${curated?.overview || project.description} ${curated?.role || ""} ${project.topics.join(" ")} ${curated?.techStack?.map((t) => t.items.join(" ")).join(" ") || ""}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedLanguage !== "All" && project.language !== selectedLanguage) {
          return false;
        }

        if (showFeaturedOnly && !pinnedRepos.includes(project.name)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "recent") {
          return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
        }
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [originalProjects, searchQuery, selectedLanguage, showFeaturedOnly, sortBy, pinnedRepos]);

  const featuredProjects = useMemo(() => {
    return originalProjects.filter((p) => pinnedRepos.includes(p.name));
  }, [originalProjects, pinnedRepos]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      {/* Background Accent Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center font-mono font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
              d
            </div>
            <div>
              <a href={`https://github.com/${data.username}`} target="_blank" rel="noreferrer" className="font-bold font-mono text-lg text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-2">
                <span>dontotl.systems</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-sans font-medium">Architecture</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CI/CD Auto-Sync Active</span>
            </div>
            <a
              href={`https://github.com/${data.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors text-slate-200 text-xs font-medium"
            >
              <GithubIcon className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub Profile</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/50 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Autonomous AI & Cloud-Native Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 mb-6 leading-tight">
          Building Autonomous AI &<br className="hidden sm:inline" /> Cloud-Native Systems
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-8 font-normal">
          데이터베이스 코어부터 클라우드 인프라, 자율형 AI 에이전트까지 —<br className="hidden sm:inline" />
          시스템의 시작과 끝을 설계하고 코드로 증명합니다.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>총 <strong>{originalProjects.length}</strong>개 시스템 아카이브</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span><strong>{languages.length - 1}</strong>개 핵심 기술 스택</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>실시간 자동 동기화: {new Date(data.updatedAt).toLocaleDateString("ko-KR")}</span>
          </div>
        </div>
      </section>

      {/* Featured Projects Highlight (if any) */}
      {featuredProjects.length > 0 && !searchQuery && selectedLanguage === "All" && (
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">Featured Projects</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                {featuredProjects.length}개 대표작
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={copyCustomFeaturedLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="현재 지정된 대표작 목록 링크를 클립보드에 복사합니다"
              >
                {copiedFeatured ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">링크 복사됨!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>맞춤 링크 복사</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetFeatured}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="기본 5개 시그니처 대표작으로 초기화합니다"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>기본값 리셋</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((project) => {
              const curated = CURATED_PROJECT_DETAILS[project.name];
              const overview = curated?.overview || project.description;
              const role = curated?.role;
              const topTechs = curated?.techStack
                ? curated.techStack.flatMap((s) => s.items).slice(0, 4)
                : project.topics.slice(0, 4);

              return (
                <div
                  key={project.id}
                  id={`repo-${project.name}`}
                  onClick={() => handleSelectProject(project)}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900/80 border border-indigo-500/30 hover:border-indigo-500/70 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          ★ Featured
                        </span>
                        {role && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 border border-blue-800/40">
                            {role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => togglePin(project.name, e)}
                          title="대표작(Featured) 해제"
                          className="p-1.5 rounded-lg bg-indigo-900/70 hover:bg-indigo-800 text-indigo-300 border border-indigo-700/50 transition-colors"
                        >
                          <Pin className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                        </button>
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> {timeAgo(project.pushedAt)}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">
                      {overview}
                    </p>
                  </div>

                  <div>
                    {topTechs.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {topTechs.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50"
                          >
                            {tech.startsWith("#") ? tech : `#${tech}`}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-indigo-500/20 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            LANGUAGE_COLORS[project.language] || LANGUAGE_COLORS.Other
                          }`}
                        >
                          {project.language}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          업데이트 {timeAgo(project.pushedAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProject(project);
                          }}
                          className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-700/50 transition-colors font-medium cursor-pointer"
                        >
                          상세 보기 <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        {project.homepage && (
                          <a
                            href={project.homepage}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-600/20"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                        <a
                          href={project.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          <GithubIcon className="w-3.5 h-3.5" /> Code
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Filter & Grid Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex-1 w-full pb-20">
        {/* Controls Bar */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl mb-8 space-y-4 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="프로젝트, 기술, 키워드 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Sort & Quick Toggles */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* View Mode Toggle */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("terminal")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    viewMode === "terminal"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                      : "text-slate-400 hover:text-emerald-300"
                  }`}
                  title="레트로 터미널 매트릭스 뷰"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-300" />
                  <span>터미널 뷰</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "cards"
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="모던 카드 그리드 뷰"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>카드 뷰</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={`text-xs px-3 py-2 rounded-xl border transition-all font-medium flex items-center gap-1.5 ${
                  showFeaturedOnly
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Featured만
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "name")}
                className="text-xs px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="recent">최근 업데이트순</option>
                <option value="name">이름 가나다순</option>
              </select>
            </div>
          </div>

          {/* Language Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`text-xs px-3 py-1 rounded-lg transition-all ${
                  selectedLanguage === lang
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-semibold"
                    : "bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/50"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <span>
            총 <strong>{filteredProjects.length}</strong>개의 프로젝트 (카드를 클릭하여 상세 정보 보기)
          </span>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedLanguage("All");
                setShowFeaturedOnly(false);
              }}
              className="text-indigo-400 hover:underline"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Projects Display (Terminal Matrix or Grid Cards) */}
        {viewMode === "terminal" ? (
          <RetroTerminalView
            projects={filteredProjects}
            onSelectProject={handleSelectProject}
            searchQuery={searchQuery}
            pinnedRepos={pinnedRepos}
            onTogglePin={togglePin}
          />
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
            <p className="text-slate-400 text-sm">일치하는 프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const curated = CURATED_PROJECT_DETAILS[project.name];
              const overview = curated?.overview || project.description;
              const role = curated?.role;
              const topTechs = curated?.techStack
                ? curated.techStack.flatMap((s) => s.items).slice(0, 3)
                : project.topics.slice(0, 3);
              const isPinned = pinnedRepos.includes(project.name);

              return (
                <div
                  key={project.id}
                  id={`repo-${project.name}`}
                  onClick={() => handleSelectProject(project)}
                  className="group relative p-5 rounded-xl bg-slate-900/50 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-950/50 cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            LANGUAGE_COLORS[project.language] || LANGUAGE_COLORS.Other
                          }`}
                        >
                          {project.language}
                        </span>
                        {role && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 line-clamp-1 max-w-[160px]">
                            {role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => togglePin(project.name, e)}
                          title={isPinned ? "대표작(Featured) 해제" : "대표작(Featured) 지정"}
                          className={`p-1 rounded-md transition-colors ${
                            isPinned
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/60"
                          }`}
                        >
                          <Pin className={`w-3 h-3 ${isPinned ? "fill-indigo-400 text-indigo-400" : ""}`} />
                        </button>
                        <span>{timeAgo(project.pushedAt)}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 transition-colors mb-2 break-all">
                      {project.name}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                      {overview}
                    </p>
                  </div>

                  <div>
                    {topTechs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {topTechs.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-800"
                          >
                            {tech.startsWith("#") ? tech : `#${tech}`}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <span>업데이트 {timeAgo(project.pushedAt)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProject(project);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-700/50 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                        >
                          상세 보기 <ArrowUpRight className="w-3 h-3" />
                        </button>
                        {project.homepage && (
                          <a
                            href={project.homepage}
                            target="_blank"
                            rel="noreferrer"
                            title="Live Demo"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={project.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="GitHub Repository"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => handleSelectProject(null)}
      />

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p className="mb-2">
          © {new Date().getFullYear()} <strong>dontotl.systems</strong>. Hosted on GitHub Pages.
        </p>
        <p className="text-slate-600">
          Powered by Next.js & GitHub Actions · Automatically synced with GitHub Repositories.
        </p>
      </footer>
    </div>
  );
}
