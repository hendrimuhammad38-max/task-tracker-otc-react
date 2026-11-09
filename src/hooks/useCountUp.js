import { useState, useEffect, useRef } from 'react';

export function useCountUp(endVal, duration = 800, decimals = 0) {
  const [count, setCount] = useState(0);
  const prevVal = useRef(0);

  useEffect(() => {
    const to = Number(endVal) || 0;
    const from = prevVal.current;
    if (from === to) return;

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic: 1 - Math.pow(1 - progress, 3)
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * ease;

      setCount(Number(current.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        prevVal.current = to;
      }
    };

    requestAnimationFrame(step);
  }, [endVal, duration, decimals]);

  return count.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
