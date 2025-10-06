'use client'

import { useState, useRef, ReactNode } from 'react'
import { Trash2, Archive, Star, MoreHorizontal } from 'lucide-react'

interface SwipeAction {
  icon: ReactNode
  label: string
  color: string
  action: () => void
}

interface SwipeableItemProps {
  children: ReactNode
  onDelete?: () => void
  onArchive?: () => void
  onStar?: () => void
  customActions?: SwipeAction[]
}

export default function SwipeableItem({
  children,
  onDelete,
  onArchive,
  onStar,
  customActions
}: SwipeableItemProps) {
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const leftActions: SwipeAction[] = customActions || [
    ...(onArchive ? [{
      icon: <Archive className="w-5 h-5" />,
      label: 'Archive',
      color: 'bg-blue-500',
      action: onArchive
    }] : []),
    ...(onStar ? [{
      icon: <Star className="w-5 h-5" />,
      label: 'Star',
      color: 'bg-yellow-500',
      action: onStar
    }] : [])
  ]

  const rightActions: SwipeAction[] = [
    ...(onDelete ? [{
      icon: <Trash2 className="w-5 h-5" />,
      label: 'Delete',
      color: 'bg-red-500',
      action: onDelete
    }] : [])
  ]

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return

    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current

    // Limit swipe distance
    const maxSwipe = 120
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))

    setSwipeX(limitedDiff)
  }

  const handleTouchEnd = () => {
    setSwiping(false)

    // If swiped far enough, trigger action
    const threshold = 60

    if (swipeX > threshold && leftActions.length > 0) {
      leftActions[0].action()
      setSwipeX(0)
    } else if (swipeX < -threshold && rightActions.length > 0) {
      rightActions[0].action()
      setSwipeX(0)
    } else {
      // Snap back
      setSwipeX(0)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <div className="absolute inset-y-0 left-0 flex">
          {leftActions.map((action, index) => (
            <div
              key={index}
              className={`${action.color} w-20 flex items-center justify-center text-white`}
            >
              {action.icon}
            </div>
          ))}
        </div>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <div className="absolute inset-y-0 right-0 flex">
          {rightActions.map((action, index) => (
            <div
              key={index}
              className={`${action.color} w-20 flex items-center justify-center text-white`}
            >
              {action.icon}
            </div>
          ))}
        </div>
      )}

      {/* Swipeable Content */}
      <div
        className="relative bg-white dark:bg-gray-800 transition-transform touch-pan-y"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
