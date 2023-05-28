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
    addingFeedsProcess: {
      state: 'filling',
      valid: false,
      fields: {
        urls: [],
      },
      errors: '',
    },
    loadingProcess: {
      state: '',
      posts: [],
      feeds: [],
      errors: '',
    },
  };

  const watchedState = onChange(initialState, render(elements, initialState, i18nInstance));

  const validate = (data, urls) => {
    const schema = yup.string().trim().required().url()
      .notOneOf(urls);
    return schema.validate(data, { abortEarly: false });
  };

  const updateErrors = (errors, { addingFeedsProcess }) => {
    addingFeedsProcess.valid = false;
    addingFeedsProcess.errors = errors;
    addingFeedsProcess.state = 'filling';
  };

  const updateData = ({ addingFeedsProcess }, data) => {
    addingFeedsProcess.state = 'sending';
    addingFeedsProcess.valid = true;
    addingFeedsProcess.errors = null;
    addingFeedsProcess.fields.urls.push(data);
  };

  const updateFeedback = ({ loadingProcess }, data) => {
    loadingProcess.posts.unshift(...data.posts);
    loadingProcess.feeds.unshift(data.feed);
    loadingProcess.state = 'success';
  };

  elements.formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = formData.get('url');
    const { urls } = initialState.addingFeedsProcess.fields;
    validate(data, urls)
      .then(() => {
        updateData(watchedState, data);
      })
      .catch((err) => {
        const messages = err.errors.map((e) => i18nInstance.t(e.key)).join('');
        updateErrors(messages, watchedState);
      })
      .then(() => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(`${data}`)}`))
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return parse(response);
        }
        watchedState.loadingProcess.errors = 'Network problem';
      })
      .catch((_) => {
        watchedState.loadingProcess.errors = (`${i18nInstance.t('feedback.loading_failed')}`);
        watchedState.loadingProcess.state = 'failed';
        _.noop();
      })
      .then((parsedData) => {
        updateFeedback(watchedState, parsedData);
      });
  });
};
