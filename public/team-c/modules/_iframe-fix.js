(function(){
  // Only act when this page is loaded inside the Unified-Dashboard shell's iframe
  if (window.self === window.top) return;
  function hideOwnSidebar(){
    var sb = document.querySelector('.app-sidebar, aside.sidebar');
    if (sb) sb.style.display = 'none';
    var topbar = document.querySelector('.app-topbar, header.topbar');
    if (topbar) topbar.style.display = 'none';
    // Some module pages position their sidebar as fixed and offset the
    // content area with margin-left / width instead of flexbox. Hiding
    // the sidebar alone then leaves an empty gap, so reset that offset too.
    var main = document.querySelector('.app-main, .main');
    if (main) {
      main.style.marginLeft = '0';
      main.style.width = '100%';
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideOwnSidebar);
  } else {
    hideOwnSidebar();
  }
})();

