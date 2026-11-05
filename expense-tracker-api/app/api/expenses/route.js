
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import Expense from "@/lib/models/expense";

export async function POST(request) {
  try {
    // 1. Authenticate the user
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: 401 }
      );
    }

    // 2. Get the expense data
    const body = await request.json();
    const { title, amount, category, date } = body;

    // 3. Validate the input
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      typeof category !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid title, amount, and category.",
        },
        { status: 400 }
      );
    }

    // 4. Validate the category
    const validCategories = [
      "groceries",
      "leisure",
      "electronics",
      "utilities",
    ];

    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Invalid expense category." },
        { status: 400 }
      );
    }

    // 5. Validate the date if provided
    if (
      date !== undefined &&
      (typeof date !== "string" || Number.isNaN(Date.parse(date)))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid expense date." },
        { status: 400 }
      );
    }

    // 6. Connect to MongoDB
    await connectDB();

    // 7. Create the expense
    const expense = await Expense.create({
      userId: auth.userId,
      title: title.trim(),
      amount,
      category,
      ...(date !== undefined && { date: new Date(date) }),
    });

    // 8. Return the created expense
    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully.",
        expense,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Create expense error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the expense.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // 1. Authenticate the user
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: 401 }
      );
    }

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Find expenses belonging to this user
    const expenses = await Expense.find({
      userId: auth.userId,
    }).sort({ date: -1 });

    // 4. Return the expenses
    return NextResponse.json({
      success: true,
      count: expenses.length,
      expenses,
    });

  } catch (error) {
    console.error("Get expenses error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while retrieving expenses.",
      },
      { status: 500 }
    );
  }
}