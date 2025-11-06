import mongoose from "mongoose";

const menteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  issues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
    },
  ],
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
});

const Mentee = mongoose.model("Mentee", menteeSchema);
export default Mentee;
