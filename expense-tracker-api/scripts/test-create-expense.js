
const token = process.argv[2];

if (!token) {
  console.error("Please provide a JWT token.");
  process.exit(1);
}

const expenseData = {
  title: "Groceries",
  amount: 2500,
  category: "groceries",
};

async function testCreateExpense() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/expenses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testCreateExpense();
