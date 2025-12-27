const technician = require("./server/models/technician")

User Schmea(Technician.js)
- has two-role system -> Employee and technician (default: employee)
- 'name', 'unique email', 'password'
- avatar
- accessed via _id

Teams schema(Team.js)
- 'unique name', 'specizialization'
- members -> arrat of objectIds linking to Technician
- used by equipment

Equipment schema(equipment.js) 
- details about the equipment -> name, serial number, location, category and dept., lifecycle( like status, purchaseDate, warrantyExpiry)

Requests Schema (request.js)
- subject, description, priority
- linked to all three of other schema 
- dates -> scheduleddate, compeletedDate
- accessed via '_id'


client/
├── public/                # Static assets
│   └── vite.svg
│
├── src/
│   ├── assets/            # Images, Global CSS
│
│   ├── components/        # Reusable UI Blocks
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── KanbanBoard.jsx
│   │   └── ProtectedRoute.jsx
│
│   ├── context/           # Global State
│   │   └── AuthContext.jsx # Stores "Who is logged in?"
│
│   ├── pages/             # Full Pages
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EquipmentList.jsx
│   │   └── CalendarView.jsx
│
│   ├── services/          # API Calls (Axios)
│   │   ├── api.js         # Base setup
│   │   └── endpoints.js   # All your fetch() calls
│
│   ├── App.jsx            # Router Setup
│   └── main.jsx           # Entry Point
│
├── .env.local             # VITE_API_URL=http://localhost:5000
├── index.html
├── package.json
└── vite.config.js

