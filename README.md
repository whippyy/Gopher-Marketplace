# Gopher Marketplace

Gopher Marketplace is a web application that allows students at the University of Minnesota to buy and sell goods. It is built with a modern tech stack, featuring a Next.js frontend and a .NET backend.

## Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) - React framework for server-rendered applications.
    *   [React](https://reactjs.org/) - JavaScript library for building user interfaces.
    *   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
    *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
    *   [Firebase Authentication](https://firebase.google.com/docs/auth) - For user authentication with UMN emails.
*   **Backend:**
    *   [.NET 9](https://dotnet.microsoft.com/en-us/download/dotnet/9.0) - A free, cross-platform, open-source developer platform.
    *   [C#](https://docs.microsoft.com/en-us/dotnet/csharp/) - A modern, object-oriented, and type-safe programming language.
    *   [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) - A modern object-database mapper for .NET.
    *   [SQLite](https://www.sqlite.org/index.html) - A C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.
*   **DevOps:**
    *   [Docker](https://www.docker.com/) - A set of platform as a service products that use OS-level virtualization to deliver software in packages called containers.
    *   [Vercel](https://vercel.com/) - A cloud platform for static sites and Serverless Functions.
    *   [Azure](https://azure.microsoft.com/en-us/) - A cloud computing service created by Microsoft for building, testing, deploying, and managing applications and services through Microsoft-managed data centers.

## Getting Started

### Prerequisites

*   [.NET 9 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
*   [Node.js](https://nodejs.org/en/download/)
*   [Docker](https://www.docker.com/products/docker-desktop/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Gopher-Marketplace.git
    cd Gopher-Marketplace
    ```
2.  **Install frontend dependencies:**
    ```bash
    cd client
    npm install
    ```
3.  **Install backend dependencies:**
    ```bash
    cd ../server
    dotnet restore
    ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd server
    dotnet run
    ```
2.  **Start the frontend development server:**
    ```bash
    cd client
    npm run dev
    ```
The application will be available at `http://localhost:3000`.

## Features

*   **User Authentication:** Secure user authentication using Firebase with UMN email verification.
*   **Listings:** Users can create, read, update, and delete listings for items they want to sell.
*   **Search and Filtering:** Client-side search and filtering of listings.
*   **User Profiles:** Users have profiles to manage their listings and view their activity.

## Roadmap

*   **Real-time Messaging:** Implement real-time messaging between buyers and sellers.
*   **Rating System:** Allow users to rate each other after a transaction.
*   **Admin Moderation:** Manual admin moderation of listings.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.