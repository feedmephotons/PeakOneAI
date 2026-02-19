import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppMode } from '@/config/navigation'

export type NavStyle = 'topnav' | 'sidebar' | 'megamenu'

// Mode-Based UI: Personal / Team / Enterprise
export type UIMode = 'personal' | 'team' | 'enterprise'

interface AppState {
  // Navigation Style
  navStyle: NavStyle
  setNavStyle: (style: NavStyle) => void

  // Current Mode (for megamenu)
  currentMode: AppMode
  setCurrentMode: (mode: AppMode) => void

  // UI Mode (Personal / Team / Enterprise)
  uiMode: UIMode
  setUIMode: (mode: UIMode) => void

  // Sidebar State
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // AI Copilot Panel
  copilotOpen: boolean
  toggleCopilot: () => void
  setCopilotOpen: (open: boolean) => void

  // Command Palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation Style - defaults to top navigation
      navStyle: 'topnav',
      setNavStyle: (style) => set({ navStyle: style }),

      // Current Mode
      currentMode: 'dashboard',
      setCurrentMode: (mode) => set({ currentMode: mode }),

      // UI Mode - defaults to Team
      uiMode: 'team',
      setUIMode: (mode) => set({ uiMode: mode }),

      // Sidebar State
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // AI Copilot Panel
      copilotOpen: false,
      toggleCopilot: () => set((state) => ({ copilotOpen: !state.copilotOpen })),
      setCopilotOpen: (open) => set({ copilotOpen: open }),

      // Command Palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'peakone-app-state',
      partialize: (state) => ({
        navStyle: state.navStyle,
        sidebarCollapsed: state.sidebarCollapsed,
        currentMode: state.currentMode,
        uiMode: state.uiMode,
      }),
    }
  )
)
