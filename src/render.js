export default (elements, initialState) => (path, value, previousValue) => {
  const { formEl, feedbackEl } = elements;
  if (initialState.valid === false) {
    feedbackEl.textContent = 'Ссылка должна быть валидным URL';
    formEl.reset();
    formEl.focus();
  }
  if (initialState.valid === true) {
    feedbackEl.textContent = 'RSS успешно загружен';
    feedbackEl.classList.replace('text-danger', 'text-success');
    // тут нужно изменить класс инпута или формы чтобы подвестить красным, используя бутстрап
  }
};
