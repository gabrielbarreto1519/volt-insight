import { useEffect, useRef } from 'react';
import fitty from 'fitty';

interface UseFittyOptions {
  minSize?: number;
  maxSize?: number;
  multiLine?: boolean;
}

export function useFitty({
  minSize = 12,
  maxSize = 44,
  multiLine = false
}: UseFittyOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Reset font-size to prevent accumulation
    element.style.fontSize = '';

    // Apply base styles for consistent behavior
    element.style.whiteSpace = 'nowrap';
    element.style.lineHeight = '1.1';
    element.style.overflow = 'hidden';
    element.style.transition = 'font-size 120ms ease-out';

    // Initialize fitty
    const fittyInstance = fitty(element, {
      minSize,
      maxSize,
      multiLine,
      observeMutations: {
        subtree: true,
        characterData: true,
        childList: true
      }
    });

    // Handle edge case: if text doesn't fit even at minSize, increase container height
    const checkAndAdjustContainer = () => {
      setTimeout(() => {
        if (element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) {
          const card = element.closest('.kpi-card, .risk-distribution-kpi');
          if (card) {
            const currentHeight = card.clientHeight;
            const neededHeight = Math.max(currentHeight, element.scrollHeight + 32);
            (card as HTMLElement).style.minHeight = `${neededHeight}px`;
          }
        }
      }, 150); // Wait for fitty to complete
    };

    // Initial check
    checkAndAdjustContainer();

    // Re-check on window resize with debounce
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        fittyInstance.fit();
        checkAndAdjustContainer();
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      fittyInstance.unsubscribe();
    };
  }, [minSize, maxSize, multiLine]);

  return elementRef;
}

// Alias for backward compatibility
export const useAutoFitText = useFitty;