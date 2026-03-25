import jwt, { type SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/userModel";
import { ServiceResponse } from "../../common/models/serviceResponse";
import { env } from "../../config/env";

function generateToken(userId: string) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as unknown as SignOptions["expiresIn"] };
  return jwt.sign({ userId }, env.JWT_SECRET, options);
}

export const authService = {
  async register(data: { email: string; password: string }) {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return ServiceResponse.failure("Email already in use", null, StatusCodes.CONFLICT);
    }

    const user = await User.create(data);
    const token = generateToken(user.id);

    return ServiceResponse.success(
      "User registered successfully",
      { user: { id: user.id, email: user.email }, token },
      StatusCodes.CREATED,
    );
  },

  async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) {
      return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
    }

    const token = generateToken(user.id);

    return ServiceResponse.success("Login successful", {
      user: { id: user.id, email: user.email },
      token,
    });
  },
};
