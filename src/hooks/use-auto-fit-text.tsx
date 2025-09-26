import { useEffect, useRef, useCallback } from 'react';

interface UseAutoFitTextOptions {
  minSize?: number;
  maxSize?: number;
  step?: number;
}

export function useAutoFitText({
  minSize = 12,
  maxSize = 40,
  step = 1
}: UseAutoFitTextOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);

  const fitText = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    const parent = element.parentElement;
    if (!parent) return;

    let fontSize = maxSize;
    element.style.fontSize = `${fontSize}px`;

    // Fit to width
    while (element.scrollWidth > parent.clientWidth && fontSize > minSize) {
      fontSize -= step;
      element.style.fontSize = `${fontSize}px`;
    }

    // Ensure no vertical clipping
    while (element.scrollHeight > parent.clientHeight && fontSize > minSize) {
      fontSize -= step;
      element.style.fontSize = `${fontSize}px`;
    }
  }, [minSize, maxSize, step]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial fit
    fitText();

    // Set up ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver(() => {
      fitText();
    });

    resizeObserver.observe(element);
    if (element.parentElement) {
      resizeObserver.observe(element.parentElement);
    }

    // Set up MutationObserver for content changes
    const mutationObserver = new MutationObserver(() => {
      fitText();
    });

    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [fitText]);

  return elementRef;
}