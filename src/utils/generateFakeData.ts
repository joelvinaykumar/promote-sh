import { WorkEntry } from '../App'

const TASK_TEMPLATES = {
  bug: [
    'Fixed authentication redirect issue',
    'Resolved memory leak in data fetching',
    'Fixed broken CSS on mobile devices',
    'Debugged race condition in API calls',
    'Patched security vulnerability in login',
    'Fixed null pointer exception in user profile',
    'Resolved infinite loop in pagination',
    'Fixed CORS errors on production',
    'Debugged WebSocket connection drops',
    'Fixed date formatting bug',
    'Resolved database connection timeout',
    'Fixed broken image upload'
  ],
  feature: [
    'Implemented dark mode toggle',
    'Added export to CSV functionality',
    'Built new dashboard analytics',
    'Created user profile customization',
    'Implemented real-time notifications',
    'Added drag and drop file upload',
    'Built search with filters',
    'Implemented pagination for lists',
    'Added social login with Google',
    'Created admin dashboard',
    'Implemented multi-language support',
    'Built email notification system'
  ],
  review: [
    'Code review for PR #234',
    'Reviewed API endpoint changes',
    'PR review: refactor auth module',
    'Reviewed database schema updates',
    'Code review for new feature branch',
    'Reviewed UI component library updates',
    'PR feedback on payment integration',
    'Reviewed security patches',
    'Code review for mobile responsive fixes',
    'Reviewed test coverage improvements'
  ],
  meeting: [
    'Sprint planning meeting',
    'Daily standup',
    'Product roadmap discussion',
    'Architecture review session',
    'Client demo and feedback',
    'Retrospective meeting',
    'Tech debt planning',
    '1-on-1 with manager',
    'Design system sync',
    'API integration planning',
    'Security audit review',
    'Performance optimization brainstorm'
  ],
  debt: [
    'Refactored legacy authentication code',
    'Updated dependencies to latest versions',
    'Removed deprecated API endpoints',
    'Optimized database queries',
    'Cleaned up unused components',
    'Improved error handling',
    'Added missing TypeScript types',
    'Refactored Redux store structure',
    'Optimized bundle size',
    'Consolidated duplicate utilities',
    'Improved test coverage',
    'Updated outdated documentation'
  ],
  docs: [
    'Updated API documentation',
    'Wrote onboarding guide for new devs',
    'Documented deployment process',
    'Created component usage examples',
    'Updated README with new features',
    'Wrote architecture decision record',
    'Documented database schema',
    'Created troubleshooting guide',
    'Updated contributing guidelines',
    'Wrote release notes',
    'Documented testing procedures',
    'Created API integration guide'
  ]
}

const TAG_POOLS = {
  bug: ['hotfix', 'critical', 'frontend', 'backend', 'production', 'regression'],
  feature: ['enhancement', 'ui', 'api', 'dashboard', 'user-experience', 'integration'],
  review: ['pull-request', 'code-quality', 'security', 'refactor', 'testing'],
  meeting: ['planning', 'team', 'stakeholder', 'sync', 'retrospective'],
  debt: ['refactor', 'optimization', 'cleanup', 'technical-debt', 'performance'],
  docs: ['documentation', 'guide', 'readme', 'onboarding', 'architecture']
}

const TIME_OPTIONS = [30, 60, 90, 120, 180, 240]

function getRandomItem<T>(array: T[] | readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomItems<T>(array: T[] | readonly T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function generateFakeData(daysBack: number = 60): WorkEntry[] {
  const entries: WorkEntry[] = []
  const today = new Date()

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Skip some days randomly (20% chance) to make it more realistic
    if (Math.random() < 0.2) continue

    // Generate 2-3 entries per day
    const entriesPerDay = Math.random() < 0.5 ? 2 : 3

    for (let j = 0; j < entriesPerDay; j++) {
      // Pick a random category
      const categories = ['bug', 'feature', 'review', 'meeting', 'debt', 'docs'] as const
      const category = getRandomItem(categories)

      // Get a task from that category
      const title = getRandomItem(TASK_TEMPLATES[category])

      // Get 1-3 tags
      const tagCount = Math.floor(Math.random() * 3) + 1
      const tags = getRandomItems(TAG_POOLS[category], tagCount)

      // Random time
      const timeSpent = getRandomItem(TIME_OPTIONS)

      // Add some randomness to the time within the day
      const entryDate = new Date(date)
      entryDate.setHours(9 + j * 3, Math.floor(Math.random() * 60), 0, 0)

      // Random project
      const projectIds = ['internal', 'acme', 'migration']
      const projectId = getRandomItem(projectIds)

      entries.push({
        id: `fake-${i}-${j}-${Date.now()}-${Math.random()}`,
        title,
        category,
        projectId,
        timeSpent,
        tags,
        priority: getRandomItem(['low', 'medium', 'high'] as const),
        description: Math.random() < 0.3 ? `Additional details about ${title.toLowerCase()}` : undefined,
        date: entryDate.toISOString(),
        createdAt: entryDate.getTime()
      })
    }
  }

  // Sort by createdAt descending (newest first)
  return entries.sort((a, b) => b.createdAt - a.createdAt)
}
