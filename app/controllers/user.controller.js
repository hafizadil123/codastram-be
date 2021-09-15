/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
import BaseController from './base.controller';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const stripe = require('stripe')('sk_test_nxJqnIMdYpm8n6fVQvxGFeGU00FWevmEYX');
import { sendResetPassEmail } from '../lib/util';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
import PlayList from '../models/playlist';
import fs from 'fs';
import path from 'path';
class UsersController extends BaseController {
	whitelist = [
	  'firstName',
	  'lastName',
	  'email',
	  'password',
	  'phoneNumber',
	  'profilePic',
	  'role',
	  'plan',
	  'amount',
	  'duration',
	  'stripeToken',
	];

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
	    // await sendRegistrationEmail();
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

	delete = async (req, res, next) => {
	  if (!req.currentUser) {
	    return res.sendStatus(403);
	  }

	  try {
	    await req.currentUser.remove();
	    res.sendStatus(204);
	  } catch (err) {
	    next(err);
	  }
	};

	register = async (req, res, next) => {
	  const {
	    firstName,
	    lastName,
	    email,
	    password,
	    phoneNumber,
	    profilePic,
	    role,
	    plan,
	    amount,
	    duration,
	    stripeToken,
	  } = req.body;
	  const amountVal = amount * 100;
	  try {
	    // See if user exist
	    let user = await User.findOne({ email });
	    if (user) {
	      return res.status(400).json({ msg: 'User Already Exists' });
	    }

	    const customer = await stripe.customers.create({
	      email: email,
	      source: stripeToken,
	    });
	    console.log('customer : ', customer);

	    const charge = await stripe.charges.create({
	      amount: amountVal,
	      description: 'Sample Charge',
	      currency: 'usd',
	      customer: customer.id,
	      receipt_email: email,
	    });
	    console.log('charge : ', charge);
	    if (!charge) {
	      return res.status(400).json({ msg: 'Card Declined!' });
	    }
	    user = new User({
	      firstName,
	      lastName,
	      email,
	      password,
	      phoneNumber,
	      profilePic,
	      role,
	      subscription: [
	        {
	          plan: plan,
	          amount: amount,
	          duration: duration,
	        },
	      ],
	      paymentMethod: [
	        {
	          type: 'card',
	          token: charge.id,
	        },
	      ],
	    });
	    // Encrypt password
	    const salt = await bcrypt.genSalt(10);
	    user.password = await bcrypt.hash(password, salt);
	    await user.save();
	    // Return jsonwebtoken

	    const payload = {
	      user: {
	        id: user.id,
	        email: user.email,
	        role: user.role,
	      },
	    };
	    jwt.sign(payload, 'i-am-the-secret-key-of-mgs-project', { expiresIn: '1h' }, (err, token) => {
	      if (err) throw err;
	      res.status(200).json({ token: token });
	    });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	login = async (req, res, next) => {
	  const { email, password } = req.body;

	  try {
	    // See if user exist
	    const user = await User.findOne({ email });
	    if (!user) {
	      return res.status(400).json({ msg: 'Invalid Credentials' });
	    }

	    const isMatch = await bcrypt.compare(password, user.password);
	    if (!isMatch) {
	      return res.status(400).json({ msg: 'Invalid Credentials' });
	    }

	    // Return jsonwebtoken
	    const payload = {
	      user: {
	        id: user.id,
	        email: user.email,
	        role: user.role,
	      },
	    };
	    jwt.sign(payload, 'i-am-the-secret-key-of-mgs-project', { expiresIn: '1h' }, (err, token) => {
	      if (err) throw err;
	      res.status(200).json({ token });
	    });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	sendForgetPassEmail = async (req, res, next) => {
	  const { email } = req.body;
	  try {
	    const user = await User.findOne({ email: email }).select('firstName lastName email');
	    if (!user) {
	      return res.status(404).json({ msg: 'User not Found!' });
	    }
	    const payload = { id: user._id };
	    const token = jwt.sign(payload, 'i-am-the-secret-key-of-mgs-project', {
	      expiresIn: '2m', // 2 minutes
	    });
	    const link = `http://localhost:3000/reset/${user._id}/${token}`;
	    await sendResetPassEmail(user, link);
	    return res.status(200).json({ msg: 'Email Sent!' });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	getLibrary = async (req, res, next) => {
	  try {
		 const { email, userId } = req.query;
		 const updatedUserId = userId.split('|')[1];
	    const library = await PlayList.find({
	      userEmail: email,
		  userId: updatedUserId,
	    });
	    if (!library) {
	      return res.status(200).json({ message: 'library empty', success: 0, library });
	    }
	    return res.status(200).json({ message: 'library list has been listed', success: 1, library });
	  } catch (err) {
	    next(err);
	  }
	}
	createPlaylist = async (req, res, next) => {
	  try {
		 const {
			 customName,
	     	 songName,
	         userId,
			 email,
			 albumName,
			 duration,
			 imageUrl,
			 rating,
			 singerName,
			 lyrics,
	    } = req.body;
		 const findSong = await PlayList.findOne({ userEmail: email, songName });
		 if (findSong) {
			 return res.status(200).json({ message: 'songName already exist in your library', success: 0 });
		 }

		 const updatedUserId = userId.split('|')[1];
		 const savingInstance = {
			 customName: customName,
			 songName: songName,
			 userId: updatedUserId,
			 userEmail: email,
			 albumName,
			 duration,
			 imageUrl,
			 rating,
			 singerName,
			 lyrics,

		 };

		 const createdInstance = new PlayList(savingInstance);
		 const savedInstance = await createdInstance.save();
		 if (savedInstance) {
	      return res.status(200).json({ message: 'song added in your library', success: 1 });
		 }

		 return res.status(200).json({ message: 'something went wrong', success: 0 });
	  } catch (err) {
	    next(err);
	  }
	}
	forgetPassword = async (req, res, next) => {
	  const { password } = req.body;
	  try {
	    const user = await User.findOne({ _id: req.params.userId }).select('password');
	    if (!user) {
	      return res.status(404).json({ msg: 'User not Found!' });
	    }
	    const decode = jwt.verify(req.params.token, 'i-am-the-secret-key-of-mgs-project');
	    if (!decode) {
	      return res.status(400).json({ msg: 'Link Expired,Please Generate Again' });
	    }

	    const salt = await bcrypt.genSalt(10);
	    user.password = await bcrypt.hash(password, salt);
	    await user.save();

	    return res.status(200).json({ msg: 'Password Changed Successfully!' });
	  } catch (err) {
	    if (err.message === 'jwt expired') {
	      return res.status(400).json({ msg: 'Link Expired,Please Generate Again' });
	    }
	    err.status = 400;
	    next(err);
	  }
	};

	sendEmail = async (req, res, next) => {
	  try {
	    const msg = {
	      to: 'ahafiz167@gmail.com',
	      from: 'adil.sikandar@mobilelive.ca',
	      subject: 'Sending with Twilio SendGrid is Fun',
	      text: 'and easy to do anywhere, even with Node.js',
	      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
	    };

	    sgMail.send(msg);
	  } catch (err) {
	    next(err);
	  }
	}
	readFile = async (req, res, next) => {
	  try {
		  const file = fs.readFileSync('test.csv', 'utf8');
		  console.log('file', file);
	  } catch (err) {
		  next(err);
	  }
	  }
	resetPassword = async (req, res, next) => {
	  const { oldPassword, newPassword } = req.body;

	  try {
	    const user = await User.findById({ _id: req.user.id });
	    if (!user) {
	      return res.status(400).json({ msg: 'User Not Found!' });
	    }
	    const isMatch = await bcrypt.compare(oldPassword, user.password);
	    if (isMatch) {
	      const salt = await bcrypt.genSalt(10);
	      const updateUserPassword = await User.findByIdAndUpdate(
	          req.user.id,
	          {
	            $set: {
	              password: await bcrypt.hash(newPassword, salt),
	            },
	          },
	          { new: true },
	      );
	      return res.status(200).json({ msg: 'Password Changed Successfully!' });
	    }
	    return res.status(400).json({ msg: 'Invalid Password' });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
}

export default new UsersController();
