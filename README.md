# Assignment Mentors

A modern web application built with Prisma, Next.js, shadcn/ui, and context-based state management. This project is designed for efficiency and user-friendliness, featuring a robust notification system implemented using React Context.

## Features
* Next.js for server-side rendering and API routes.
* Prisma as an ORM for efficient database interactions.
* shadcn/ui for a sleek, accessible UI design.
* Context API for managing global state, including notifications.
* Integrated notification system for real-time user updates.

## Technologies Used
### Core Stack
* Next.js: Full-stack React framework.
* Prisma: Database ORM.
* shadcn/ui: UI component library for consistent design.

### Additional Tools
* Context API: For global state and notification handling.
* Tailwind CSS: For custom styling.
* TypeScript: Ensures type safety throughout the project.

## Setup and Installation

### Prerequisites

Ensure you have the following installed on your system:

* Node.js (v16 or higher)
* npm or yarn
* A database supported by Prisma (e.g., PostgreSQL, MySQL, SQLite)

### Steps

* Clone the repository:
1). Clone the repository:
```
git clone [https://github.com/your-repo.git  ](https://github.com/ShadowAdi/assignment_mentors.git)
cd assignment-mentors  
```

2). Install dependencies:
```
npm install  
```

3). Configure the database:
* Create a .env file in the root directory.
* Add your database URL:
```
DATABASE_URL=your_database_connection_string  
```

4). Migrate the database:
```
npx prisma migrate dev  
```

5). Run the development server:
```
npm run dev  
# or  
yarn dev  
```

The app will be accessible at `http://localhost:3000.`
