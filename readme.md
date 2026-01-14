GearGuard: The Ultimate Maintenance Tracker

GearGuard is a specialized maintenance management system designed to centralize asset tracking and repair workflows. It bridges the gap between Equipment, specialized Teams, and service Requests to ensure company infrastructure remains operational.

🚀 Key Functional Areas

    Equipment Management: Serves as a central database for all company assets, tracking technical details, serial numbers, warranty information, and physical locations.

Maintenance Teams: Supports specialized units (e.g., IT Support, Mechanics) where technicians are assigned to specific equipment by default.

Request Lifecycle: Handles both Corrective (breakdowns) and Preventive (planned) maintenance jobs.

🔄 Business Logic & Workflow
The Breakdown (Corrective)

When a breakdown occurs, any user can initiate a request. The system features Auto-Fill Logic that automatically fetches the Equipment category and assigned Maintenance Team upon selecting the asset. The job then progresses from New to In Progress and finally Repaired once the technician logs the duration.

Routine Checkup (Preventive)

Managers can schedule planned maintenance for a future date. These requests are automatically integrated into a Calendar View, providing technicians with a clear timeline of upcoming routine tasks.

🖥️ User Interface & UX
    Kanban Board: The primary workspace where technicians move cards between stages (New, In Progress, Repaired, Scrap) via drag-and-drop.

Smart Buttons: Equipment forms include a "Maintenance" button displaying a badge count of open requests for that specific machine.

Visual Indicators: Cards display technician avatars and highlight overdue requests in red to prioritize urgent work.

Scrap Logic: Moving a request to the "Scrap" stage automatically flags the equipment as no longer usable.

📁 Project Structure
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

