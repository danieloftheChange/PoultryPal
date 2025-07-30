import jwt from "jsonwebtoken";
import User from "../src/users/users.model.js";

const JWT_SECRET =
  "f873c65e7bdf4e8aaf3e86a8a091b3f6c9d1452e47a6741d512af0f7df06a5a8";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

export default authMiddleware;
