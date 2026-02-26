/**
 * GitDash Cron Worker
 * 定时任务：更新缓存的数据
 */

export interface Env {
  GITHUB_TOKEN?: string
  GITLAB_TOKEN?: string
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Cron job started at:', new Date().toISOString())

    try {
      // TODO: 实现定时任务逻辑
      // 1. 从数据库获取需要更新的仓库列表
      // 2. 调用 API 获取最新数据
      // 3. 更新缓存

      console.log('Cron job completed at:', new Date().toISOString())
    } catch (error) {
      console.error('Cron job failed:', error)
    }
  },
}