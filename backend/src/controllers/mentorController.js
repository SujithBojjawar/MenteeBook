import Mentor from "../models/Mentor.js";
import Mentee from "../models/Mentee.js";
import Issue from "../models/Issue.js";
import PDFDocument from "pdfkit";
import moment from "moment";
import stream from "stream";

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

    const clean = (v) => (typeof v === "string" ? v.replace(/^"|"$/g, "").trim() : v);

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

    const existing = await Mentee.find({
      rollNumber: { $in: validMentees.map((m) => m.rollNumber) },
      mentorId,
    });

    const existingRolls = existing.map((m) => m.rollNumber);
    const newMentees = validMentees.filter((m) => !existingRolls.includes(m.rollNumber));

    if (newMentees.length === 0) {
      return res.status(400).json({ message: "All mentees already exist for this mentor" });
    }

    const menteesWithMentor = newMentees.map((m) => ({ ...m, mentorId }));
    const inserted = await Mentee.insertMany(menteesWithMentor);

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
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


export const generateMentorReport = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentor = await Mentor.findById(mentorId).populate({
      path: "mentees",
      populate: { path: "issues" },
    });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    const passThrough = new stream.PassThrough();
    doc.pipe(passThrough);

    doc.fontSize(20).fillColor("#2563eb").text("Mentor–Mentee Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).fillColor("black");
    doc.text(`Mentor: ${mentor.name}`);
    doc.text(`Generated On: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`);
    doc.moveDown();

    if (!mentor.mentees.length) {
      doc.fontSize(14).fillColor("#6b7280").text("No mentees found.", { align: "center" });
    }

    mentor.mentees.forEach((mentee, index) => {
      doc.moveDown().fontSize(14).fillColor("#1e3a8a").text(`${index + 1}. ${mentee.name}`, { underline: true });
      doc.fontSize(12).fillColor("black");
      doc.text(`Roll Number: ${mentee.rollNumber}`);
      doc.text(`Department: ${mentee.department}`);
      doc.text(`Year: ${mentee.year}`);
      doc.moveDown(0.5);

      if (mentee.issues.length > 0) {
        doc.fontSize(13).fillColor("#16a34a").text("Follow-ups / Issues:");
        mentee.issues.forEach((issue, i) => {
          doc.fontSize(11).fillColor("black").text(`  • (${i + 1}) ${issue.description} [${issue.status}]`);
        });
      } else {
        doc.fontSize(11).fillColor("#6b7280").text("  No follow-ups yet.");
      }

      doc.moveDown(1).strokeColor("#94a3b8").lineWidth(0.5).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    });

    doc.end();
    passThrough.on("data", (chunk) => chunks.push(chunk));
    passThrough.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${mentor.name}_Report.pdf"`);
      res.send(pdfBuffer);
    });
  } catch (err) {
    console.error("❌ Error generating report:", err);
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};

export const generateMenteeReport = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { menteeId } = req.params;

    const mentee = await Mentee.findOne({ _id: menteeId, mentorId }).populate("issues");

    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found or not authorized" });
    }

    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    const passThrough = new stream.PassThrough();
    doc.pipe(passThrough);

    doc.fontSize(20).fillColor("#2563eb").text("Individual Mentee Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).fillColor("black");
    doc.text(`Mentee Name: ${mentee.name}`);
    doc.text(`Roll Number: ${mentee.rollNumber}`);
    doc.text(`Department: ${mentee.department}`);
    doc.text(`Year: ${mentee.year}`);
    doc.text(`Generated On: ${new Date().toLocaleString()}`);
    doc.moveDown();

    if (mentee.issues.length > 0) {
      doc.fontSize(13).fillColor("#16a34a").text("Follow-ups / Issues:");
      mentee.issues.forEach((issue, i) => {
        doc.fontSize(11).fillColor("black").text(`  • (${i + 1}) ${issue.description} [${issue.status}]`);
      });
    } else {
      doc.fontSize(11).fillColor("#6b7280").text("No follow-ups or issues yet.");
    }

    doc.end();
    passThrough.on("data", (chunk) => chunks.push(chunk));
    passThrough.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${mentee.name}_Report.pdf"`
      );
      res.send(pdfBuffer);
    });
  } catch (err) {
    console.error("❌ Error generating mentee report:", err);
    res.status(500).json({ message: "Failed to generate mentee report", error: err.message });
  }
};
