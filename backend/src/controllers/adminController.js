import Mentor from "../models/Mentor.js";
import Mentee from "../models/Mentee.js";
import Issue from "../models/Issue.js";

export const getAllMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find().populate("mentees");
    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentors", error });
  }
};

export const getAllMentees = async (req, res) => {
  try {
    const mentees = await Mentee.find().populate("issues");
    res.status(200).json(mentees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentees", error });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalMentors = await Mentor.countDocuments();
    const totalMentees = await Mentee.countDocuments();
    const pendingIssues = await Issue.countDocuments({ status: "pending" });
    const solvedIssues = await Issue.countDocuments({ status: "solved" });

    res.status(200).json({
      totalMentors,
      totalMentees,
      pendingIssues,
      solvedIssues,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
};

