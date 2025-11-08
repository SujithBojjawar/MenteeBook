import Mentor from "../models/Mentor.js";
import Mentee from "../models/Mentee.js";
import Issue from "../models/Issue.js";

// ✅ Fetch all mentees for a mentor
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

// ✅ Add single mentee
export const addMentee = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { name, rollNumber, department, year } = req.body;

    if (!name || !rollNumber || !department || !year) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingMentee = await Mentee.findOne({ rollNumber, mentorId });
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
    await Mentor.findByIdAndUpdate(mentorId, { $push: { mentees: newMentee._id } });

    res.status(201).json({
      success: true,
      message: "Mentee added successfully ✅",
      newMentee,
    });
  } catch (error) {
    console.error("❌ Error adding mentee:", error);
    res.status(500).json({ message: "Error adding mentee", error: error.message });
  }
};

// ✅ Delete a single mentee
export const deleteMentee = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { menteeId } = req.params;

    await Mentee.findByIdAndDelete(menteeId);
    await Mentor.findByIdAndUpdate(mentorId, { $pull: { mentees: menteeId } });

    res.status(200).json({ success: true, message: "Mentee deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting mentee:", error);
    res.status(500).json({ message: "Error deleting mentee", error: error.message });
  }
};

// ✅ Delete all mentees for a mentor
export const deleteAllMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentees = await Mentee.find({ mentorId });

    if (mentees.length === 0) {
      return res.status(404).json({ message: "No mentees found to delete." });
    }

    const menteeIds = mentees.map((m) => m._id);
    const issueIds = mentees.flatMap((m) => m.issues || []);

    await Mentee.deleteMany({ mentorId });
    await Mentor.findByIdAndUpdate(mentorId, { $pullAll: { mentees: menteeIds } });

    if (issueIds.length > 0) {
      await Issue.deleteMany({ _id: { $in: issueIds } });
    }

    res.status(200).json({
      success: true,
      message: "✅ All mentees (and their issues) deleted successfully.",
      deletedCount: mentees.length,
    });
  } catch (error) {
    console.error("❌ Error deleting all mentees:", error);
    res.status(500).json({ message: "Error deleting all mentees", error: error.message });
  }
};

// ✅ Add an issue for a mentee
export const addIssue = async (req, res) => {
  try {
    const { menteeId } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Issue description is required" });
    }

    const newIssue = new Issue({ description, status: "pending" });
    await newIssue.save();

    await Mentee.findByIdAndUpdate(menteeId, { $push: { issues: newIssue._id } });

    res.status(201).json({
      success: true,
      message: "Issue added successfully ✅",
      newIssue,
    });
  } catch (error) {
    console.error("❌ Error adding issue:", error);
    res.status(500).json({ message: "Error adding issue", error: error.message });
  }
};

// ✅ Update issue status (pending / solved)
export const updateIssueStatus = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!["pending", "solved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Issue.findByIdAndUpdate(issueId, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Issue not found" });
    }

    res.status(200).json({
      success: true,
      message: "Issue status updated ✅",
      updated,
    });
  } catch (error) {
    console.error("❌ Error updating issue status:", error);
    res.status(500).json({ message: "Error updating issue status", error: error.message });
  }
};

export const addBulkMentees = async (req, res) => {
  try {
    const { mentees } = req.body;
    const mentorId = req.user.id;

    if (!mentees || !Array.isArray(mentees) || mentees.length === 0) {
      return res.status(400).json({ message: "No mentees provided" });
    }

    // 🧹 Clean malformed values (remove quotes, spaces)
    const clean = (v) =>
      typeof v === "string" ? v.replace(/^"|"$/g, "").trim() : v;

    const validMentees = mentees
      .map((m) => ({
        rollNumber: clean(m.rollNumber),
        name: clean(m.name),
        department: clean(m.department),
        year: clean(m.year),
      }))
      .filter((m) => m.rollNumber && m.name && m.department && m.year);

    if (validMentees.length === 0) {
      return res.status(400).json({ message: "No valid mentees found" });
    }

    // ✅ Avoid duplicates for same mentor
    const existing = await Mentee.find({
      rollNumber: { $in: validMentees.map((m) => m.rollNumber) },
      mentorId,
    });

    const existingRolls = existing.map((m) => m.rollNumber);
    const newMentees = validMentees.filter(
      (m) => !existingRolls.includes(m.rollNumber)
    );

    if (newMentees.length === 0) {
      return res.status(400).json({
        message: "All mentees already exist for this mentor",
      });
    }

    // ✅ Attach mentorId and insert
    const menteesWithMentor = newMentees.map((m) => ({ ...m, mentorId }));
    const inserted = await Mentee.insertMany(menteesWithMentor);

    // ✅ Update Mentor list
    await Mentor.findByIdAndUpdate(mentorId, {
      $push: { mentees: inserted.map((m) => m._id) },
    });

    res.status(201).json({
      message: `${inserted.length} mentees added successfully!`,
      added: inserted.length,
      skipped: existingRolls.length,
    });
  } catch (err) {
    console.error("❌ Error in addBulkMentees:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
