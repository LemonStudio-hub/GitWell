/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
declare module '@gitwell/ui' {
  import { DefineComponent } from 'vue'
  const MetricCard: DefineComponent
  const HealthBadge: DefineComponent
  const RepoCard: DefineComponent
  const RepoInput: DefineComponent
  export { MetricCard, HealthBadge, RepoCard, RepoInput }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}