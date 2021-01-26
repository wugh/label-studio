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

/**
 * @param {HTMLElement} menu
 */
const setMenuState = (menu, {visible} = {}) => {
  const classState = {
    beforeAppear: 'menu-dropdown-before-appear',
    appear: 'menu-dropdown-appear',
    beforeDisappear: 'menu-dropdown-before-disappear',
    disappear: 'menu-dropdown-disappear',
  }
  const classVisible = 'menu-dropdown-visible';
  const currentlyVisible = menu.classList.contains(classVisible);

  if (currentlyVisible === visible) return;

  aroundTransition(menu, {
    transition() {
      menu.classList.add(visible ? classState.appear : classState.disappear);
    },
    beforeTransition() {
      menu.classList.add(visible ? classState.beforeAppear : classState.beforeDisappear);
    },
    afterTransition() {
      menu.classList.remove(...Object.values(classState));
      menu.classList[visible ? 'add' : 'remove'](classVisible);
    }
  });
}

const toggleMenu = (menu) => {
  const classVisible = 'menu-dropdown-visible';
  let currentlyVisible = menu.classList.contains(classVisible);

  setMenuState(menu, { visible: currentlyVisible ? false : true });
}

const attachMenu = (triggerSelector, {trigger = 'mousedown', closeOnClickOutside = true} = {}) => {
  /** @type {HTMLElement} */
  let menuDropdown = null;

  const shoudlCloseOnClickOutside = () => {
    return closeOnClickOutside instanceof Function
      ? closeOnClickOutside()
      : closeOnClickOutside;
  }

  const clickedOutside = (target) => {
    return menuDropdown && !menuDropdown.contains(target);
  }

  document.addEventListener(trigger, (e) => {
    if (matchesSelector(e.target, triggerSelector)) {
      e.preventDefault();
      e.stopPropagation();

      /** @type {HTMLElement} */
      const triggeringElement = e.target;

      const menuSelector = triggeringElement.dataset?.menu;

      menuDropdown = menuSelector
        ? document.querySelector(menuSelector)
        : triggeringElement.querySelector('.menu-dropdown');

      console.assert(!!menuDropdown, "Menu dropdown is not attached");

      toggleMenu(menuDropdown);
    } else if (clickedOutside(e.target) && shoudlCloseOnClickOutside()) {
      setMenuState(menuDropdown, { visible: false });
    }
  }, {capture: true});
}

// Main menu
attachMenu('.main-menu-trigger', {
  closeOnClickOutside: false,
});

// Project menu
attachMenu('.project-menu');

window.addEventListener('resize', (e) => console.log('resize', e));

// Pin/unpin menu sidebar
document.addEventListener('click', (e) => {
  if (matchesSelector(e.target, '.sidebar__pin')) {
    e.preventDefault();

    const sidebar = document.querySelector('.sidebar')

    if (sidebar.classList.contains('sidebar-floating')) {
      sidebar.classList.remove('sidebar-floating');
      localStorage.setItem('sidebar-floating', false);
    } else {
      sidebar.classList.add('sidebar-floating');
      localStorage.setItem('sidebar-floating', true);
    }

    window.dispatchEvent(new Event('resize'));
  }
});

if (localStorage.getItem('sidebar-floating') === 'false') {
  document.querySelector('.sidebar').classList.remove('sidebar-floating');
}
