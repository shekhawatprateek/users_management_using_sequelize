const { validationResult } = require("express-validator");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const { Op } = require("sequelize"); 
const redis = require("redis");

const redisClient = redis.createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();


const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { name, email, password } = req.body;

    const userAlreadyExist = await User.findOne({ where: { email } });
    if (userAlreadyExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      email,
      password: hashedPassword,
      name,
    };

    if (req.file) {
      data.profileImage = req.file.filename; 
    }

    const user = await User.create(data);

    const verificationToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const verificationLink = `http://localhost:${process.env.PORT || 8000}/v1/user/verify?token=${verificationToken}`;

    const emailSubject = "Please Verify Your Account";
    const emailHtml = `
      <h2>Welcome to the User Management App, ${user.name}!</h2>
      <p>Please click the link below to verify your email address. This link expires in 15 minutes.</p>
      <a href="${verificationLink}">Verify My Account</a>
    `;

    await sendMail(user.email, emailSubject, emailHtml);

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
      success: true,
    });
  } catch (error) {
    console.log("Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  // It's best practice to put this in your .env file later (e.g., process.env.FRONTEND_URL)
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${FRONTEND_URL}/login?error=InvalidLink`);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=UserNotFound`);
    }

    if (user.isVerified) {
      // Already verified? Just send them to login with a message
      return res.redirect(`${FRONTEND_URL}/login?message=AlreadyVerified`);
    }

    user.isVerified = true;
    await user.save();

    // SUCCESS: Send them to the login page
    res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error("Verification Error:", error);

    // If jwt.verify() fails (e.g., token expired)
    if (error.name === "TokenExpiredError") {
      return res.redirect(`${FRONTEND_URL}/login?error=TokenExpired`);
    }

    // Generic server error
    res.redirect(`${FRONTEND_URL}/login?error=ServerError`);
  }
};

const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const access_token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refresh_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    console.log("<><><><>");

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });

    console.log("<><><><>");

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    console.log("<><><><>");

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("<><><><>");

    const secret = process.env.JWT_SECRET + user.password;
    // Generate a 15-minute token
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "15m",
    });

    // The link pointing to your React frontend
    const resetLink = `http://localhost:5173/reset-password/${user.id}/${token}`;
    console.log("<><><><>");

    const emailHtml = `
            <h2>Password Reset</h2>
            <p>Click the link below to set a new password. Expires in 15 minutes.</p>
            <a href="${resetLink}">Reset Password</a>
        `;
    console.log("<><><><>");

    await sendMail(user.email, "Password Reset Request", emailHtml);
    res
      .status(200)
      .json({ message: "Reset link sent to your email", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    // We need both the ID and the Token from the URL parameters
    const { id, token } = req.params;
    const { newPassword } = req.body; // Matches your express-validator setup

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ message: "Invalid user or token" });
    }

    // Recreate the exact same secret we used to sign the token
    const secret = process.env.JWT_SECRET + user.password;

    try {
      // Verify the token. If it expired or the password was already changed, this throws an error.
      jwt.verify(token, secret);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the database
    user.password = hashedPassword;
    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Password successfully reset. You can now log in.",
      });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const limit = 10;
    const offset = (page - 1) * limit;

    // 2. Create a unique Cache Key based on what the user searched for
    // e.g., "users_page_1_search_admin"
    const cacheKey = `users_page_${page}_search_${search}`;

    // 3. Check the Cache BEFORE touching the database
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ Serving from Redis Cache");
      // Redis stores data as strings, so we must parse it back into JSON
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log("🐢 Serving from MySQL Database");

    // 4. Not in cache? Do the normal Database query
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: limit,
      offset: offset,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    const responseData = {
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };

    // 5. Save the result to Redis for the NEXT person!
    // setEx means "Set with Expiration". We tell it to hold the data for 3600 seconds (1 hour).
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    // 6. Send response to the user
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add this to user.controller.js

const updateProfile = async (req, res) => {
  try {
    // req.user.id comes from your `protect` auth middleware!
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update text fields (if they provided new ones, otherwise keep the old ones)
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // If Multer caught a new file, update the image path
    if (req.file) {
      user.profileImage = req.file.filename; // or req.file.path depending on your setup
    }

    await user.save();

    // Send back the updated user object so React can update localStorage
    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    // This is for viewing OTHER users from the dashboard
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }, // Hide the password hash!
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Don't forget to export both!
// module.exports = { ..., updateProfile, getUserById };

// Add this to user.controller.js

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional safety check: Don't let an admin delete themselves!
    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account." });
    }

    await user.destroy(); // Sequelize command to delete the row
    // Flush all cached user queries so the dashboard updates with fresh data
    await redisClient.flushAll();

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add this to user.controller.js
// Make sure jwt and User are imported at the top

const refreshAccessToken = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. NO CALLBACK! It waits right here until it finishes.
    // If it fails, it instantly jumps to the 'catch' block.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Now we are safely outside, and 'decoded' exists!
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User no longer exists" });
    }

    const access_token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.status(200).json({ success: true, access_token });
  } catch (error) {
    // This catches the jwt.verify errors AND database errors
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token." });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  getUsers,
  updateProfile,
  getUserById,
  deleteUser,
  refreshAccessToken,
};
