export function initBlog() {
  const blogCards = [...document.querySelectorAll('.blog-feature[data-category]')];
  const blogSearch = document.querySelector('#blog-search');
  const blogFilters = [...document.querySelectorAll('.blog-filter')];
  const blogResults = document.querySelector('#blog-results');
  let activeBlogFilter = 'all';
  function filterBlog() {
    if (!blogCards.length) return;
    const query = blogSearch?.value.trim().toLocaleLowerCase('fr') ?? '';
    let shown = 0;
    blogCards.forEach((card) => {
      const matchesCategory = activeBlogFilter === 'all' || card.dataset.category === activeBlogFilter;
      const matchesQuery = (card.dataset.search + ' ' + card.textContent).toLocaleLowerCase('fr').includes(query);
      card.hidden = !(matchesCategory && matchesQuery);
      if (!card.hidden) shown += 1;
    });
    if (blogResults) blogResults.textContent = shown ? `${shown} article${shown > 1 ? 's' : ''} affiché${shown > 1 ? 's' : ''}` : 'Aucun article publié ne correspond à cette recherche pour le moment.';
  }
  blogSearch?.addEventListener('input', filterBlog);
  blogFilters.forEach((button) => button.addEventListener('click', () => {
    activeBlogFilter = button.dataset.filter ?? 'all';
    blogFilters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    filterBlog();
  }));
  filterBlog();


  document.querySelectorAll('[data-share-article]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = document.querySelector('[data-share-status]');
      const shareData = { title: document.title, url: window.location.href };
      try {
        if (navigator.share) await navigator.share(shareData);
        else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareData.url);
          if (status) status.textContent = 'Lien copié.';
        } else if (status) status.textContent = 'Copiez l’adresse de cette page depuis la barre du navigateur.';
      } catch (error) {
        if (error.name !== 'AbortError' && status) status.textContent = 'Le partage n’a pas abouti. Copiez le lien depuis la barre du navigateur.';
      }
    });
  });
}
