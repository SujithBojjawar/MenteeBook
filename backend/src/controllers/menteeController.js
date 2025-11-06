import Mentee from "../models/Mentee.js";
import Issue from "../models/Issue.js";

export const getMenteeById = async (req, res) => {
  try {
    const { menteeId } = req.params;
    const mentee = await Mentee.findById(menteeId).populate("issues");
    if (!mentee) return res.status(404).json({ message: "Mentee not found" });
    res.status(200).json(mentee);
  } catch (error) {
    res.status(500).json({ message: "Error fetching mentee", error });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const { menteeId } = req.params;
    const mentee = await Mentee.findById(menteeId).populate("issues");
    if (!mentee) return res.status(404).json({ message: "Mentee not found" });
    res.status(200).json(mentee.issues);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issues", error });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    const { menteeId, issueId } = req.params;

    await Issue.findByIdAndDelete(issueId);
    await Mentee.findByIdAndUpdate(menteeId, { $pull: { issues: issueId } });

    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting issue", error });
  }
};
