# Recipedia Frontend

The modern user interface for Recipedia, built with the latest web technologies to ensure a smooth, accessible, and beautiful user experience.

## Key Features

* **Modern UI/UX:** Built with Shadcn UI (Radix Primitives) and Tailwind CSS v4 for a polished look.
* **Data Visualization:** Interactive charts using Recharts and powerful data tables via TanStack Table.
* **Utilities:** Export recipes to PDF or Image.
* **Robust Forms:** Type-safe form handling with React Hook Form and Zod validation.
* **Responsive:** Fully optimized for mobile, tablet, and desktop devices.

## Tech Stack

* **Core:** React 19, Vite
* **Routing:** React Router DOM v7
* **Styling:** Tailwind CSS 4, Tailwind Animate
* **UI Components:** Radix UI (Shadcn UI), Lucide React (Icons)
* **HTTP Client:** Axios

## Installation & Setup

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory to connect to the backend:

    ```env
    # URL of your backend API
    VITE_API_URL=http://localhost:5000/api
    ```

3.  **Run the Application**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser to view the app.

## Available Scripts

* `npm run dev`: Starts the development server.
* `npm run build`: Builds the app for production to the `dist` folder.
* `npm run preview`: Locally preview the production build.
* `npm run lint`: Runs ESLint to check for code quality.
