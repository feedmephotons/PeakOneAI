import Image from 'next/image'

export type IconName =
  | 'logo'
  | 'ai'
  | 'home'
  | 'calls'
  | 'meetings'
  | 'tasks'
  | 'files'
  | 'messages'
  | 'calendar'
  | 'settings'

export type IconSize = 16 | 24 | 32 | 64 | 512

interface PeakIconProps {
  name: IconName
  size?: IconSize
  className?: string
  alt?: string
}

const iconPaths: Record<IconName, (size: IconSize) => string> = {
  logo: (size) => {
    if (size >= 512) return '/icons/brand/peak-logo-512.png'
    if (size >= 64) return '/icons/brand/peak-logo-64.png'
    return '/icons/brand/peak-logo-32.png'
  },
  ai: (size) => {
    if (size >= 64) return '/icons/ai/peak-ai-64.png'
    return '/icons/ai/peak-ai-32.png'
  },
  home: () => '/icons/navigation/nav-home-24.png',
  calls: () => '/icons/navigation/nav-calls-24.png',
  meetings: () => '/icons/navigation/nav-meetings-24.png',
  tasks: () => '/icons/navigation/nav-tasks-24.png',
  files: () => '/icons/navigation/nav-files-24.png',
  messages: () => '/icons/navigation/nav-messages-24.png',
  calendar: () => '/icons/navigation/nav-calendar-24.png',
  settings: () => '/icons/navigation/nav-settings-24.png',
}

export function PeakIcon({ name, size = 24, className = '', alt }: PeakIconProps) {
  const iconPath = iconPaths[name](size)
  const defaultAlt = `${name.charAt(0).toUpperCase() + name.slice(1)} icon`

  return (
    <Image
      src={iconPath}
      alt={alt || defaultAlt}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}

// Export default for easier imports
export default PeakIcon
