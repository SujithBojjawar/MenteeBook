import Mentor from "../models/Mentor.js";
import Mentee from "../models/Mentee.js";
import Issue from "../models/Issue.js";


export const getAllMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentees = await Mentee.find({ mentorId }).populate("issues");

    res.status(200).json(mentees);
  } catch (error) {
    console.error("❌ Error fetching mentees:", error);
    res.status(500).json({ message: "Error fetching mentees", error: error.message });
  }
};


export const addMentee = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { name, rollNumber, department, year } = req.body;

    if (!name || !rollNumber || !department || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingMentee = await Mentee.findOne({ rollNumber });
    if (existingMentee) {
      return res.status(400).json({ message: "Mentee with this roll number already exists" });
    }

    const newMentee = new Mentee({
      name,
      rollNumber,
      department,
      year,
      mentorId,
    });

    await newMentee.save();

    await Mentor.findByIdAndUpdate(mentorId, {
      $push: { mentees: newMentee._id },
    });

    res.status(201).json({
      message: "Mentee added successfully ✅",
      newMentee,
    });
  } catch (error) {
    console.error("❌ Error adding mentee:", error);
    res.status(500).json({ message: "Error adding mentee", error: error.message });
  }
};

export const deleteMentee = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { menteeId } = req.params;

    await Mentee.findByIdAndDelete(menteeId);
    await Mentor.findByIdAndUpdate(mentorId, { $pull: { mentees: menteeId } });

    res.status(200).json({ message: "Mentee deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting mentee:", error);
    res.status(500).json({ message: "Error deleting mentee", error: error.message });
  }
};

export const deleteAllMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const mentees = await Mentee.find({ mentorId });

    if (mentees.length === 0) {
      return res.status(404).json({ message: "No mentees found to delete." });
    }

    const menteeIds = mentees.map((m) => m._id);

    await Mentee.deleteMany({ mentorId });

    await Mentor.findByIdAndUpdate(mentorId, { $pullAll: { mentees: menteeIds } });

    const issueIds = mentees.flatMap((m) => m.issues || []);
    if (issueIds.length > 0) {
      await Issue.deleteMany({ _id: { $in: issueIds } });
    }

    res.status(200).json({
      message: "✅ All mentees (and their issues) deleted successfully.",
      deletedCount: mentees.length,
    });
  } catch (error) {
    console.error("❌ Error deleting all mentees:", error);
    res.status(500).json({
      message: "Error deleting all mentees",
      error: error.message,
    });
  }
};


export const addIssue = async (req, res) => {
  try {
    const { menteeId } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Issue description is required" });
    }

    const newIssue = new Issue({
      description,
      status: "pending",
    });

    await newIssue.save();

    await Mentee.findByIdAndUpdate(menteeId, {
      $push: { issues: newIssue._id },
    });

    res.status(201).json({
      message: "Issue added successfully ✅",
      newIssue,
    });
  } catch (error) {
    console.error("❌ Error adding issue:", error);
    res.status(500).json({ message: "Error adding issue", error: error.message });
  }
};


export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!["pending", "solved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Issue.findByIdAndUpdate(
      issueId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      message: "Issue status updated ✅",
      updated,
    });
  } catch (error) {
    console.error("❌ Error updating issue status:", error);
    res.status(500).json({ message: "Error updating issue status", error: error.message });
  }
};
