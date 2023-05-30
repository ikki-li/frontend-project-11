import 'bootstrap';
// eslint-disable-next-line no-unused-vars
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import i18n from 'i18next';
import axios from 'axios';
import parse from './parser.js';
import render from './render.js';
import resources from './locales/index.js';

// const languages = ['en', 'ru'];

export default () => {
  const defaultLanguage = 'en';
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
    feedbackEl: document.querySelector('.feedback'),
    postsContainerEl: document.querySelector('.posts'),
    feedsContainerEl: document.querySelector('.feeds'),
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
  };

  const watchedState = onChange(initialState, render(elements, initialState, i18nInstance));

  const validate = (data, urls) => {
    const schema = yup.string().trim().required().url()
      .notOneOf(urls);
    return schema.validate(data, { abortEarly: false });
  };

  const updateData = (watchState, data) => {
    watchState.processState = 'processing';
    watchState.form.valid = true;
    watchState.form.errors = null;
    watchState.form.fields.urls.push(data);
  };

  elements.formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = formData.get('url');
    const { urls } = initialState.form.fields;
    validate(data, urls)
      .then(() => {
        updateData(watchedState, data);
      }, (err) => {
        const messages = err.errors.map((e) => i18nInstance.t(e.key)).join('');
        watchedState.form.valid = false;
        watchedState.form.errors = messages;
        watchedState.processState = 'filling';
        return Promise.reject(err);
      })
      .then(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(`${data}`)}`))
      .then((response) => parse(response), (networkError) => {
        watchedState.processErrors = i18nInstance.t('feedback.network_error');
        Promise.reject(networkError);
      })
      .then((parsedData) => {
        watchedState.data.posts.unshift(...parsedData.posts);
        watchedState.data.feeds.unshift(parsedData.feed);
        watchedState.processState = 'processed';
      }, (e) => {
        watchedState.processErrors = (`${i18nInstance.t('feedback.loading_failed')}`);
        watchedState.processState = 'failed';
        return Promise.reject(e);
      })
      .catch(_.noop);
  });
};
