import { Router } from 'express';
import UsersController from './controllers/user.controller';
import SettingsController from './controllers/setting.controller';
import authenticate from './middleware/authenticate';
import accessControl from './middleware/access-control';
import errorHandler from './middleware/error-handler';

const routes = new Router();

// Users
// routes.post('/api/users/register', UsersController.register);
// routes.post('/api/users/login', UsersController.login);
// routes.post('/api/users/resetPassword', authenticate, UsersController.resetPassword);
// routes.post('/api/users/sendforgetPasswordEmail', UsersController.sendForgetPassEmail);
// routes.post('/api/users/forgetPassword/:userId/:token', UsersController.forgetPassword);
routes.post('/api/users/create-playlist', UsersController.createPlaylist);

routes.get('/api/users/get-library', UsersController.getLibrary);
// User Settings
// routes.post('/api/users/setting', authenticate, SettingsController.setting);
routes.get('/read-file', UsersController.readFile);
routes.get('/send-email', UsersController.sendEmail);

routes.use(errorHandler);

export default routes;
