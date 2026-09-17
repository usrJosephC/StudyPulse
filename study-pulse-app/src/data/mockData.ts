export const currentUser = {
  name: 'Alex',
  initial: 'A',
  since: 'Jan 2026',
  badge: 'Top 5% Scholar',
  streak: 12,
};

export const todaysTasks = [
  { id: '1', title: 'Bio 101 Quiz', category: 'BIOLOGY', done: true },
  { id: '2', title: 'Calc Practice', category: 'MATH', done: false },
  { id: '3', title: 'Library Session', category: 'GENERAL', done: false },
];

export const tasksProgress = {
  done: todaysTasks.filter((t) => t.done).length,
  total: todaysTasks.length,
};

export const homeSquadPreview = {
  rankLabel: 'Top 5%',
  members: [
    { id: 'leo', initial: 'L', rank: 1, isYou: false },
    { id: 'you', initial: 'Y', rank: 2, isYou: true },
    { id: 'alex', initial: 'A', rank: 3, isYou: false },
  ],
};

// intensity: 0 (none) .. 4 (max), used for the consistency heatmap
export const consistencyWeeks: number[][] = [
  [1, 2, 1, 3, 4, 1, 0],
  [1, 3, 4, 1, 2, 3, 1],
  [2, 3, 2, 1, 0, 2, 3],
  [4, 2, 3, 1, 0, 1, 4],
];

export const activeGoals = [
  {
    id: 'chem',
    category: 'Science',
    title: 'Master Organic Chemistry',
    due: 'Due in 3 days',
    progress: 0.75,
    icon: 'flask-outline' as const,
    cta: 'Continue Study',
    ctaVariant: 'primary' as const,
    ctaIcon: 'arrow-forward' as const,
  },
  {
    id: 'reading',
    category: 'Literature',
    title: 'Read 50 Pages',
    due: 'Due tomorrow',
    progress: 0.4,
    icon: 'bookmark-outline' as const,
    cta: 'Log Reading',
    ctaVariant: 'muted' as const,
    ctaIcon: 'create-outline' as const,
  },
];

export const squad = {
  name: 'Alpha Scholars',
  subtitle: 'Top 5% in Global Science Leagues',
  endsIn: '2d',
  podium: [
    { id: 'leo', name: 'Leo', initial: 'L', points: '2.1k pt', rank: 2, streakDays: 12 },
    { id: 'sarah', name: 'Sarah', initial: 'S', points: '3.5k pt', rank: 1, streakDays: 45 },
    { id: 'alex', name: 'Alex', initial: 'A', points: '1.8k pt', rank: 3, streakDays: 8 },
  ],
  rest: [
    { id: 'emma', name: 'Emma', initial: 'E', points: '1,450 pt', rank: 4, streakDays: 5, isYou: false },
    { id: 'you', name: 'You', initial: 'Y', points: '1,200 pt', rank: 5, streakDays: 3, isYou: true },
  ],
};

export const squadActivity = [
  { id: '1', icon: 'flame' as const, message: 'Sarah just hit a 10-day streak! Keep the fire burning!', timeAgo: '2 hours ago' },
  { id: '2', icon: 'book' as const, message: 'Leo finished his Bio 101 Quiz with a perfect score.', timeAgo: '5 hours ago' },
  { id: '3', icon: 'trophy' as const, message: 'Alex earned 500 points in the Math Challenge.', timeAgo: 'Yesterday' },
];

export const profileStats = [
  { id: 'streak', icon: 'flame' as const, value: '12', label: 'Day Streak', tint: '#FCE4E4' },
  { id: 'goals', icon: 'checkmark-circle' as const, value: '27', label: 'Goals Done', tint: '#EAEAEA' },
  { id: 'points', icon: 'star' as const, value: '1,200', label: 'Total Points', tint: '#FDF6D3' },
];

export const profileSettings = [
  { id: 'account', icon: 'person-outline' as const, label: 'Account' },
  { id: 'notifications', icon: 'notifications-outline' as const, label: 'Notifications' },
  { id: 'squad', icon: 'people-outline' as const, label: 'Study Squad' },
];
