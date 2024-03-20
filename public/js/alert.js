export const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) ele.parentElement.removeChild(ele);
  window.setTimeout(() => {
    location.reload(true);
  }, 2000);
};
export const showAlert = (type, msg) => {
  console.log('hahad');
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg} </div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 1500);
};
