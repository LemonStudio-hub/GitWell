/**
 * 导出数据为 JSON 文件
 */
export function exportAsJSON(data: any, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出数据为 CSV 文件
 */
export function exportAsCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return

  const firstRow = data[0]
  if (!firstRow) return

  const headers = Object.keys(firstRow)
  const csvContent = [
    headers.join(','),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导出数据为 Markdown 文件
 */
export function exportAsMarkdown(data: {
  repoData: any
  metrics: any
  healthScore: number
}, filename: string): void {
  const { repoData, metrics, healthScore } = data

  const mdContent = `# ${repoData.name} - 项目健康报告

## 基本信息

- **名称**: ${repoData.name}
- **描述**: ${repoData.description || '暂无描述'}
- **语言**: ${repoData.language}
- **Stars**: ${repoData.stars}
- **Forks**: ${repoData.forks}
- **Watchers**: ${repoData.watchers}
- **创建时间**: ${repoData.createdAt}
- **更新时间**: ${repoData.updatedAt}

## 健康指标

| 指标 | 数值 |
|------|------|
| 总体健康度 | ${healthScore.toFixed(1)}% |
| 提交频率（每周） | ${metrics.commitFrequency.toFixed(1)} |
| 贡献者活跃度 | ${metrics.contributorCount.toFixed(1)} |
| 代码质量 | ${metrics.codeQuality.toFixed(1)}% |
| Issue 解决率 | ${(metrics.issueResolutionRate * 100).toFixed(1)}% |
| PR 合并率 | ${(metrics.prMergeRate * 100).toFixed(1)}% |
| 平均响应时间 | ${metrics.responseTime.toFixed(1)} 小时 |

## 健康评估

${getHealthAssessment(healthScore)}

---

*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*生成工具: GitWell*
`

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getHealthAssessment(score: number): string {
  if (score >= 80) {
    return '🟢 **优秀** - 项目健康度良好，维护活跃。'
  } else if (score >= 60) {
    return '🟡 **良好** - 项目整体健康，但有改进空间。'
  } else if (score >= 40) {
    return '🟠 **一般** - 项目健康度一般，需要关注。'
  } else {
    return '🔴 **需改进** - 项目健康度较低，建议优先处理。'
  }
}

/**
 * 导出数据为 PDF 文件（需要打印功能）
 */
export function exportAsPDF(filename: string): void {
  window.print()
}
