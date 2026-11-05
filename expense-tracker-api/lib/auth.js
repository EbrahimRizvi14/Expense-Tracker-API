
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function verifyAuth(request) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get("Authorization");

    // Check whether the token exists and uses Bearer format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        message: "Authentication required.",
      };
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const { payload } = await jwtVerify(token, secret);

    // Make sure the token contains a user ID
    if (typeof payload.userId !== "string" || !payload.userId) {
      return {
        success: false,
        message: "Invalid authentication token.",
      };
    }

    // Return the authenticated user's ID
    return {
      success: true,
      userId: payload.userId,
    };

  } catch (error) {
    // Token is invalid, expired, or cannot be verified
    return {
      success: false,
      message: "Invalid or expired authentication token.",
    };
  }
}
