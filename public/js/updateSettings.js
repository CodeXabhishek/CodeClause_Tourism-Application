import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updatepassword'
        : 'http://127.0.0.1:3000/api/v1/users/updatemydata';
    const result = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (result.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated  successfully`);
      // window.setTimeout(() => {
      //   location.reload(true);
      // }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
