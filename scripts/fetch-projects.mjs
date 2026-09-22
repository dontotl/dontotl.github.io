import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const USERNAME = "dontotl";
let TOKEN = process.env.GITHUB_TOKEN || "";
if (!TOKEN) {
  try {
    TOKEN = execSync("gh auth token", { encoding: "utf-8" }).trim();
  } catch {
    // ignore
  }
}

// 포트폴리오에 우선 노출하거나 강조할 프로젝트 목록 (원하는 대로 커스텀 가능)
const FEATURED_REPOS = [
  "how-to-use-OCI",
  "genai-benchmark",
  "workplace-toolkit",
  "ai-lecture-environment",
  "MSA-k8s-cicd",
];

// Fork 저장소 중 예외적으로 포트폴리오에 포함할 저장소
const ALLOWED_FORK_REPOS = ["how-to-use-OCI"];

// 포트폴리오에서 제외하고 싶은 레포지토리 (필요 시 추가)
const IGNORED_REPOS = ["dontotl.github.io"];

async function fetchAllRepos() {
  console.log(`Fetching repositories for ${USERNAME}...`);
  const headers = {
    "User-Agent": "dontotl-portfolio-sync",
    Accept: "application/vnd.github.v3+json",
  };
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  let repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}&sort=pushed`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`GitHub API error on page ${page}: ${res.status} ${res.statusText}`);
      break;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    repos.push(...data);
    if (data.length < 100) break;
    page++;
  }

  console.log(`Total repos fetched from GitHub API: ${repos.length}`);

  // 데이터 정제 및 가공 (Fork된 레포지토리는 기본 제외하되, ALLOWED_FORK_REPOS는 예외 허용)
  const processed = repos
    .filter((repo) => {
      if (IGNORED_REPOS.includes(repo.name)) return false;
      if (repo.fork && !ALLOWED_FORK_REPOS.includes(repo.name)) return false;
      return true;
    })
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || "No description provided.",
      htmlUrl: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language || "Other",
      topics: repo.topics || [],
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isFork: repo.fork,
      isPrivate: repo.private,
      isArchived: repo.archived,
      featured: FEATURED_REPOS.includes(repo.name),
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
    }))
    .sort((a, b) => {
      // 1. Featured 우선
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // 2. 최근 Push 일시 기준 내림차순
      return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
    });

  const outputDir = join(process.cwd(), "src/data");
  mkdirSync(outputDir, { recursive: true });

  const payload = {
    updatedAt: new Date().toISOString(),
    username: USERNAME,
    totalCount: processed.length,
    projects: processed,
  };

  const outputPath = join(outputDir, "projects.json");
  writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Saved ${processed.length} projects to ${outputPath}`);
}

fetchAllRepos().catch((err) => {
  console.error("Error fetching repos:", err);
  process.exit(1);
});
