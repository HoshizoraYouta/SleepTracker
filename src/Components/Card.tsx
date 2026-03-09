import { ReactNode } from 'react'

interface CardProps {
  title?: string
  icon?: string
  children?: ReactNode
  style?: React.CSSProperties
  className?: string
}

export default function Card({ title, icon, children, style, className }: CardProps) {
  return (
    <div className={`card ${className ?? ''}`} style={style}>
      {title && (
        <div className="card-title">
          {icon && <span>{icon}</span>}
          {title}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}