
const loginData = {
  email: "test@example.com",
  password: "testPassword123",
};

async function testLogin() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);

  } catch (error) {
    console.error("Login test failed:", error.message);
  }
}

testLogin();
