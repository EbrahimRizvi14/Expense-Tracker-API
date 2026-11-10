
const token = process.argv[2];
const expenseId = process.argv[3];

if (!token || !expenseId) {
  console.error(
    "Usage: node scripts/test-delete-expense.js <token> <expenseId>"
  );
  process.exit(1);
}

async function testDeleteExpense() {
  try {
    const response = await fetch(
      `http://localhost:3000/api/expenses/${expenseId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testDeleteExpense();
