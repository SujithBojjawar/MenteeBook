import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["mentor", "admin"],
    default: "mentor",
  },
  mentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentee",
    },
  ],
});

const Mentor = mongoose.model("Mentor", mentorSchema);
export default Mentor;
