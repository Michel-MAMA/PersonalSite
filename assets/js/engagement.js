import { request } from './api.js';
export function initEngagement() {
  const engagementBlocks = [...document.querySelectorAll('[data-blog-engagement]')];
  if (engagementBlocks.length) {
    const apiUrl = 'blog-engagement';
    let visitorId;
    try {
      visitorId = localStorage.getItem('site-blog-visitor-id');
      if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem('site-blog-visitor-id', visitorId); }
    } catch { visitorId = crypto.randomUUID(); }

    engagementBlocks.forEach((block) => {
      const slug = block.dataset.articleSlug;
      const likeButton = block.querySelector('[data-like-button]');
      const likeCount = block.querySelector('[data-like-count]');
      const commentsList = block.querySelector('[data-comment-list]');
      const commentsCount = block.querySelector('[data-comment-count]');
      const form = block.querySelector('[data-comment-form]');
      const status = block.querySelector('[data-engagement-status]');
      if (slug === 'slug-a-remplacer') { block.hidden = true; return; }
      const announce = (message, kind = '') => {
        if (!status) return;
        status.textContent = message;
        status.classList.remove('error', 'success');
        if (kind) status.classList.add(kind);
      };
      const renderComments = (comments) => {
        if (!commentsList || !commentsCount) return;
        commentsList.replaceChildren();
        commentsCount.textContent = `(${comments.length})`;
        if (!comments.length) {
          const empty = document.createElement('li');
          empty.className = 'comment-empty';
          empty.textContent = 'Aucun commentaire publié. Soyez le premier à réagir.';
          commentsList.append(empty);
          return;
        }
        comments.forEach((comment) => {
          const item = document.createElement('li');
          item.className = 'comment-item';
          const author = document.createElement('strong');
          author.textContent = comment.author_name;
          const body = document.createElement('p');
          body.textContent = comment.body;
          item.append(author, body);
          commentsList.append(item);
        });
      };
      const refresh = async () => {
        const data = await request(`${apiUrl}?slug=${encodeURIComponent(slug)}&visitorId=${encodeURIComponent(visitorId)}`);
        if (likeCount) likeCount.textContent = String(data.likes);
        likeButton?.setAttribute('aria-pressed', String(data.liked));
        if (likeButton) likeButton.querySelector('span').textContent = data.liked ? '♥' : '♡';
        renderComments(data.comments);
      };
      refresh().catch(() => announce('Les réactions seront disponibles dès que le service du blog sera activé.', 'error'));
      likeButton?.addEventListener('click', async () => {
        likeButton.disabled = true;
        const liked = likeButton.getAttribute('aria-pressed') !== 'true';
        try {
          const result = await request(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'like', slug, visitorId, liked }) });
          if (likeCount) likeCount.textContent = String(result.likes);
          likeButton.setAttribute('aria-pressed', String(result.liked));
          likeButton.querySelector('span').textContent = result.liked ? '♥' : '♡';
        } catch (error) { announce(error.message, 'error'); }
        finally { likeButton.disabled = false; }
      });
      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submit = form.querySelector('[type="submit"]');
        const data = new FormData(form);
        submit.disabled = true;
        try {
          await request(apiUrl, { method: 'POST', body: JSON.stringify({ action: 'comment', slug, visitorId, name: data.get('name'), body: data.get('body'), website: data.get('website') }) });
          form.reset();
          announce('Merci ! Votre commentaire sera visible après validation.', 'success');
        } catch (error) { announce(error.message, 'error'); }
        finally { submit.disabled = false; }
      });
    });
  }
}
