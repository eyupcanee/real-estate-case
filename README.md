# EstateAdmin

Quick Links & Live Demos

- **Live Frontend Demo:** [https://real-estate-case.vercel.app/](https://real-estate-case.vercel.app/)
- **Live Backend API (Swagger UI):** [https://real-estate-case.onrender.com/api/docs](https://real-estate-case.onrender.com/api/docs)
- **Architecture & Design Document:** Please review the [DESIGN.md](./DESIGN.md) file for architectural decisions, database design, and future vision. _(Türkçe versiyon için [DESIGN-TR.md](./DESIGN-TR.md))_

> **Note:** The backend is hosted on Render's free tier which spins down after inactivity. If the API doesn't respond immediately, wait 40-50 seconds for it to wake up.

Follow the steps below to run this project on your local machine.

### Prerequisites

- Node.js v18+
- npm or yarn
- A MongoDB cluster (MongoDB Atlas or local instance)

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
Fill .env file with your port and mongo uri like .env.example.

```bash
cd backend
npm install
npm run start:dev
```

### 2. Frontend Setup

Open a terminal and navigate to the frontend directory:
Fill .env file with your api uri like .env.example.

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Test

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm run test
```

### Contact

- For any questions, feel free to reach out: eyupcanee@gmail.com
