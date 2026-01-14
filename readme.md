GearGuard: The Ultimate Maintenance Tracker

GearGuard is a maintenance management system designed to track company assets and streamline the lifecycle of repair jobs. By connecting Equipment (assets), specialized Teams, and Maintenance Requests, the system ensures efficient infrastructure management.

🚀 Key Functional Areas

    Equipment Management: Functions as a central database for assets like machines and computers, tracking serial numbers, warranty info, and physical locations.

Maintenance Teams: Supports specialized teams (e.g., IT, Mechanics) where specific technicians are linked to handle assigned tasks.

Request Lifecycle: Handles Corrective repairs for unplanned breakdowns and Preventive requests for routine checkups.

🔄 Business Logic & Workflow
The Breakdown (Corrective Flow)

When a breakdown occurs, any user can create a request. The system features Auto-Fill Logic that automatically fetches the Equipment category and assigned Maintenance Team from the equipment record. The request then moves through stages from New to In Progress and finally Repaired once the technician logs the work duration.

Routine Checkup (Preventive Flow)

Managers create preventive requests with a specific Scheduled Date. These jobs are automatically integrated into the Calendar View to provide technicians with visibility of their upcoming schedule.

🖥️ User Interface & UX Requirements

    Kanban Board: The primary technician workspace for managing requests across stages (New, In Progress, Repaired, Scrap) via drag-and-drop.

Calendar View: Displays all preventive maintenance requests and allows managers to click a date to schedule new tasks.

Smart Features: * Smart Buttons: Equipment forms display a button with a badge count of open requests for that specific asset.

    Scrap Logic: Moving a request to the "Scrap" stage flags the equipment as no longer usable.

Visual Indicators: Cards display technician avatars and highlight overdue requests in red.

📁 Required Project Structure
├── public/                 # Client-side interface
│   ├── index.html
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, KanbanBoard
│   │   ├── pages/          # Dashboard, EquipmentList, CalendarView
│   │   ├── services/       # API integration
│   │   └── App.jsx         # Router setup
└── server/                 # Backend logic & Database
    ├── index.js            # Entry point
    ├── middleware/         # Auth & Role-based access
    ├── models/             # Equipment, Request, Team, Technician
    ├── routes/             # API Endpoints
    └── seed.js             # Initial database seeding