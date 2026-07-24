/* Gallery Tab 切换逻辑 */
document.querySelectorAll('.gallery-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    /* 切换按钮高亮 */
    document.querySelectorAll('.gallery-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    /* 切换面板显示 */
    var target = tab.getAttribute('data-tab');
    document.querySelectorAll('.gallery-panel').forEach(function(p) { p.classList.remove('active'); });
    document.querySelector('.gallery-panel[data-panel="' + target + '"]').classList.add('active');
  });
});
