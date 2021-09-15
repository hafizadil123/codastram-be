import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const QuestionAnswersSchema = new Schema({
question: {
    type: String,
    required: true,
  },
  answers: {
    type: [{}],
    default: [],
},
}, {
  timestamps: true,
});

const QuestionAnswerSchemaModel = mongoose.model('QuestionAnswers', QuestionAnswersSchema);

export default QuestionAnswerSchemaModel;
