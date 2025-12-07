# BuildX MegaMenu Navigation Reference

This document captures the complete architecture and implementation details of the BuildX project's MegaMenu left navigation system. Use this as a reference for implementing a similar navigation in PeakOne AI.

---

## Overview

BuildX uses a **flyout megamenu navigation** system that consists of:
1. A narrow left sidebar showing mode icons/labels
2. A flyout panel that appears on hover, showing the sub-navigation items for that mode
3. Color-coded themes for each mode
4. AI insights displayed at the bottom of the flyout

---

## File Structure

```
src/
├── components/layout/
│   ├── megamenu-nav.tsx      # Main megamenu component (549 lines)
│   ├── sidebar.tsx           # Alternative sidebar navigation
│   ├── app-shell.tsx         # Shell that switches between nav styles
│   └── ...
├── config/
│   └── navigation.ts         # Navigation configuration (APP_MODES, NAVIGATION)
├── stores/
│   └── app-store.ts          # Zustand store with navStyle state
└── types/
    └── index.ts              # TypeScript types (AppMode, NavigationItem)
```

---

## Key Types

### AppMode (string union)
```typescript
export type AppMode =
  | 'my-work'
  | 'sell'
  | 'build'
  | 'bill'
  | 'accounting'
  | 'analyze'
  | 'warehouse'
  | 'hr'
  | 'digital-presence'
  | 'admin'
  | 'productivity'
```

### NavigationItem
```typescript
export interface NavigationItem {
  id: string
  label: string
  icon: string           // String name mapped to lucide-react icon
  href: string
  mode: AppMode
  description?: string
  children?: NavigationItem[]
  badge?: string | number
}
```

### NavStyle
```typescript
export type NavStyle = 'sidebar' | 'wheel' | 'dock' | 'megamenu'
```

---

## Navigation Configuration

### APP_MODES Array
Defines the top-level navigation modes (categories):

```typescript
export const APP_MODES: { id: AppMode; label: string; icon: string; description: string }[] = [
  {
    id: 'my-work',
    label: 'Jobs',
    icon: 'CheckSquare',           // lucide-react icon name
    description: 'Your AI-prioritized action queue'
  },
  {
    id: 'sell',
    label: 'Sell',
    icon: 'Target',
    description: 'Pipeline, leads, contacts, proposals'
  },
  // ... more modes
]
```

### NAVIGATION Record
Maps each mode to its sub-navigation items:

```typescript
export const NAVIGATION: Record<AppMode, NavigationItem[]> = {
  'my-work': [
    {
      id: 'my-work-queue',
      label: 'Action Queue',
      icon: 'ListTodo',
      href: '/my-work',
      mode: 'my-work',
      description: 'AI-prioritized tasks for today'
    },
    // ... more items
  ],
  sell: [
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: 'Kanban',
      href: '/pipeline',
      mode: 'sell',
      description: 'Universal deal & job pipeline'
    },
    // ... more items
  ],
  // ... more modes
}
```

---

## MegaMenu Component Architecture

### Icon Mapping
Icons are mapped from string names to actual components:

```typescript
const ICON_MAP: Record<string, React.ElementType> = {
  CheckSquare,
  Target,
  Hammer,
  DollarSign,
  BarChart3,
  Globe,
  Settings,
  // ... 60+ icons
}
```

### Color Themes
Each mode has its own color theme with multiple variants:

```typescript
const MODE_COLORS: Record<AppMode, {
  bg: string           // Background color
  border: string       // Border color
  borderActive: string // Active state border (highlighted)
  icon: string         // Icon color
  activeBg: string     // Active background
  glassBg: string      // Glass/translucent background for footer
}> = {
  'my-work': {
    bg: 'bg-violet-50 dark:bg-violet-900/40',
    border: 'border-violet-200 dark:border-violet-700',
    borderActive: 'border-violet-500',
    icon: 'text-violet-600 dark:text-violet-400',
    activeBg: 'bg-violet-100 dark:bg-violet-800/60',
    glassBg: 'bg-violet-500/10 dark:bg-violet-400/10'
  },
  'sell': {
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    border: 'border-emerald-200 dark:border-emerald-700',
    borderActive: 'border-emerald-500',
    icon: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-100 dark:bg-emerald-800/60',
    glassBg: 'bg-emerald-500/10 dark:bg-emerald-400/10'
  },
  // ... more modes with colors:
  // build: orange
  // bill: blue
  // accounting: teal
  // analyze: cyan
  // warehouse: amber
  // hr: rose
  // digital-presence: pink
  // admin: slate
  // productivity: indigo
}
```

