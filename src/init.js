import 'bootstrap';
// eslint-disable-next-line no-unused-vars
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import render from './render.js';

export default () => {
  const elements = {
    formEl: document.querySelector('.rss-form'),
    feedbackEl: document.querySelector('.feedback'),
  };

  const initialState = {
    addingFeedsProcess: {
      state: 'filling',
      valid: false,
      fields: {
        url: [],
      },
      errors: [],
    },
    loadingProcess: {
      posts: [],
      feeds: [],
    },
  };

  const watchedState = onChange(initialState, render(elements, initialState));

  const validate = (data, urls) => {
    const schema = yup.string().trim().required().url()
      .notOneOf(urls);
    return schema.validate(data, { abortEarly: false });
  };

  const getData = () => _.noop;

  const updateErrors = (errors, watchedState) => {
    watchedState.addingFeedsForm = {
      state: 'filling',
      valid: false,
      errors,
    };
  };

  const formElement = document.querySelector('.rss-form');
  formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = formData.get('url');
    const { urls } = initialState.addingFeedsProcess.fields;
    validate(data, urls)
      .then(() => {
        watchedState.addingFeedsForm = {
          state: 'sending',
          valid: true,
          errors: null,
        };
        getData();
        // здесь будет выполняться асинхронный запрос на сервер
      })
      .catch(({ errors }) => {
        updateErrors(errors, watchedState);
      });
  });
};
