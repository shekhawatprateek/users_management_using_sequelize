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
      return res.redirect(`${FRONTEND_URL}/login?message=AlreadyVerified`);
    }

    user.isVerified = true;
    await user.save();

    res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch (error) {
    console.error("Verification Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.redirect(`${FRONTEND_URL}/login?error=TokenExpired`);
    }

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
    // console.log("<><><><>");

    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });

    // console.log("<><><><>");

    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    // console.log("<><><><>");

    if (!user) return res.status(404).json({ message: "User not found" });
    // console.log("<><><><>");

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${user.id}/${token}`;
    // console.log("<><><><>");

    const emailHtml = `
            <h2>Password Reset</h2>
            <p>Click the link below to set a new password. Expires in 15 minutes.</p>
            <a href="${resetLink}">Reset Password</a>
        `;
    // console.log("<><><><>");

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
    const { id, token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ message: "Invalid user or token" });
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
      jwt.verify(token, secret);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
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

    const cacheKey = `users_page_${page}_search_${search}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("⚡ Serving from Redis Cache");
      // Redis stores data as strings, so we must parse it back into JSON
      return res.status(200).json(JSON.parse(cachedData));
    }


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

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.file) {
      user.profileImage = req.file.filename; 
    }

    await user.save();

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
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};



const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account." });
    }

    await user.destroy(); 

    await redisClient.flushAll();

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.log("Delete User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ message: "Refresh token is missing" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            
            if (err) {
                return res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
            }

            const user = await User.findByPk(decoded.id);
            
            if (!user) {
                return res.status(404).json({ message: "User no longer exists" });
            }

            const newAccessToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            res.status(200).json({
                success: true,
                access_token: newAccessToken
            });
        });

    } catch (error) {
        console.log("Refresh Token Error:", error);
        res.status(500).json({ message: "Internal server error" });
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
