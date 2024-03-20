import axios from 'axios';
import { showAlert } from './alert';
export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    // 1️⃣9️⃣0️⃣.) Login User--------------

    if (result.data.status === 'success') {
      showAlert('success', 'Sign up successfully. Login to continue');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
