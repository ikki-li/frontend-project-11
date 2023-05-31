export default (elements, initialState, i18nInstance) => (path, value, previousValue) => {
  const {
    formEl, inputEl, feedbackEl, postsContainerEl, feedsContainerEl,
  } = elements;
  if (initialState.form.valid === false) {
    inputEl.classList.remove('is-valid');
    inputEl.classList.add('is-invalid');
    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
    feedbackEl.textContent = initialState.form.errors;
    return;
  }
  if (initialState.form.valid === true) {
    inputEl.classList.remove('is-invalid');
    feedbackEl.classList.remove('text-danger');
    feedbackEl.classList.add('text-success');
    feedbackEl.textContent = i18nInstance.t('feedback.success_loading');
    formEl.reset();
    inputEl.focus();
  }
  if (initialState.processState === 'processed') {
    const { posts, feeds } = initialState.data;
    postsContainerEl.innerHTML = '';
    feedsContainerEl.innerHTML = '';
    const cardFeedsEl = document.createElement('div');
    feedsContainerEl.append(cardFeedsEl);
    cardFeedsEl.outerHTML = `<div class="card border-0"><div class="card-body"><h2 class="card-title h4">${i18nInstance.t('content.feeds.title')}</h2></div><ul class="list-group border-0 rounded-0">${feeds.map((feed) => `<li class="list-group-item border-0 border-end-0"><h3 class="h6 m-0">${feed.name}</h3><p class="m-0 small text-black-50">${feed.description}</p></li>`).join('')}</ul></div>`;
    const cardPostsEl = document.createElement('div');
    postsContainerEl.append(cardPostsEl);
    cardPostsEl.outerHTML = `<div class="card border-0"><div class="card-body"><h2 class="card-title h4">${i18nInstance.t('content.posts.title')}</h2></div><ul class="list-group border-0 rounded-0">${posts.map((post) => `<li class="list-group-item border-0 border-end-0 d-flex justify-content-between"><a href="${post.link}" class="fw-bold" rel="external">${post.name}</a><button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal">${i18nInstance.t('content.posts.button')}</button></li>`).join('')}</ul></div>`;
  }
  if (initialState.processState === 'failed') {
    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
    feedbackEl.textContent = initialState.processErrors;
  }
  if (path === 'initialState.data.posts') {
    const { posts, feeds } = initialState.data;
    postsContainerEl.innerHTML = '';
    feedsContainerEl.innerHTML = '';
    const cardFeedsEl = document.createElement('div');
    feedsContainerEl.append(cardFeedsEl);
    cardFeedsEl.outerHTML = `<div class="card border-0"><div class="card-body"><h2 class="card-title h4">${i18nInstance.t('content.feeds.title')}</h2></div><ul class="list-group border-0 rounded-0">${feeds.map((feed) => `<li class="list-group-item border-0 border-end-0"><h3 class="h6 m-0">${feed.name}</h3><p class="m-0 small text-black-50">${feed.description}</p></li>`).join('')}</ul></div>`;
    const cardPostsEl = document.createElement('div');
    postsContainerEl.append(cardPostsEl);
    cardPostsEl.outerHTML = `<div class="card border-0"><div class="card-body"><h2 class="card-title h4">${i18nInstance.t('content.posts.title')}</h2></div><ul class="list-group border-0 rounded-0">${posts.map((post) => `<li class="list-group-item border-0 border-end-0 d-flex justify-content-between"><a href="${post.link}" class="fw-bold" rel="external">${post.name}</a><button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modal">${i18nInstance.t('content.posts.button')}</button></li>`).join('')}</ul></div>`;
  }
};
