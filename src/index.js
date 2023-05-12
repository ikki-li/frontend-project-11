#!/usr/bin/env node
import 'bootstrap';
// eslint-disable-next-line no-unused-vars
import * as yup from 'yup';
import onChange from 'on-change';
import css from './styles.css';
import render from './render.js';

const runApp = () => {
  const state = {
    addingFeedsForm: {
      paths: [],
      valid: '',
      errors: [],
    },
  };
  const watchedState = onChange(state, render);

  const schema = yup
    .string().required().url().notOneOf(state.addingFeedsForm.paths);

  const formElement = document.querySelector('.rss-form');
  formElement.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = formData.get('url');
    schema.validate(data, { abortEarly: false })
      .then((path) => {
        watchedState.addingFeedsForm = {
          paths: state.paths.push(path),
          valid: 'valid',
          errorMessage: null,
        };
        // здесь будет выполняться асинхронный запрос на сервер,
      })
      .catch(({ errors }) => {
        watchedState.addingFeedsForm = {
          valid: 'invalid',
          errors,
        };
      });
  });
};

runApp();
