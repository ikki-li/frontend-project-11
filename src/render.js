const isVisited = (list, item) => list.includes(item);

export default (elements, initialState, i18nInstance) => (path, value, previousValue) => {
  const {
    formEl, inputEl, submitEl, feedbackEl, postsContainerEl, feedsContainerEl,
  } = elements;

  if (initialState.processState === 'processing') {
    submitEl.disabled = true;
  }

  if (initialState.processState === 'filling') {
    submitEl.disabled = false;
  }

  if (path === 'uiState.modal.visitedPostsId') {
    initialState.uiState.modal.visitedPostsId.forEach((visitedPostId) => {
      const postEl = document.querySelector(`[data-id="${visitedPostId}"]`);
      if (!postEl.classList.contains(visitedPostId)) {
        postEl.classList.replace('fw-bold', 'fw-normal');
        postEl.classList.add('link-secondary');
      }
    });
    return;
  }

  if (initialState.uiState.modal.active.name !== null) {
    const modalTitleEl = document.querySelector('.modal-title');
    const modalBodyEl = document.querySelector('.modal-body');
    const modalLinkEl = document.querySelector('.modal-footer a');
    const { name, description, link } = initialState.uiState.modal.active;
    modalTitleEl.textContent = name;
    modalBodyEl.textContent = description;
    modalLinkEl.href = link;
    initialState.uiState.modal.active = {
      name: null,
      description: null,
      link: null,
    };
    return;
  }
  if (initialState.form.valid === false) {
    inputEl.classList.remove('is-valid');
    inputEl.classList.add('is-invalid');
    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
    feedbackEl.textContent = initialState.form.errors;
    return;
  }

  if (initialState.processState === 'processed') {
    inputEl.classList.remove('is-invalid');
    feedbackEl.classList.remove('text-danger');
    feedbackEl.classList.add('text-success');
    feedbackEl.textContent = i18nInstance.t('feedback.success_loading');
    formEl.reset();
    inputEl.focus();
    submitEl.disabled = false;
    const { posts, feeds } = initialState.data;
    postsContainerEl.innerHTML = '';
    feedsContainerEl.innerHTML = '';
    const cardFeedsEl = document.createElement('div');
    feedsContainerEl.append(cardFeedsEl);
    cardFeedsEl.outerHTML = `
    <div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">${i18nInstance.t('content.feeds.title')}</h2>
      </div>
      <ul class="list-group border-0 rounded-0">
        ${feeds.map((feed) => `
          <li class="list-group-item border-0 border-end-0">
            <h3 class="h6 m-0">${feed.name}</h3> 
            <p class="m-0 small text-black-50">${feed.description}</p>
          </li>`).join('')}
      </ul>
    </div>`.replace(/(\s|\n)/, '');
    const cardPostsEl = document.createElement('div');
    cardPostsEl.classList.add('card', 'border-0');
    postsContainerEl.append(cardPostsEl);
    cardPostsEl.innerHTML = `
    <div class="card-body">
      <h2 class="card-title h4">${i18nInstance.t('content.posts.title')}</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
      ${posts.map((post) => `
        <li class="list-group-item border-0 border-end-0 d-flex justify-content-between">
          <a href="${post.link}" class="${isVisited(initialState.uiState.modal.visitedPostsId, post.id) ? 'fw-normal link-secondary' : 'fw-bold'}" rel="external" data-id=${post.id}>${post.name}</a>
          <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal" data-id=${post.id}>${i18nInstance.t('content.posts.button')}</button>
        </li>`).join('')}
    </ul>`.replace(/(\s|\n)/, '');
  }

  if (initialState.processState === 'failed') {
    submitEl.disabled = false;
    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
    feedbackEl.textContent = initialState.processErrors;
  }
};
