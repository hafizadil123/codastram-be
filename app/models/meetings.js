import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const MeetingSchema = new Schema({
  subject: {
    type: [String],
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  invites: {
    type: String,
    required: true,
  },
  dateStart: {
    type: String,
    required: true,
  },
  dateEnd: {
    type: String,
  },
  location: {
    type: String,
    default: null,
  },
   _user: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

const MeetingSchemaModel = mongoose.model('Meetings', MeetingSchema);

export default MeetingSchemaModel;
