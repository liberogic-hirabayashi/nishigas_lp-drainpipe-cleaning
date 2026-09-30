import { initializeLoading } from '@/scripts/features/loading';
import { initializeScrollEvent } from '@/scripts/features/scrollEvent';
import { initializeScrollInview } from '@/scripts/features/scrollInview';
import { initializeSmoothScroll } from '@/scripts/features/smoothScroll';

const USE_VIEW_TRANSITIONS = false;

// ページロード前に実行
function initializeEarlyFeatures() {
  initializeLoading();
}

// DOM構築後に実行
function initializeAllFeatures() {
  initializeScrollEvent();
  initializeScrollInview();
  initializeSmoothScroll();
}

initializeEarlyFeatures();

if (USE_VIEW_TRANSITIONS) {
  // ViewTransition使用時
  document.addEventListener('astro:page-load', initializeAllFeatures);
} else {
  // ViewTransition不使用時
  document.addEventListener('DOMContentLoaded', initializeAllFeatures);
}
