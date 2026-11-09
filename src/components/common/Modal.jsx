import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconClass = '',
  children,
  footer,
  size = '',
  dismissible = true
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e) => {
        if (e.key === 'Escape' && dismissible) onClose();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [isOpen, dismissible, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" onClick={dismissible ? onClose : undefined}>
          <motion.div
            className={`modal ${size}`}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" />

            {title && (
              <div className="modal-head">
                {Icon && (
                  <span className={`ic-tile ${iconClass}`}>
                    <Icon size={18} />
                  </span>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3>{title}</h3>
                  {subtitle && <p>{subtitle}</p>}
                </div>
                {dismissible && (
                  <button
                    type="button"
                    className="btn-icon sm"
                    onClick={onClose}
                    aria-label="Tutup"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-foot">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