### AI Insights
Each mode displays an AI insight in the flyout footer:

```typescript
const AI_INSIGHTS: Record<AppMode, {
  icon: React.ElementType;
  text: string;
  count?: number
}> = {
  'my-work': { icon: AlertCircle, text: '5 high-priority tasks for today', count: 5 },
  'sell': { icon: Target, text: '3 leads need follow-up', count: 3 },
  'build': { icon: Calendar, text: '2 jobs scheduled today', count: 2 },
  // ...
}
```

---

## Component Structure

### Main Layout (MegaMenuNav)
```tsx
<div className="relative flex h-full">
  {/* Left Sidebar - always visible */}
  <aside className="relative flex h-full w-52 flex-col bg-primary dark:bg-slate-900">
    {/* Logo */}
    <div className="flex h-14 items-center gap-3 px-4 border-b">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
        <Building2 className="h-5 w-5 text-primary" />
      </div>
      <span className="text-sm font-semibold text-primary-foreground">BuildX</span>
    </div>

    {/* Mode List */}
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-0.5 p-2">
        {APP_MODES.map((mode) => (
          <button
            onMouseEnter={() => handleModeEnter(mode.id)}
            className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg"
          >
            {/* Mode Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2">
              <ModeIcon className="h-4 w-4" />
            </div>
            {/* Mode Label */}
            <span className="text-sm font-medium">{mode.label}</span>
            {/* Active indicator bar */}
            {hasActiveChild && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white" />
            )}
          </button>
        ))}
      </div>
    </ScrollArea>

    {/* AI Copilot Button */}
    <div className="border-t p-3">
      <Button className="w-full justify-start gap-3">
        <Sparkles className="h-4 w-4" />
        <span>AI Copilot</span>
      </Button>
    </div>
  </aside>

  {/* Flyout Panel - appears on hover */}
  <AnimatePresence>
    {hoveredMode && (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        className="absolute left-52 top-0 h-full w-80 z-50"
      >
        {/* Flyout content... */}
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### Flyout Panel Structure
```tsx
<div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r shadow-xl">
  {/* Header with mode icon and description */}
  <div className="border-b p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border-2">
        <ModeIcon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold">{mode.label}</h3>
        <p className="text-xs text-slate-500">{mode.description}</p>
      </div>
    </div>
  </div>

  {/* Navigation Links */}
  <ScrollArea className="flex-1">
    <div className="p-2 space-y-0.5">
      {modeNav.map((item) => (
        <Link
          href={item.href}
          onClick={handleNavItemClick}
          className="group flex items-center gap-3 rounded-lg p-2.5 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <ItemIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{item.label}</div>
            {item.description && (
              <div className="text-[11px] text-slate-500">{item.description}</div>
            )}
          </div>
          {item.badge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  </ScrollArea>

  {/* AI Insight Footer */}
  <div className="border-t p-3">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2">
        <InsightIcon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-medium uppercase tracking-wide">AI Insight</div>
        <div className="text-sm font-medium">{insight.text}</div>
      </div>
      {insight.count && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
          {insight.count}
        </div>
      )}
    </div>
  </div>
</div>
```

---

## Hover Logic

The megamenu uses careful mouse tracking to prevent flickering:

```typescript
const [hoveredMode, setHoveredMode] = React.useState<AppMode | null>(null)
const [isOverFlyout, setIsOverFlyout] = React.useState(false)
const [isOverSidebar, setIsOverSidebar] = React.useState(false)
const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

const clearLeaveTimeout = () => {
  if (leaveTimeoutRef.current) {
    clearTimeout(leaveTimeoutRef.current)
    leaveTimeoutRef.current = null
  }
}

const handleModeEnter = (modeId: AppMode) => {
  clearLeaveTimeout()
  setHoveredMode(modeId)
  setIsOverSidebar(true)
}

const handleSidebarLeave = () => {
  setIsOverSidebar(false)
  // Delay closing to allow mouse to move to flyout
  leaveTimeoutRef.current = setTimeout(() => {
    if (!isOverFlyout) {
      setHoveredMode(null)
    }
  }, 150)
}

const handleFlyoutEnter = () => {
  clearLeaveTimeout()
  setIsOverFlyout(true)
}

const handleFlyoutLeave = () => {
  setIsOverFlyout(false)
  // Delay closing to allow mouse to move back to sidebar
  leaveTimeoutRef.current = setTimeout(() => {
    if (!isOverSidebar) {
      setHoveredMode(null)
    }
  }, 150)
}

const handleNavItemClick = () => {
  setHoveredMode(null)
  setIsOverFlyout(false)
  setIsOverSidebar(false)
}
```

---

## Active State Detection

The component checks if any child routes are active:

```typescript
const hasActiveChild = modeNav.some(
  item => pathname === item.href || pathname.startsWith(item.href + '/')
)
const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
```

---

## Zustand Store (app-store.ts)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NavStyle = 'sidebar' | 'wheel' | 'dock' | 'megamenu'

interface AppState {
  navStyle: NavStyle
  setNavStyle: (style: NavStyle) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  copilotOpen: boolean
  toggleCopilot: () => void
  // ... other state
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      navStyle: 'sidebar',  // Default nav style
      setNavStyle: (style) => set({ navStyle: style }),
      // ...
    }),
    {
      name: 'buildx-app-state',
      partialize: (state) => ({
        navStyle: state.navStyle,
        sidebarCollapsed: state.sidebarCollapsed,
        copilotOpen: state.copilotOpen,
      }),
    }
  )
)
```

---

## App Shell Integration

The AppShell component conditionally renders the navigation based on `navStyle`:

```tsx
export function AppShell({ children }: AppShellProps) {
  const { navStyle } = useAppStore()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar Nav */}
      {navStyle === "sidebar" && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Megamenu Nav */}
      {navStyle === "megamenu" && (
        <div className="hidden md:block">
          <MegaMenuNav />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
```

---

## Animation Details

Uses Framer Motion for smooth flyout animations:

```typescript
// Flyout entrance/exit
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -10 }}
transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
```

---

## Styling Dimensions

- **Sidebar width**: `w-52` (208px)
- **Flyout width**: `w-80` (320px)
- **Logo area height**: `h-14` (56px)
- **Mode icon size**: `h-9 w-9` (36px)
- **Nav item icon size**: `h-8 w-8` (32px)
- **AI insight icon size**: `h-9 w-9` (36px)

---

## Dependencies

- `framer-motion` - for animations (AnimatePresence, motion)
- `lucide-react` - for icons
- `zustand` - for state management
- `@radix-ui/react-scroll-area` - for scrollable areas (via shadcn/ui)
- `next/navigation` - for usePathname
- `next/link` - for navigation links

---

## Key Implementation Notes

1. **Conditional Rendering**: The megamenu only renders when `navStyle === 'megamenu'`
2. **Responsive**: Hidden on mobile (`hidden md:block`)
3. **Dark Mode Support**: All colors have dark mode variants
4. **Accessibility**: Uses semantic HTML and proper focus states
5. **Performance**: Uses React.memo patterns and efficient re-renders
6. **Persistence**: Navigation style is persisted to localStorage via Zustand

---

## Recommended Adaptations for PeakOne AI

1. **Simplify modes**: PeakOne may not need 11 modes - consider consolidating
2. **Adjust colors**: Use PeakOne's brand colors instead of BuildX's palette
3. **AI Insights**: Replace with PeakOne-specific AI insights or remove if not needed
4. **Mobile nav**: The megamenu is desktop-only - ensure mobile nav is handled separately
5. **Copilot integration**: Adapt the AI Copilot button to PeakOne's Lisa assistant
