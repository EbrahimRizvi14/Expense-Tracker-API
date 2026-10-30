
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/user";
import { validateLoginInput } from "@/lib/validation/auth";
import { SignJWT } from "jose";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    const validationError = validateLoginInput(
    email,
    password
    );

    if (validationError) {
    return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
    );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Connect to MongoDB
    await connectDB();

    // Find user and retrieve password hash
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // Generate JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET
    );

    const token = await new SignJWT({
      userId: user._id.toString(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Return successful response
    return NextResponse.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}
