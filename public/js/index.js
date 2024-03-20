/* eslint-disable*/

import { login } from './login';
import { signup } from './signup';
import { displayMap } from './mapbox';
import { logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './payment';
const leafMap = document.getElementById('map');
const logInForm = document.querySelector('.form--login');
const signUpForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const bookBtn = document.getElementById('book-tour');
const updateFormData = document.querySelector('.form-user-data');
const updatePasswordData = document.querySelector('.form-user-password');

if (leafMap) {
  const tourLocations = JSON.parse(leafMap.dataset.locations);
  displayMap(tourLocations);
}

if (logInForm) {
  logInForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signUpForm) {
  signUpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (updateFormData) {
  console.log('abhi');
  updateFormData.addEventListener('submit', function (e) {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (updatePasswordData) {
  updatePasswordData.addEventListener('submit', async function (e) {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', function (e) {
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
