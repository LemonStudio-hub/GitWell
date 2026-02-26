/**
 * 验证 URL 是否为 GitHub 仓库 URL
 */
export function isGitHubUrl(url: string): boolean {
  const githubUrlRegex = /^https?:\/\/(?:www\.)?github\.com\/[^\/]+\/[^\/]+\/?$/i
  return githubUrlRegex.test(url)
}

/**
 * 验证 URL 是否为 GitLab 仓库 URL
 */
export function isGitLabUrl(url: string): boolean {
  const gitlabUrlRegex = /^https?:\/\/(?:www\.)?gitlab\.com\/[^\/]+\/[^\/]+\/?$/i
  return gitlabUrlRegex.test(url)
}

/**
 * 验证 URL 是否为支持的仓库 URL
 */
export function isValidRepoUrl(url: string): boolean {
  return isGitHubUrl(url) || isGitLabUrl(url)
}

/**
 * 验证邮箱地址
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}