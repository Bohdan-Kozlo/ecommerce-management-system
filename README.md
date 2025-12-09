# E-commerce Management System

**E-commerce Management System** developed as a **course project** for the "**Software Documentation and Design Patterns**" course.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ecommerce-management-system
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Copy the example environment file and configure your variables:

    > **Note:** You need to set up a PostgreSQL database, Stripe account, Google Cloud Console project, and Supabase project to get all credentials.

4.  **Database Setup:**

    Run Prisma migrations to set up the database schema:

    ```bash
    npm run db:migrate -w apps/backend
    ```

    (Optional) Seed the database with initial data:

    ```bash
    npm run db:seed -w apps/backend
    ```

### Running the Application

This project uses **Turborepo** to manage the monorepo. You can run both the backend and frontend simultaneously from the root directory.

**Development Mode:**

```bash
npm run dev
```

- **Backend API:** http://localhost:4000
- **Frontend:** http://localhost:3000

### Project Structure

- `apps/backend`: NestJS application (API, Database, Auth)
- `apps/web`: Next.js application (Frontend, Admin Panel)
- `packages/`: Shared configurations (ESLint, TypeScript)

## 🛠 Technologies

- **Backend:** NestJS, Prisma, PostgreSQL, Passport.js (Google OAuth), Stripe API
- **Frontend:** Next.js 15, Tailwind CSS, shadcn
