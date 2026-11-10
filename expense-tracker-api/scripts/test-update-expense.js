
const token = process.argv[2];
const expenseId = process.argv[3];

if (!token || !expenseId) {
  console.error(
    "Usage: node scripts/test-update-expense.js <token> <expenseId>"
  );
  process.exit(1);
}

const updatedData = {
  title: "Weekly groceries",
  amount: 3000,
  category: "groceries",
};

async function testUpdateExpense() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/expenses/${expenseId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testUpdateExpense();
