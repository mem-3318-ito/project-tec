const paginations = document.querySelectorAll('[data-component="pagination"]');

paginations.forEach((component) => {
  const previous = component.querySelector('[data-action="previous"]');
  const next = component.querySelector('[data-action="next"]');
  const pageStatus = component.querySelector('[data-role="page-status"]');
  const maxPage = 3;
  let currentPage = 1;

  const render = () => {
    if (pageStatus) {
      pageStatus.textContent = `${currentPage} / ${maxPage} ページ`;
    }
    if (previous) {
      previous.disabled = currentPage === 1;
    }
    if (next) {
      next.disabled = currentPage === maxPage;
    }
  };

  previous?.addEventListener("click", () => {
    currentPage = Math.max(1, currentPage - 1);
    render();
  });

  next?.addEventListener("click", () => {
    currentPage = Math.min(maxPage, currentPage + 1);
    render();
  });
});
