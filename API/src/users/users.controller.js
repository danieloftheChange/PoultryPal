import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "./users.model.js";
import Farm from "../farm/farm.model.js";
import logger from "../../config/logger.js";

// Get JWT secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables. Please check your .env file."
  );
}

const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFarm = new Farm({
      name: `${firstName}'s Farm`,
    });

    const savedFarm = await newFarm.save();

    const newUser = new User({
      farmId: savedFarm.id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User and Farm created successfully",
      user: userResponse,
      farm: savedFarm,
    });
  } catch (error) {
    logger.error("Error signing up user", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const { firstName, lastName, role, contact, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      farmId: user.farmId,
      firstName,
      lastName,
      role,
      email,
      contact,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    logger.error("Error registering user", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

const getStaff = async (req, res) => {
  try {
    const user = req.user;

    if (!user.farmId) {
      return res
        .status(400)
        .json({ message: "User does not belong to a farm" });
    }

    const staff = await User.find({ farmId: user.farmId }).sort({ createdAt: -1 });

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });

    // Secure cookie configuration
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        farmId: user.farmId,
      },
    });
  } catch (error) {
    logger.error("Error logging in user", { error: error.message, stack: error.stack });
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided"
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Get user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        farmId: user.farmId,
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired"
      });
    }
    logger.error("Token refresh failed", { error: error.message, stack: error.stack });
    return res.status(401).json({
      success: false,
      message: "Token refresh failed"
    });
  }
};

const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error("Logout error", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error logging out"
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists - security best practice
      return res.status(200).json({
        success: true,
        message: "If the email exists, a password reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save hashed token and expiry (1 hour)
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // TODO: Send email with reset link
    // For now, we'll log it (in production, use nodemailer)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    logger.info('Password reset requested', {
      email: user.email,
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : '[HIDDEN]'
    });

    // In development/test, return the token for testing
    const response = {
      success: true,
      message: "If the email exists, a password reset link has been sent"
    };

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      response.resetToken = resetToken;
      response.resetUrl = resetUrl;
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error("Forgot password error", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error processing password reset request"
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    logger.info('Password reset successful', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login with your new password."
    });
  } catch (error) {
    logger.error("Reset password error", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error resetting password"
    });
  }
};

const sendVerificationEmail = async (req, res) => {
  try {
    const user = req.user;

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Save hashed token and expiry (24 hours)
    user.emailVerificationToken = verificationTokenHash;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // TODO: Send email with verification link
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

    logger.info('Email verification requested', {
      email: user.email,
      verifyUrl: process.env.NODE_ENV === 'development' ? verifyUrl : '[HIDDEN]'
    });

    const response = {
      success: true,
      message: "Verification email sent"
    };

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      response.verificationToken = verificationToken;
      response.verifyUrl = verifyUrl;
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error("Send verification email error", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error sending verification email"
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info('Email verified successfully', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    logger.error("Email verification error", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Error verifying email"
    });
  }
};

export default {
  signup,
  login,
  registerUser,
  getStaff,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
