import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const playListSchema = new Schema({
  customName: {
    type: String,
    required: [true, 'custom name is required'],
  },
  songName: {
    type: String,
    required: [true, 'song name is required'],
  },
  albumName: {
    type: String,
    required: [true, 'albumName is required'],
  },
  duration: {
    type: String,
    required: [true, 'duration is required'],
  },
  imageUrl: {
    type: String,
    required: [true, 'imageUrl is required'],
  },
  rating: {
    type: String,
    required: [true, 'rating is required'],
  },
  singerName: {
    type: String,
    required: [true, 'singerName is required'],
  },
  lyrics: {
    type: String,
    required: [true, 'lyrics is required'],
  },

  userId: {
    type: String,
    required: [true, 'userId is required'],
  },
  userEmail: {
    type: String,
    required: [true, 'email is required'],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const PlayList = mongoose.model('playlist', playListSchema);
export default PlayList;
