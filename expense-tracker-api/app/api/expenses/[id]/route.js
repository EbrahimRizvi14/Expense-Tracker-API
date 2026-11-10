
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import Expense from "@/lib/models/expense";

export async function PUT(request, { params }) {
  try {
    // 1. Authenticate the user
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: 401 }
      );
    }

    // 2. Get the expense ID from the URL
    const { id } = await params;

    // 3. Get the updated data
    const body = await request.json();
    const { title, amount, category, date } = body;

    // 4. Validate the input
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 100 ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      typeof category !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid expense details." },
        { status: 400 }
      );
    }

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

    if (
      date !== undefined &&
      (typeof date !== "string" || Number.isNaN(Date.parse(date)))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid expense date." },
        { status: 400 }
      );
    }

    // 5. Connect to MongoDB
    await connectDB();

    // 6. Find and update the expense
    const updatedExpense = await Expense.findOneAndUpdate(
      {
        _id: id,
        userId: auth.userId,
      },
      {
        title: title.trim(),
        amount,
        category,
        ...(date !== undefined && { date: new Date(date) }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // 7. Check whether the expense exists
    if (!updatedExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found." },
        { status: 404 }
      );
    }

    // 8. Return the updated expense
    return NextResponse.json({
      success: true,
      message: "Expense updated successfully.",
      expense: updatedExpense,
    });

  } catch (error) {
    console.error("Update expense error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while updating the expense.",
      },
      { status: 500 }
    );
  }
}


export async function DELETE(request, { params }) {
  try {
    // 1. Authenticate the user
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message },
        { status: 401 }
      );
    }

    // 2. Get the expense ID from the URL
    const { id } = await params;

    // 3. Connect to MongoDB
    await connectDB();

    // 4. Find and delete the expense
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    // 5. Check whether the expense existed
    if (!deletedExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found." },
        { status: 404 }
      );
    }

    // 6. Return a success response
    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully.",
      expense: deletedExpense,
    });

  } catch (error) {
    console.error("Delete expense error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while deleting the expense.",
      },
      { status: 500 }
    );
  }
}
