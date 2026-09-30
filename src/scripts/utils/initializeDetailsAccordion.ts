export type AccordionOptions = {
  duration?: number;
  easing?: string;
  printAll?: boolean;
};

const defaultOptions: AccordionOptions = {
  duration: 300,
  easing: 'ease-in-out',
  printAll: false,
};

const initializeDetailsAccordion = (details: HTMLDetailsElement, options: AccordionOptions = {}): void => {
  if (!details) {
    console.error('initializeDetailsAccordion: Details element is not found.');
    return;
  }

  const summary = details.querySelector('summary') as HTMLElement;
  const panel = details.querySelector('summary + *') as HTMLElement;

  if (!summary || !panel) {
    console.error('initializeDetailsAccordion: Elements required for initializeDetailsAccordion are not found.');
    return;
  }

  const mergedOptions = { ...defaultOptions, ...options };
  const detailsName = details.getAttribute('name') || null;

  summary.addEventListener(
    'click',
    (event: MouseEvent) => handleClick(event, details, panel, mergedOptions, detailsName),
    false
  );

  if (mergedOptions.printAll) {
    window.addEventListener('beforeprint', () => handleBeforePrint(details, detailsName));
    window.addEventListener('afterprint', () => handleAfterPrint(details, detailsName));
  }
};

let isAnimating: boolean = false;

const toggleAccordion = (
  details: HTMLDetailsElement,
  panel: HTMLElement,
  options: AccordionOptions,
  detailsName: string | null,
  show: boolean
): void => {
  if (details.open === show) return;

  isAnimating = true;
  if (detailsName) details.removeAttribute('name');
  if (show) details.open = true;
  if (!show) {
    details.classList.add('is-closing');
  }
  panel.style.overflow = 'clip';

  const { blockSize } = window.getComputedStyle(panel);
  const keyframes = show
    ? [{ maxBlockSize: '0' }, { maxBlockSize: blockSize }]
    : [{ maxBlockSize: blockSize }, { maxBlockSize: '0' }];

  const isPrefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animationOptions: AccordionOptions = {
    duration: isPrefersReduced ? 0 : Math.max(0, options.duration || 0),
    easing: options.easing,
  };

  const onAnimationEnd = () => {
    requestAnimationFrame(() => {
      panel.style.overflow = '';
      if (!show) details.open = false;
      if (detailsName) details.setAttribute('name', detailsName);
      details.classList.remove('is-closing');
      isAnimating = false;
    });
  };

  requestAnimationFrame(() => {
    const animation = panel.animate(keyframes, animationOptions);

    animation.addEventListener('finish', onAnimationEnd);
  });
};

const hideOtherAccordions = (
  details: HTMLDetailsElement,
  options: AccordionOptions,
  detailsName: string | null
): void => {
  if (!detailsName) return;

  const otherDetails = document.querySelector(`details[name="${detailsName}"][open]`) as HTMLDetailsElement;
  if (!otherDetails || otherDetails === details) return;

  const otherPanel = otherDetails.querySelector('summary + *') as HTMLElement;
  if (!otherPanel) return;

  toggleAccordion(otherDetails, otherPanel, options, detailsName, false);
};

const handleClick = (
  event: MouseEvent,
  details: HTMLDetailsElement,
  panel: HTMLElement,
  options: AccordionOptions,
  detailsName: string | null
): void => {
  event.preventDefault();

  if (isAnimating) return;

  toggleAccordion(details, panel, options, detailsName, !details.open);

  if (details.open) hideOtherAccordions(details, options, detailsName);
};

const openStatusAttribute = 'data-open-status';

const handleBeforePrint = (details: HTMLDetailsElement, detailsName: string | null): void => {
  if (!details) return;
  details.setAttribute(openStatusAttribute, String(details.open));
  if (detailsName) details.removeAttribute('name');
  details.open = true;
};

const handleAfterPrint = (details: HTMLDetailsElement, detailsName: string | null): void => {
  if (!details) return;
  if (detailsName) details.setAttribute('name', detailsName);
  details.open = details.getAttribute(openStatusAttribute) === 'true';
  details.removeAttribute(openStatusAttribute);
};

export default initializeDetailsAccordion;
