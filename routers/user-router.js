const express = require('express');
const userController = require('./../controller/user-controller');
const authenController = require('./../controller/authenController');

const routes = express.Router();

routes.post('/signup', authenController.signUp);

routes.post('/login', authenController.logIn);
routes.get('/logout', authenController.logOut);

routes.post('/forgotpassword', authenController.forgotPassword);

routes.patch('/resetpassword/:token', authenController.resetPassword);

routes.use(authenController.protects);
routes.patch('/updatepassword', authenController.updatePassword);
routes.delete('/deletemydata', userController.deleteMyData);
routes.patch(
  '/updatemydata',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMyData,
);

routes.get('/me', userController.getMe, userController.getUser);

routes.use(authenController.restrictTo('admin'));
routes
  .route('/')
  .get(userController.getAllUsers)
  .patch(userController.createUser);

routes
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = routes;
