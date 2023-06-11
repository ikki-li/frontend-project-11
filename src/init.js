import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import parse from './parser.js';
import render from './render.js';
import resources from './locales/index.js';

const validate = (data, urls) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(urls);
  return schema.validate(data, { abortEarly: false });
};

const getPath = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${url}`)}`;

const fetch = (url, state, i18nInstance) => axios
  .get(getPath(url))
  .then((response) => parse(response.data.contents))
  .then((parsedRss) => {
    const feedId = _.uniqueId();
    state.data.feeds.unshift({ ...parsedRss.feed, id: feedId, url });
    state.data.posts.unshift(...parsedRss.posts.map((post) => ({
      ...post, id: _.uniqueId(), feedId,
    })));
    state.processState = 'processed';
  })
  .catch((error) => {
    state.processState = 'failed';
    if (error.message === 'Network Error') {
      state.processErrors = (`${i18nInstance.t('feedback.network_error')}`);
      return;
    }
    state.processErrors = (`${i18nInstance.t('feedback.loading_failed')}`);
  });

const getNewPosts = (data1, data2) => {
  const links = data1.map(({ link }) => link);
  const newPosts = data2.filter(({ link }) => !links.includes(link));
  return newPosts;
};

export default () => {
  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    mixed: {
      notOneOf: ({ url }) => ({ key: 'feedback.existing_rss', values: { url } }),
      required: ({ url }) => ({ key: 'feedback.empty_field', values: { url } }),
    },
    string: {
      url: ({ url }) => ({ key: 'feedback.invalid_url', values: { url } }),
    },
  });

  const elements = {
    formEl: document.querySelector('.rss-form'),
    inputEl: document.querySelector('#url-input'),
    submitEl: document.querySelector('[type="submit"]'),
    feedbackEl: document.querySelector('.feedback'),
    postsContainerEl: document.querySelector('.posts'),
    feedsContainerEl: document.querySelector('.feeds'),
    contentSectionEl: document.querySelector('#content'),
  };

  const initialState = {
    processState: 'filling',
    processErrors: null,
    form: {
      valid: false,
      errors: '',
      fields: {
        urls: [],
      },
    },
    data: {
      posts: [],
      feeds: [],
    },
    uiState: {
      modal: {
        active: {
          name: null,
          description: null,
          link: null,
        },
        visitedPostsId: [],
      },
    },
  };

  const watchedState = onChange(initialState, render(elements, initialState, i18nInstance));

  const makeRegularRequest = (url) => {
    axios.get(getPath(url))
      .then((response) => parse(response.data.contents))
      .then((parsedData) => {
        const newPosts = getNewPosts(initialState.data.posts, parsedData.posts);
        if (newPosts.length !== 0) {
          const feedId = _.filter(initialState.data.feeds, (feed) => feed.url === url)[0].id;
          watchedState.data.posts.unshift(...newPosts.map((post) => ({
            ...post,
            id: _.uniqueId(),
            feedId,
          })));
        }
      })
      .catch(console.log)
      .then(() => setTimeout(() => makeRegularRequest(url), 5000));
  };

  elements.formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newUrl = formData.get('url');
    const { urls } = initialState.form.fields;
    validate(newUrl, urls)
      .then(() => {
        watchedState.processState = 'processing';
        watchedState.form.valid = true;
        watchedState.form.errors = null;
        watchedState.form.fields.urls.push(newUrl);
      })
      .catch((err) => {
        const messages = err.errors.map((e) => i18nInstance.t(e.key)).join('');
        watchedState.form.valid = false;
        watchedState.form.errors = messages;
        watchedState.processState = 'filling';
        throw err;
      })
      .then(() => fetch(newUrl, watchedState, i18nInstance))
      .then(() => makeRegularRequest(newUrl))
      .catch((_.noop));
  });

  elements.contentSectionEl.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (e.target.tagName === 'A') {
      e.preventDefault();
      window.open(e.target.href);
      if (!initialState.uiState.modal.visitedPostsId.includes(id)) {
        watchedState.uiState.modal.visitedPostsId.push(id);
      }
    }
    if (e.target.tagName === 'BUTTON') {
      if (!initialState.uiState.modal.visitedPostsId.includes(id)) {
        watchedState.uiState.modal.visitedPostsId.push(id);
      }
      const visiblePost = initialState.data.posts
        .find((post) => post.id === id);
      watchedState.uiState.modal.active = {
        name: visiblePost.name,
        description: visiblePost.description,
        link: visiblePost.link,
      };
    }
  });
};
