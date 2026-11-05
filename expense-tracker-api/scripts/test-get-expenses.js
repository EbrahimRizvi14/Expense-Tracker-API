const token = process.argv[2];

if (!token) {
  console.error("Please provide a JWT token.");
  process.exit(1);
}

async function testGetExpenses() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/expenses",
      {
        method: "GET",
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

testGetExpenses();