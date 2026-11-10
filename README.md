

# Expense Tracker API

A RESTful API for managing personal expenses, built with Next.js, JavaScript, and MongoDB.

A project completed as part of the [roadmap.sh Backend Developer Projects](https://roadmap.sh/backend).

## Project Challenge

[roadmap.sh Expense Tracker API](https://roadmap.sh/projects/expense-tracker-api)

This project follows the Expense Tracker API challenge from roadmap.sh, which focuses on building a backend service for managing personal expenses and handling user authentication.

## Roadmap.sh Submission

**Project page:** [https://roadmap.sh/projects/expense-tracker-api](https://roadmap.sh/projects/expense-tracker-api)

Once the project is implemented and pushed to GitHub, submit the repository through the roadmap.sh project page to share your solution and receive community feedback.

---

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Create, retrieve, update, and delete expenses
- Filter expenses by week, month, or the last three calendar months
- Custom date-range filtering
- Expense categories
- User-specific expense management
- MongoDB database integration
- Input validation and error handling

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** JavaScript
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **JWT Library:** jose

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- A MongoDB Atlas account or MongoDB database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/EbrahimRizvi14/Expense-Tracker-API.git
```

2. Navigate into the project directory:

```bash
cd Expense-Tracker-API
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env.local` file in the root directory.

5. Add your environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Replace the placeholder values with your own credentials. Never upload `.env.local` or expose your database credentials.

6. Start the development server:

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in an existing user |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses` | Retrieve expenses |
| PUT | `/api/expenses/[id]` | Update an expense |
| DELETE | `/api/expenses/[id]` | Delete an expense |

---

## Authentication

The API uses JWT (JSON Web Tokens) to authenticate users.

After successfully logging in, the API returns a token.

Include this token in the `Authorization` header when accessing protected endpoints:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Requests without a valid token will receive a `401 Unauthorized` response.

## Request Examples

### Register a User

**POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Log In

**POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create an Expense

**POST** `/api/expenses`

```json
{
  "title": "Groceries",
  "amount": 45.50,
  "category": "groceries"
}
```

Include the JWT in the Authorization header.

### Update an Expense

**PUT** `/api/expenses/EXPENSE_ID`

```json
{
  "title": "Weekly Groceries",
  "amount": 60,
  "category": "groceries"
}
```

### Delete an Expense

**DELETE** `/api/expenses/EXPENSE_ID`

Include the JWT in the Authorization header.

---

## Expense Filtering

The API supports preset filters and custom date ranges.

### Preset Filters

Use the `filter` query parameter:

| Filter | Description |
|---|---|
| `week` | Expenses from the current Monday onward |
| `month` | Expenses from the beginning of the current month |
| `3months` | Expenses from the beginning of the current month and previous two calendar months |

Example:

```http
GET /api/expenses?filter=month
```

### Custom Date Range

Use `startDate` and `endDate` query parameters.

Both dates must be provided in `YYYY-MM-DD` format.

Example:

```http
GET /api/expenses?startDate=2026-11-01&endDate=2026-11-10
```

The custom date range includes both the start and end dates.

The API uses Pakistan Standard Time (UTC+5) when calculating date boundaries.

---

## Expense Categories

Expenses can belong to one of the following categories:

- `groceries`
- `leisure`
- `electronics`
- `utilities`

## Data Validation

The API validates incoming data before processing requests.

Examples include:

- Required fields must be provided.
- Passwords must contain at least 8 characters.
- Expense titles cannot be empty.
- Expense amounts must be greater than zero.
- Expense categories must match the supported categories.
- Custom date ranges must contain valid dates.
- The start date cannot be later than the end date.

## HTTP Status Codes

| Status Code | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created successfully |
| `400` | Invalid request data |
| `401` | Authentication required or invalid |
| `404` | Resource not found |
| `409` | Resource conflict, such as an existing email |
| `500` | Internal server error |

---

## Project Structure

```text
expense-tracker-api/
│
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/
│       │   │   └── route.js
│       │   └── register/
│       │       └── route.js
│       │
│       └── expenses/
│           ├── [id]/
│           │   └── route.js
│           └── route.js
│
├── lib/
│   ├── models/
│   │   ├── expense.js
│   │   └── user.js
│   │
│   ├── validation/
│   │   └── auth.js
│   │
│   ├── auth.js
│   └── mongodb.js
│
├── scripts/
│   └── test-get-expense.js
│
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

## Testing

The API endpoints were tested using reusable JavaScript scripts and HTTP requests.

Tests covered:

- User registration
- User login
- JWT authentication
- Creating expenses
- Retrieving expenses
- Updating expenses
- Deleting expenses
- Preset date filtering
- Custom date-range filtering
- Invalid request handling

## Future Improvements

- Add pagination for expense retrieval.
- Add expense statistics and summaries.
- Add monthly spending reports.
- Add more advanced filtering and sorting.
- Build a frontend dashboard.

## License

No license has been specified yet.

