
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/user";
import { validateRegisterInput } from "@/lib/validation/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Validate required fields
    const validationError = validateRegisterInput(
      name,
      email,
      password
    );

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // 2. Normalize the input
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Connect to MongoDB
    await connectDB();

    // 4. Check whether the email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create the user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Never return the password or its hash
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle concurrent requests that try to register the same email
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong while registering." },
      { status: 500 }
    );
  }
}
