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

    // 2. Get query parameters from the URL
    const { searchParams } = new URL(request.url);

    const filter = searchParams.get("filter");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // 3. Validate preset filters
    const validFilters = ["week", "month", "3months"];

    if (filter && !validFilters.includes(filter)) {
      return NextResponse.json(
        { success: false, message: "Invalid date filter." },
        { status: 400 }
      );
    }

    // 4. Validate custom date range parameters
    if (Boolean(startDateParam) !== Boolean(endDateParam)) {
      return NextResponse.json(
        {
          success: false,
          message: "Both startDate and endDate are required.",
        },
        { status: 400 }
      );
    }

    if (filter && startDateParam) {
      return NextResponse.json(
        {
          success: false,
          message: "Choose either a preset filter or a custom date range.",
        },
        { status: 400 }
      );
    }

    // 5. Calculate date boundaries using Pakistan time
    const pakistanOffset = 5 * 60 * 60 * 1000;

    let startDate = null;
    let endDate = null;

    // Custom date range
    if (startDateParam && endDateParam) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      const isValidDate = (dateString) => {
        if (!dateRegex.test(dateString)) {
          return false;
        }

        const date = new Date(`${dateString}T00:00:00.000Z`);

        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === dateString
        );
      };

      if (
        !isValidDate(startDateParam) ||
        !isValidDate(endDateParam)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid date. Use a real date in YYYY-MM-DD format.",
          },
          { status: 400 }
        );
      }

      if (startDateParam > endDateParam) {
        return NextResponse.json(
          {
            success: false,
            message: "Start date cannot be after end date.",
          },
          { status: 400 }
        );
      }

      // Start of the selected start date in Pakistan time
      startDate = new Date(
        new Date(`${startDateParam}T00:00:00.000Z`).getTime()
        - pakistanOffset
      );

      // Start of the day AFTER the selected end date
      endDate = new Date(
        new Date(`${endDateParam}T00:00:00.000Z`).getTime()
        + 24 * 60 * 60 * 1000
        - pakistanOffset
      );
    }

    // Preset date filters
    else if (filter) {
      const now = new Date();

      const pakistanNow = new Date(
        now.getTime() + pakistanOffset
      );

      const start = new Date(
        Date.UTC(
          pakistanNow.getUTCFullYear(),
          pakistanNow.getUTCMonth(),
          pakistanNow.getUTCDate()
        )
      );

      if (filter === "week") {
        const daysSinceMonday = (start.getUTCDay() + 6) % 7;

        start.setUTCDate(
          start.getUTCDate() - daysSinceMonday
        );
      }

      if (filter === "month") {
        start.setUTCDate(1);
      }

      if (filter === "3months") {
        start.setUTCDate(1);
        start.setUTCMonth(start.getUTCMonth() - 2);
      }

      startDate = new Date(
        start.getTime() - pakistanOffset
      );
    }

    // 6. Connect to MongoDB
    await connectDB();

    // 7. Build the database query
    const query = {
      userId: auth.userId,
    };

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lt: endDate,
      };
    } else if (startDate) {
      query.date = {
        $gte: startDate,
      };
    }

    // 8. Retrieve matching expenses
    const expenses = await Expense.find(query).sort({
      date: -1,
    });

    // 9. Return the results
    return NextResponse.json({
      success: true,
      count: expenses.length,
      filter: filter || (startDateParam ? "custom" : "all"),
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
