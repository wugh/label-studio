/**
 * Performs a transition on an element
 * @param {HTMLElement} element
 * @param {Function} transition
 * @param {{
 * init: (element: HTMLElement) => void,
 * transition: (element: HTMLElement) => void,
 * onStart: (element: HTMLElement) => void,
 * beforeTransition: (element: HTMLElement) => void,
 * afterTransition: (element: HTMLElement) => void
 * }} param2
 */
const aroundTransition = (element, {init, transition, onStart, beforeTransition, afterTransition} = {}) => {
  init?.(element);

  const onTransitionStarted = () => {
    onStart?.(element);
  }

  const onTransitionEnded = () => {
    afterTransition?.(element);

    element.removeEventListener('transitionstart', onTransitionStarted);
    element.removeEventListener('transitionend', onTransitionEnded);
  }

  element.addEventListener('transitionstart', onTransitionStarted);
  element.addEventListener('transitionend', onTransitionEnded);

  beforeTransition?.();

  setTimeout(() => transition(element), 50);
}

/**
 *
 * @param {HTMLElement} element
 * @param {string} selector
 */
const matchesSelector = (element, selector) => {
  if (element?.matches?.(selector)) return true
  if (element?.closest?.(selector)) true
  return false
}

const attachMenu = (triggerSelector, {trigger = 'click'} = {}) => {
  /**
   * @param {HTMLElement} menu
   */
  const toggleMenu = (menu) => {
    const classState = {
      beforeAppear: 'menu-dropdown-before-appear',
      appear: 'menu-dropdown-appear',
      beforeDisappear: 'menu-dropdown-before-disappear',
      disappear: 'menu-dropdown-disappear',
    }
    const classVisible = 'menu-dropdown-visible';
    const isHidden = !menu.classList.contains(classVisible);

    aroundTransition(menu, {
      transition() {
        menu.classList.add(isHidden ? classState.appear : classState.disappear);
      },
      beforeTransition() {
        menu.classList.add(isHidden ? classState.beforeAppear : classState.beforeDisappear);
      },
      afterTransition() {
        menu.classList.remove(...Object.values(classState));
        menu.classList[isHidden ? 'add' : 'remove'](classVisible);
      }
    });
  }

  document.addEventListener(trigger, (e) => {
    if (matchesSelector(e.target, triggerSelector)) {
      /** @type {HTMLElement} */
      const triggeringElement = e.target;

      const menuSelector = triggeringElement.dataset?.menu;
      const menuDropdown = menuSelector
        ? document.querySelector(menuSelector)
        : triggeringElement.querySelector('.menu-dropdown');

      console.assert(!!menuDropdown, "Menu dropdown is not attached");

      toggleMenu(menuDropdown);
    }
  }, {capture: true});
}

// Main menu
attachMenu('.main-menu-trigger');

// Project menu
attachMenu('.project-menu');
