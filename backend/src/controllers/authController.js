import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Mentor from "../models/Mentor.js";

export const registerMentor = async (req, res) => {
  try {
    console.log("Incoming Register Request Body:", req.body);

    const { name, email, password, department = "General", role = "mentor" } = req.body;

    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Mentor.findOne({ email });
    if (existing) {
      console.log("❌ Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const mentor = new Mentor({
      name,
      email,
      password: hashedPassword,
      department,
      role,
    });

    await mentor.save();
    console.log("✅ Mentor registered successfully:", mentor.email);
    res.status(201).json({ message: "Mentor registered successfully ✅" });
  } catch (error) {
    console.error("❌ Registration Error (backend):", error.message);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await Mentor.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid password" });
    }


    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
