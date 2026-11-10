
const token = process.argv[2];
const startDate = process.argv[3];
const endDate = process.argv[4];

console.log("Arguments:", process.argv.slice(2));

if (!token) {
  console.error("Please provide a JWT token.");
  process.exit(1);
}

async function testGetExpenses() {
  try {
    const url = new URL("http://localhost:3000/api/expenses");

    if (startDate && endDate) {
      url.searchParams.set("startDate", startDate);
      url.searchParams.set("endDate", endDate);
    }

    console.log("Request URL:", url.toString());

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testGetExpenses();
