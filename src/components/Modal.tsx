'use client'

import { useEffect, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'error' | 'warning' | 'success' | 'info'
  showCloseButton?: boolean
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'error',
  showCloseButton = true 
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible && !isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle'
      case 'warning':
        return 'fas fa-exclamation-triangle'
      case 'info':
        return 'fas fa-info-circle'
      default:
        return 'fas fa-exclamation-circle'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'var(--success)'
      case 'warning':
        return 'var(--warning)'
      case 'info':
        return 'var(--primary)'
      default:
        return 'var(--error)'
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className={`modal-backdrop ${isOpen ? 'modal-enter' : 'modal-exit'}`}
      onClick={handleBackdropClick}
    >
      <div className={`modal-container ${isOpen ? 'modal-enter-active' : 'modal-exit-active'}`}>
        <div className="modal-header">
          <div className="modal-icon" style={{ color: getColor() }}>
            <i className={getIcon()}></i>
          </div>
          <h3 className="modal-title">{title}</h3>
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-button"
            onClick={onClose}
            style={{ 
              background: `linear-gradient(135deg, ${getColor()}, ${getColor()}99)` 
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}