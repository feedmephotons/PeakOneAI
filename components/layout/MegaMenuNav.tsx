"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  FolderKanban,
  Cloud,
  Plug,
  BarChart3,
  Settings,
  Home,
  Activity,
  Bell,
  MessageCircle,
  Phone,
  Video,
  Users,
  History,
  Bot,
  Monitor,
  Wand2,
  Brain,
  FileText,
  FileSearch,
  CheckSquare,
  BookOpen,
  ListTodo,
  Kanban,
  Calendar,
  GanttChart,
  FolderOpen,
  Image as ImageIcon,
  Share2,
  Clock,
  Mail,
  Store,
  TrendingUp,
  PieChart,
  FileBarChart,
  User,
  CreditCard,
  Shield,
  Building2,
  Zap,
  HardDrive,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"
import { APP_MODES, NAVIGATION, MODE_COLORS, AI_INSIGHTS, type AppMode } from "@/config/navigation"

// Map string icon names to actual icon components
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  FolderKanban,
  Cloud,
  Plug,
  BarChart3,
  Settings,
  Home,
  Activity,
  Bell,
  MessageCircle,
  Phone,
  Video,
  Users,
  History,
  Bot,
  Monitor,
  Wand2,
  Brain,
  FileText,
  FileSearch,
  CheckSquare,
  BookOpen,
  ListTodo,
  Kanban,
  Calendar,
  GanttChart,
  FolderOpen,
  Image: ImageIcon,
  Share2,
  Clock,
  Mail,
  Store,
  TrendingUp,
  PieChart,
  FileBarChart,
  User,
  CreditCard,
  Shield,
  Building2,
  Zap,
  HardDrive,
}

interface MegaMenuNavProps {
  className?: string
}

export function MegaMenuNav({ className }: MegaMenuNavProps) {
  const pathname = usePathname()
  const { navStyle, toggleCopilot } = useAppStore()
  const [hoveredMode, setHoveredMode] = React.useState<AppMode | null>(null)
  const [isOverFlyout, setIsOverFlyout] = React.useState(false)
  const [isOverSidebar, setIsOverSidebar] = React.useState(false)
  const leaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Only render if navStyle is 'megamenu'
  if (navStyle !== 'megamenu') {
    return null
  }

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

  return (
    <div className="relative flex h-full">
      {/* Sidebar */}
      <aside
        onMouseLeave={handleSidebarLeave}
        className={cn(
          "relative flex h-full w-52 flex-col bg-gradient-to-b from-indigo-600 to-indigo-700 dark:from-slate-900 dark:to-slate-800 border-r border-indigo-500/20 dark:border-slate-700",
          className
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 px-4 border-b border-white/10 dark:border-slate-700">
          <Image
            src="/peakone-logo.png"
            alt="PeakOne AI"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-semibold text-white text-lg">Peak One AI</span>
        </div>

        {/* Mode List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
          <div className="flex flex-col gap-0.5 p-2">
            {APP_MODES.map((mode) => {
              const ModeIcon = ICON_MAP[mode.icon] || LayoutDashboard
              const modeNav = NAVIGATION[mode.id] || []
              const colors = MODE_COLORS[mode.id]
              const hasActiveChild = modeNav.some(
                item => pathname === item.href || pathname.startsWith(item.href + '/')
              )
              const isHovered = hoveredMode === mode.id

              return (
                <button
                  key={mode.id}
                  onMouseEnter={() => handleModeEnter(mode.id)}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                    "text-left w-full",
                    isHovered && "bg-white/15 dark:bg-slate-800",
                    !isHovered && "hover:bg-white/10 dark:hover:bg-slate-800/50"
                  )}
                >
                  {/* Icon with colored border when active */}
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-all duration-150",
                    "border-2",
                    hasActiveChild
                      ? `bg-white dark:bg-transparent ${colors.borderActive} ${colors.icon}`
                      : "bg-white/90 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  )}>
                    <ModeIcon className="h-4 w-4" />
                  </div>

                  {/* Label */}
                  <span className={cn(
                    "text-sm font-medium transition-colors truncate",
                    hasActiveChild ? "text-white dark:text-white" : "text-white/70 dark:text-slate-400 group-hover:text-white dark:group-hover:text-slate-200"
                  )}>
                    {mode.label}
                  </span>

                  {/* Active indicator bar */}
                  {hasActiveChild && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white dark:bg-indigo-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* AI Copilot */}
        <div className="border-t border-white/10 dark:border-slate-700 p-3">
          <button
            onClick={() => toggleCopilot()}
            className="w-full flex items-center justify-start gap-3 h-11 px-3 rounded-lg bg-white/15 hover:bg-white/25 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 border border-white/20 dark:border-violet-500/20 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-white dark:text-violet-400" />
            <span className="text-sm font-medium text-white dark:text-violet-300">Chat with Lisa</span>
          </button>
        </div>
      </aside>

      {/* Flyout Megamenu */}
      <AnimatePresence>
        {hoveredMode && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
            onMouseEnter={handleFlyoutEnter}
            onMouseLeave={handleFlyoutLeave}
            className="absolute left-52 top-0 h-full w-80 z-50"
          >
            {(() => {
              const mode = APP_MODES.find(m => m.id === hoveredMode)
              if (!mode) return null

              const ModeIcon = ICON_MAP[mode.icon] || LayoutDashboard
              const modeNav = NAVIGATION[hoveredMode] || []
              const colors = MODE_COLORS[hoveredMode]
              const insight = AI_INSIGHTS[hoveredMode]
              const InsightIcon = ICON_MAP[insight.icon] || Zap

              return (
                <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl">
                  {/* Header */}
                  <div className={cn("border-b p-4", "border-slate-200 dark:border-slate-700")}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-lg border-2",
                        colors.borderActive,
                        "bg-transparent"
                      )}>
                        <ModeIcon className={cn("h-5 w-5", colors.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{mode.label}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {mode.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="p-2 space-y-0.5">
                      {modeNav.map((item) => {
                        const ItemIcon = ICON_MAP[item.icon] || LayoutDashboard
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={handleNavItemClick}
                            className={cn(
                              "group flex items-center gap-3 rounded-lg p-2.5 transition-all duration-150",
                              "hover:scale-[1.01] active:scale-[0.99]",
                              isActive
                                ? `${colors.activeBg}`
                                : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                            )}
                          >
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-all",
                              "group-hover:scale-105",
                              isActive
                                ? `border-2 ${colors.borderActive} bg-transparent`
                                : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            )}>
                              <ItemIcon className={cn(
                                "h-4 w-4",
                                isActive ? colors.icon : "text-slate-500 dark:text-slate-400"
                              )} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-sm font-medium",
                                isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                              )}>
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {item.badge && (
                              <span className={cn(
                                "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                                colors.activeBg,
                                colors.icon
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* AI Insight Footer */}
                  <div className={cn(
                    "border-t p-3",
                    "border-slate-200 dark:border-slate-700",
                    colors.glassBg
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg shrink-0 border-2",
                        colors.borderActive,
                        "bg-transparent"
                      )}>
                        <InsightIcon className={cn("h-4 w-4", colors.icon)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          AI Insight
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {insight.text}
                        </div>
                      </div>
                      {insight.count !== undefined && (
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          colors.activeBg,
                          colors.icon
                        )}>
                          {insight.count}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MegaMenuNav
