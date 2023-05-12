export default (_, state) => {
  const inputElement = document.querySelector('#url-input');
  const container = document.querySelector('.col-8');
  if (state.valid === 'invalid') {
    if (container.lastChild.classList.includes('feedback')) {
      return;
    }
    const feedbackElement = document.createElement('p');
    feedbackElement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
    feedbackElement.textContent = state.errorMessage;
    container.append(feedbackElement);
    inputElement.style.borderColor = 'red';
    inputElement.reset();
    inputElement.focus();
  }
  if (state.valid === 'valid') {
    const feedbackElement = document.createElement('p');
    feedbackElement.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-success');
    feedbackElement.textContent = 'RSS downloaded successfully';
    container.append(feedbackElement);
    // здесь мы будем отрисовывать посты во второй секции
  }
};
