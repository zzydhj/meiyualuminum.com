/**
 * menu.js — 移动端全屏菜单交互逻辑
 *
 * JS 只做四件事：
 * 1. 汉堡按钮 / 关闭按钮 → 开关全屏菜单（切 .open 类名）
 * 2. 锁定 / 恢复 body 滚动
 * 3. 互斥手风琴：展开某项时自动收起同级兄弟
 * 4. 点击菜单内链接后自动关闭菜单
 */

const hamburger = document.querySelector('.menu');
const mobileMenu = document.getElementById('mobile-menu');
const closeBtn = document.getElementById('mobile-menu-close');

function openMenu() {
  mobileMenu?.classList.add('open');
  mobileMenu?.setAttribute('aria-hidden', 'false');
  hamburger?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  mobileMenu?.classList.remove('open');
  mobileMenu?.setAttribute('aria-hidden', 'true');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = mobileMenu?.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

closeBtn?.addEventListener('click', closeMenu);

/* ===== 互斥手风琴 =====
   点击 .m-toggle 时：先收起同列表内的兄弟 .m-acc.open，再切换自身。
   父级收起时子级状态保留——再次展开时用户看到之前的浏览位置。 */
mobileMenu?.querySelectorAll('.m-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const item = toggle.closest('.m-acc');
    if (!item) return;

    const parentList = item.parentElement;
    parentList?.querySelectorAll(':scope > .m-acc.open').forEach((sibling) => {
      if (sibling !== item) {
        sibling.classList.remove('open');
        sibling.querySelector(':scope > .m-row > .m-toggle')
          ?.setAttribute('aria-expanded', 'false');
      }
    });

    const willOpen = !item.classList.contains('open');
    item.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });
});

/* 点击菜单内链接后自动关闭（javascript:; 占位链接不触发） */
mobileMenu?.querySelectorAll('.m-link').forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href') || '';
    if (href && href !== '#' && !href.startsWith('javascript:')) {
      closeMenu();
    }
  });
});