import React from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

export function AnimatedKpiCard({
  label,
  value,
  unit,
  sub,
  icon: Icon,
  iconClass = '',
  decimals = 0,
  delay = 0
}) {
  const animatedValue = useCountUp(value, 850, decimals);

  return (
    <motion.div
      className="card"
      style={{ padding: '18px', cursor: 'default' }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        boxShadow: '0 14px 28px -10px rgba(18, 48, 80, 0.16)',
        transition: { duration: 0.2 }
      }}
    >
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="small" style={{ fontWeight: 700 }}>{label}</span>
        {Icon && (
          <motion.span
            className={`ic-tile sm ${iconClass}`}
            whileHover={{ rotate: 12, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon size={16} />
          </motion.span>
        )}
      </div>

      <div className="kpi-value mt-1">
        <span>{animatedValue}</span>
        {unit && <small style={{ marginLeft: 6 }}>{unit}</small>}
      </div>

      {sub && <div className="small muted mt-1">{sub}</div>}
    </motion.div>
  );
}
