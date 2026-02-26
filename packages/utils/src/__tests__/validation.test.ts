import { describe, it, expect } from 'vitest'
import { isGitHubUrl, isGitLabUrl, isValidRepoUrl, isValidEmail } from '../index'

describe('isGitHubUrl', () => {
  it('应该正确识别有效的 GitHub URL', () => {
    expect(isGitHubUrl('https://github.com/owner/repo')).toBe(true)
    expect(isGitHubUrl('https://www.github.com/owner/repo')).toBe(true)
    expect(isGitHubUrl('http://github.com/owner/repo')).toBe(true)
    expect(isGitHubUrl('http://www.github.com/owner/repo')).toBe(true)
    expect(isGitHubUrl('https://github.com/owner/repo/')).toBe(true)
  })

  it('应该拒绝无效的 GitHub URL', () => {
    expect(isGitHubUrl('https://gitlab.com/owner/repo')).toBe(false)
    expect(isGitHubUrl('https://github.com/owner')).toBe(false)
    expect(isGitHubUrl('github.com/owner/repo')).toBe(false)
    expect(isGitHubUrl('')).toBe(false)
    expect(isGitHubUrl('not-a-url')).toBe(false)
  })
})

describe('isGitLabUrl', () => {
  it('应该正确识别有效的 GitLab URL', () => {
    expect(isGitLabUrl('https://gitlab.com/owner/repo')).toBe(true)
    expect(isGitLabUrl('https://www.gitlab.com/owner/repo')).toBe(true)
    expect(isGitLabUrl('http://gitlab.com/owner/repo')).toBe(true)
    expect(isGitLabUrl('http://www.gitlab.com/owner/repo')).toBe(true)
    expect(isGitLabUrl('https://gitlab.com/owner/repo/')).toBe(true)
  })

  it('应该拒绝无效的 GitLab URL', () => {
    expect(isGitLabUrl('https://github.com/owner/repo')).toBe(false)
    expect(isGitLabUrl('https://gitlab.com/owner')).toBe(false)
    expect(isGitLabUrl('gitlab.com/owner/repo')).toBe(false)
    expect(isGitLabUrl('')).toBe(false)
    expect(isGitLabUrl('not-a-url')).toBe(false)
  })
})

describe('isValidRepoUrl', () => {
  it('应该接受 GitHub 和 GitLab URL', () => {
    expect(isValidRepoUrl('https://github.com/owner/repo')).toBe(true)
    expect(isValidRepoUrl('https://gitlab.com/owner/repo')).toBe(true)
    expect(isValidRepoUrl('https://www.github.com/owner/repo')).toBe(true)
    expect(isValidRepoUrl('https://www.gitlab.com/owner/repo')).toBe(true)
  })

  it('应该拒绝无效的 URL', () => {
    expect(isValidRepoUrl('https://bitbucket.org/owner/repo')).toBe(false)
    expect(isValidRepoUrl('https://github.com/owner')).toBe(false)
    expect(isValidRepoUrl('')).toBe(false)
    expect(isValidRepoUrl('not-a-url')).toBe(false)
    expect(isValidRepoUrl('https://github.com')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('应该正确识别有效的邮箱地址', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('应该拒绝无效的邮箱地址', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('test @example.com')).toBe(false)
  })
})