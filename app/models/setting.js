import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const settingSchema = new Schema({
	baterySetting: {
		type: String,
		default: '0'
	},
	sosVoice: {
		type: Boolean,
		default: false
	},
	thirtyMin: {
		type: Boolean,
		default: false
	},
	oneHr: {
		type: Boolean,
		default: false
	},
	twoHr: {
		type: Boolean,
		default: false
	},
	pushNotification: {
		type: Boolean,
		default: false
	},
	emailNotification: {
		type: Boolean,
		default: false
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});
const Setting = mongoose.model('setting', settingSchema);

export default Setting;
