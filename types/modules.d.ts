declare module 'framer-motion' {
  export interface MotionProps {
    initial?: any
    animate?: any
    exit?: any
    transition?: any
  }

  export interface MotionDivProps extends MotionProps {
    className?: string
    children?: React.ReactNode
  }

  export const motion: {
    div: React.FC<MotionDivProps>
  }
}

declare module 'lucide-react' {
  export const TrendingUp: React.FC<{ className?: string }>
  export const TrendingDown: React.FC<{ className?: string }>
  export const Minus: React.FC<{ className?: string }>
  export const AlertTriangle: React.FC<{ className?: string }>
  export const Heart: React.FC<{ className?: string }>
  export const Activity: React.FC<{ className?: string }>
  export const Brain: React.FC<{ className?: string }>
  export const Shield: React.FC<{ className?: string }>
  export const Info: React.FC<{ className?: string }>
  export const CheckCircle: React.FC<{ className?: string }>
  export const XCircle: React.FC<{ className?: string }>
  export const Pill: React.FC<{ className?: string }>
  export const Download: React.FC<{ className?: string }>
  export const RotateCcw: React.FC<{ className?: string }>
  export const Menu: React.FC<{ className?: string }>
  export const Calendar: React.FC<{ className?: string }>
  export const Upload: React.FC<{ className?: string }>
  export const Bell: React.FC<{ className?: string }>
  export const BarChart3: React.FC<{ className?: string }>
} 