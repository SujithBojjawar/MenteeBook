import Issue from "../models/Issue.js";

export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: "Error fetching issues", error });
  }
};

export const deleteIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    await Issue.findByIdAndDelete(issueId);
    res.status(200).json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting issue", error });
  }
};
