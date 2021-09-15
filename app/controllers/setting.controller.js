/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import BaseController from './base.controller';
import Setting from '../models/setting';

class SettingsController extends BaseController {
	whitelist = ['baterySetting', 'sosVoice', 'thirtyMin', 'oneHr', 'twoHr', 'pushNotification', 'emailNotification'];

	_populate = async (req, res, next) => {
	  const { body: { email } } = req;
	  try {
	    const user = await User.findOne({ email });
	    if (!user) {
	      next();
	      res.status(404).json({ message: 'user is not exist!' });
	    }

	    req.user = user;
	    next();
	  } catch (err) {
	    next(err);
	  }
	};

	search = async (_req, res, next) => {
	  try {
	    // @TODO Add pagination
	    res.json(await User.find());
	  } catch (err) {
	    next(err);
	  }
	};

	fetch = (req, res) => {
	  const user = req.user || req.currentUser;

	  if (!user) {
	    return res.sendStatus(404);
	  }

	  res.json(user);
	};

	create = async (req, res, next) => {
	  const params = this.filterParams(req.body, this.whitelist);
	  const newUser = new User({
	    ...params,
	    provider: 'local',
	  });
	  try {
	    const savedUser = await newUser.save();
	    const token = savedUser.generateToken();
	    await sendRegistrationEmail();
	    res.status(201).json({ token, message: 'Registration email has been sent please verify!' });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	update = async (req, res, next) => {
	  const newAttributes = this.filterParams(req.body, this.whitelist);
	  const updatedUser = Object.assign({}, req.currentUser, newAttributes);
	  const query = req.query.userId !== 'undefined' ? req.query.userId : '';
	  const user = await User.findById({ _id: query });
	  user.password = updatedUser.password;
	  try {
	    if (!user) {
	      return res.status(500).json({ message: 'user does not exist!' });
	    }
	    await user.save();
	    res.status(200).json({ message: 'password has been updated' });
	  } catch (err) {
	    next(err);
	  }
	};

	
	setting = async (req, res, next) => {
	  const params = this.filterParams(req.body, this.whitelist);
	  params['userId'] = req.user.id;
	  const settingObj = {
	    ...params,
	  };
	  console.log('settingsObj: ', settingObj);
	  try {
	    let setting = await Setting.findOne({ userId: req.user.id });

	    if (setting) {
	      // update

	      setting = await Setting.findOneAndUpdate({ userId: req.user.id }, { $set: settingObj }, { new: true });

	      return res.status(200).json({ mgs: 'success', setting: setting });
	    }

	    // Create
	    setting = new Setting(settingObj);
	    await setting.save();
	    return res.status(200).json({ mgs: 'success', setting: setting });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
}

export default new SettingsController();
