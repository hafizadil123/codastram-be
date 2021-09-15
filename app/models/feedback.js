import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  isGood: {
    type: Boolean,
    default: 0,
  },
  feedbackResults: {
    type: [{}],
    default: [],  // email not sent represented by 0
},
   meetingId: { type: Schema.Types.ObjectId, ref: 'Meetings' },
   inviteeId: { type: Schema.Types.ObjectId, ref: 'Invites' },
}, {
  timestamps: true,
});

const FeedbackSchemaModel = mongoose.model('Feedbacks', FeedbackSchema);

export default FeedbackSchemaModel;
