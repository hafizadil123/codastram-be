import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const InvitesSchema = new Schema({
  invitesEmail: {
    type: String,
    required: true,
  },
  isEmailSent: {
    type: Boolean,
    default: 0,  // email not sent represented by 0
},
isFeedbackGiven: {
  type: Boolean,
  default: false,
},
   meetingId: { type: Schema.Types.ObjectId, ref: 'Meetings' },
}, {
  timestamps: true,
});

const InvitesSchemaModel = mongoose.model('Invites', InvitesSchema);

export default InvitesSchemaModel;
