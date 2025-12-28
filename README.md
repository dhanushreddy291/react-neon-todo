<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://neon.com/brand/neon-logo-dark-color.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://neon.com/brand/neon-logo-light-color.svg">
  <img width="250px" alt="Neon Logo fallback" src="https://neon.com/brand/neon-logo-dark-color.svg">
</picture>

### Serverless Todo App with Neon Auth & Data API

A fully functional React Todo application that communicates directly with the database - no backend server required.

---

Building secure applications typically requires a backend server to handle authentication, session management, and database connections. This creates complexity and maintenance overhead.

This repository demonstrates a **Serverless/No-Backend** architecture using [**Neon Auth**](https://neon.com/docs/auth/overview) and the [**Neon Data API**](https://neon.com/docs/data-api/get-started). By leveraging **Row-Level Security (RLS)** in Postgres, we can securely query the database directly from the frontend, ensuring users only access their own data.

Follow the full guide on [Neon: Getting started with Neon Auth and Neon Data API using React](https://neon.com/guides/react-neon-auth-data-api) for a step-by-step walkthrough.

## ✨ Key features

-   **Zero Backend Code**: No Express, NestJS, or Next.js API routes. The React app talks directly to Neon.
-   **Identity in the Database**: User accounts, sessions, and profiles are stored in the `neon_auth` schema within your database.
-   **Secure by Default**: Database access is protected by Postgres Row-Level Security (RLS) policies.
-   **Neon Data API**: Uses secure HTTP requests (via [`@neondatabase/neon-js`](https://www.npmjs.com/package/@neondatabase/neon-js)) instead of persistent TCP connections.
-   **Type-Safe Database**: End-to-end type safety generated from your database schema.

## 🚀 Get started

### Prerequisites

Before you start, you'll need:

1.  A **[Neon account](https://console.neon.tech)**.
2.  **[Node.js](https://nodejs.org/)** (v18+) installed locally.

### 1. Initial setup

Clone this repository and install the dependencies.

```bash
# Clone the repository
git clone https://github.com/dhanushreddy291/react-neon-todo.git
cd react-neon-todo

# Install dependencies
npm install
```

### 2. Configure Neon

1.  Create a new project in the [Neon Console](https://console.neon.tech).
2.  Navigate to the **Data API** page.
3.  Select **Neon Auth** as the authentication provider and click **Enable**.
4.  Toggle **Grant public schema access** to ON.

### 3. Environment Variables

Create a `.env` file in the root directory.

```bash
cp .env.example .env
```

Update the `.env` file with your Neon project details. Update the following variables:

-  `DATABASE_URL`: Found in the Neon Console under **Dashboard -> Connect**.
    <p align="left">
      <img src="./images/connection_details.png" alt="Neon Connection Details" width="500"/>
    </p>
-  `VITE_NEON_DATA_API_URL`: Found in **Data API** page.
    <p align="left">
      <img src="./images/data-api-enabled.png" alt="Neon Data API URL" width="500"/>
    </p>
-  `VITE_NEON_AUTH_URL`: Found in **Auth** page.
    <p align="left">
      <img src="./images/neon-auth-base-url.png" alt="Neon Auth URL" width="500"/> 
    </p>

```env
# Database connection for Drizzle Migrations
# Found in Dashboard -> Connection Details (Pooled)
DATABASE_URL="postgresql://[user]:[password]@[neon_hostname]/[dbname]?sslmode=require"

# Public variables for the React App
VITE_NEON_DATA_API_URL="https://ep-xxx.neon.tech/neondb/rest/v1"
VITE_NEON_AUTH_URL="https://ep-xxx.neon.tech/neondb/auth"
```

### 4. Database Setup

We use Drizzle ORM to push the schema and RLS policies to the database.

```bash
# Apply the database migrations
npx drizzle-kit migrate
```

> This creates the `todos` table and applies the `crudPolicy` which enforces that users can only see their own data.

### 5. Run the App

Start the development server.

```bash
npm run dev
```

Open `http://localhost:5173` to see the app. You will be redirected to the sign-in page. You can create a new account via Email or Google OAuth and start adding Todos.

## ⚙️ How it works

This architecture relies on three core concepts working together:

1.  **Authentication**:
    The app uses `@neondatabase/neon-js` to handle sign-up and sign-in. When a user logs in, Neon Auth issues a session.

2.  **Data Access**:
    When the React app fetches Todos, it sends an HTTP request to the **Neon Data API**. The SDK automatically attaches the user's authentication token to the request header.

    ```typescript
    // src/pages/TodoApp.tsx
    const { data } = await neon.from('todos').select('*');
    ```

3.  **Security (RLS)**:
    The Data API receives the request and identifies the user. It then executes the SQL query against Postgres. The **Row-Level Security** policy we defined in `src/db/schema.ts` ensures the query only returns rows belonging to that user.

    ```sql
    -- The policy enforces this logic automatically in the database
    CREATE POLICY "Users can only see their own todos"
    ON "todos"
    AS PERMISSIVE
    FOR SELECT TO "authenticated"
    USING ((select auth.user_id() = "todos"."user_id"::text));
    ```

## 📚 Learn more

-   [Neon Guide: Getting started with Neon Auth and Neon Data API using React](https://neon.com/guides/react-neon-auth-data-api)
-   [Neon Auth Overview](https://neon.com/docs/auth/overview)
-   [Neon Data API Overview](https://neon.com/docs/data-api/overview)
-   [Row-Level Security (RLS) Guide](https://neon.com/docs/guides/row-level-security)
-   [Simplify RLS with Drizzle](https://neon.com/docs/guides/rls-drizzle)
-   [Drizzle ORM with Neon](https://orm.drizzle.team/docs/get-started-postgresql#neon)
