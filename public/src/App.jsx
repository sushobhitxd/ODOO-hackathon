import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, Package, Users, Wrench, BarChart3, Plus, Search, Filter, X } from 'lucide-react';

// API Configuration
const API_URL = 'http://localhost:5000/api';

// API Service
const api = {
  equipment: {
    getAll: (params) => fetch(`${API_URL}/equipment?${new URLSearchParams(params)}`).then(r => r.json()),
    getById: (id) => fetch(`${API_URL}/equipment/${id}`).then(r => r.json()),
    getRequests: (id) => fetch(`${API_URL}/equipment/${id}/requests`).then(r => r.json()),
    getRequestCount: (id) => fetch(`${API_URL}/equipment/${id}/requests/count`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/equipment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/equipment/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    delete: (id) => fetch(`${API_URL}/equipment/${id}`, { method: 'DELETE' }).then(r => r.json())
  },
  teams: {
    getAll: () => fetch(`${API_URL}/teams`).then(r => r.json()),
    getById: (id) => fetch(`${API_URL}/teams/${id}`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/teams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/teams/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
  },
  technicians: {
    getAll: (teamId) => fetch(`${API_URL}/technicians${teamId ? `?teamId=${teamId}` : ''}`).then(r => r.json()),
    getById: (id) => fetch(`${API_URL}/technicians/${id}`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/technicians`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/technicians/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
  },
  requests: {
    getAll: (params) => fetch(`${API_URL}/requests?${new URLSearchParams(params)}`).then(r => r.json()),
    getById: (id) => fetch(`${API_URL}/requests/${id}`).then(r => r.json()),
    getPreventive: () => fetch(`${API_URL}/requests/type/preventive`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    updateStage: (id, stage) => fetch(`${API_URL}/requests/${id}/stage`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) }).then(r => r.json()),
    assign: (id, technicianId) => fetch(`${API_URL}/requests/${id}/assign`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ technicianId }) }).then(r => r.json())
  },
  reports: {
    getDashboard: () => fetch(`${API_URL}/reports/dashboard`).then(r => r.json()),
    getByTeam: () => fetch(`${API_URL}/reports/by-team`).then(r => r.json()),
    getByCategory: () => fetch(`${API_URL}/reports/by-category`).then(r => r.json()),
    getByStage: () => fetch(`${API_URL}/reports/by-stage`).then(r => r.json())
  }
};

// Main App Component
export default function GearGuardApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [teams, setTeams] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [teamsData, techniciansData, equipmentData, requestsData, statsData] = await Promise.all([
        api.teams.getAll(),
        api.technicians.getAll(),
        api.equipment.getAll({}),
        api.requests.getAll({}),
        api.reports.getDashboard()
      ]);
      setTeams(teamsData);
      setTechnicians(techniciansData);
      setEquipment(equipmentData);
      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const refreshRequests = async () => {
    const data = await api.requests.getAll({});
    setRequests(data);
    const statsData = await api.reports.getDashboard();
    setStats(statsData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && <Dashboard stats={stats} />}
        {currentView === 'kanban' && <KanbanBoard requests={requests} technicians={technicians} onUpdate={refreshRequests} />}
        {currentView === 'calendar' && <CalendarView requests={requests} equipment={equipment} teams={teams} technicians={technicians} onUpdate={refreshRequests} />}
        {currentView === 'equipment' && <EquipmentView equipment={equipment} teams={teams} technicians={technicians} onUpdate={loadInitialData} />}
        {currentView === 'teams' && <TeamsView teams={teams} technicians={technicians} onUpdate={loadInitialData} />}
        {currentView === 'reports' && <ReportsView />}
      </div>
    </div>
  );
}

// Header Component
function Header({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'kanban', label: 'Maintenance Board', icon: Wrench },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'equipment', label: 'Equipment', icon: Package },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">GearGuard</h1>
          </div>
          <nav className="flex space-x-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

// Dashboard Component
function Dashboard({ stats }) {
  if (!stats) return <div className="text-center py-12">Loading...</div>;

  const statCards = [
    { label: 'Total Requests', value: stats.totalRequests, icon: Wrench, color: 'blue' },
    { label: 'New Requests', value: stats.newRequests, icon: AlertCircle, color: 'yellow' },
    { label: 'In Progress', value: stats.inProgressRequests, icon: Clock, color: 'purple' },
    { label: 'Completed', value: stats.completedRequests, icon: CheckCircle, color: 'green' },
    { label: 'Overdue', value: stats.overdueRequests, icon: AlertCircle, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: `var(--${stat.color}-500)` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Kanban Board Component
function KanbanBoard({ requests, technicians, onUpdate }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const stages = ['New', 'In Progress', 'Repaired', 'Scrap'];

  const handleDragStart = (request) => {
    setDraggedItem(request);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (stage) => {
    if (draggedItem && draggedItem.stage !== stage) {
      try {
        await api.requests.updateStage(draggedItem._id, stage);
        onUpdate();
      } catch (error) {
        console.error('Error updating stage:', error);
      }
    }
    setDraggedItem(null);
  };

  const getStageColor = (stage) => {
    const colors = {
      'New': 'bg-blue-100 border-blue-300',
      'In Progress': 'bg-purple-100 border-purple-300',
      'Repaired': 'bg-green-100 border-green-300',
      'Scrap': 'bg-red-100 border-red-300'
    };
    return colors[stage] || 'bg-gray-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Maintenance Board</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map(stage => (
          <div
            key={stage}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage)}
            className="bg-gray-100 rounded-lg p-4 min-h-[500px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{stage}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                {requests.filter(r => r.stage === stage).length}
              </span>
            </div>
            <div className="space-y-3">
              {requests.filter(r => r.stage === stage).map(request => (
                <RequestCard
                  key={request._id}
                  request={request}
                  onDragStart={handleDragStart}
                  technicians={technicians}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateRequestModal
          onClose={() => setShowModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

// Request Card Component
function RequestCard({ request, onDragStart, technicians, onUpdate }) {
  const isOverdue = request.isOverdue && request.stage !== 'Repaired' && request.stage !== 'Scrap';

  const handleAssign = async (techId) => {
    try {
      await api.requests.assign(request._id, techId);
      onUpdate();
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(request)}
      className={`bg-white rounded-lg p-4 shadow border-l-4 cursor-move hover:shadow-lg transition-shadow ${
        isOverdue ? 'border-red-500' : 'border-blue-500'
      }`}
    >
      {isOverdue && (
        <div className="flex items-center space-x-1 text-red-600 text-xs font-semibold mb-2">
          <AlertCircle className="w-3 h-3" />
          <span>OVERDUE</span>
        </div>
      )}
      
      <h4 className="font-semibold text-gray-900 mb-2">{request.subject}</h4>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4" />
          <span>{request.equipment?.name || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>{new Date(request.scheduledDate).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            request.type === 'Corrective' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {request.type}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            request.priority === 'Critical' ? 'bg-red-100 text-red-700' :
            request.priority === 'High' ? 'bg-orange-100 text-orange-700' :
            request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {request.priority}
          </span>
        </div>
      </div>

      {request.assignedTechnician ? (
        <div className="mt-3 flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
            {request.assignedTechnician.avatar}
          </div>
          <span className="text-sm text-gray-700">{request.assignedTechnician.name}</span>
        </div>
      ) : (
        <select
          onChange={(e) => handleAssign(e.target.value)}
          className="mt-3 w-full text-sm border border-gray-300 rounded px-2 py-1"
          value=""
        >
          <option value="">Assign Technician...</option>
          {technicians.map(tech => (
            <option key={tech._id} value={tech._id}>{tech.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ requests, equipment, teams, technicians, onUpdate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const preventiveRequests = requests.filter(r => r.type === 'Preventive');

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getRequestsForDate = (date) => {
    return preventiveRequests.filter(r => {
      const reqDate = new Date(r.scheduledDate);
      return reqDate.toDateString() === date.toDateString();
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Preventive Maintenance Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-900">{monthName}</span>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="bg-white p-2 h-24"></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayRequests = getRequestsForDate(date);
            
            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDate(date);
                  setShowModal(true);
                }}
                className="bg-white p-2 h-24 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="font-semibold text-gray-700 mb-1">{day}</div>
                <div className="space-y-1">
                  {dayRequests.slice(0, 2).map(req => (
                    <div
                      key={req._id}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate"
                    >
                      {req.equipment?.name}
                    </div>
                  ))}
                  {dayRequests.length > 2 && (
                    <div className="text-xs text-gray-500">+{dayRequests.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <CreateRequestModal
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
          }}
          onUpdate={onUpdate}
          preselectedDate={selectedDate}
          preventiveOnly={true}
        />
      )}
    </div>
  );
}

// Equipment View Component
function EquipmentView({ equipment, teams, technicians, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'All' || eq.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', 'Production', 'IT', 'Warehouse', 'Maintenance', 'Admin'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Equipment</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Equipment</span>
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map(eq => (
          <EquipmentCard
            key={eq._id}
            equipment={eq}
            onClick={() => setSelectedEquipment(eq)}
          />
        ))}
      </div>

      {showModal && (
        <EquipmentModal
          equipment={null}
          teams={teams}
          technicians={technicians}
          onClose={() => setShowModal(false)}
          onUpdate={onUpdate}
        />
      )}

      {selectedEquipment && (
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

// Equipment Card Component
function EquipmentCard({ equipment, onClick }) {
  const statusColors = {
    'Active': 'bg-green-100 text-green-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    'Scrapped': 'bg-red-100 text-red-800',
    'Inactive': 'bg-gray-100 text-gray-800'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg cursor-pointer transition-shadow border border-gray-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{equipment.name}</h3>
          <p className="text-sm text-gray-500">{equipment.serialNumber}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[equipment.status]}`}>
          {equipment.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>Department:</span>
          <span className="font-medium text-gray-900">{equipment.department}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Category:</span>
          <span className="font-medium text-gray-900">{equipment.category}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Location:</span>
          <span className="font-medium text-gray-900">{equipment.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Team:</span>
          <span className="font-medium text-gray-900">{equipment.team?.name}</span>
        </div>
      </div>
    </div>
  );
}

// Teams View Component
function TeamsView({ teams, technicians, onUpdate }) {
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teams & Technicians</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team</span>
          </button>
          <button
            onClick={() => setShowTechModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map(team => (
          <TeamCard key={team._id} team={team} technicians={technicians.filter(t => t.team._id === team._id)} />
        ))}
      </div>

      {showTeamModal && <TeamModal onClose={() => setShowTeamModal(false)} onUpdate={onUpdate} />}
      {showTechModal && <TechnicianModal teams={teams} onClose={() => setShowTechModal(false)} onUpdate={onUpdate} />}
    </div>
  );
}

// Team Card Component
function TeamCard({ team, technicians }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-xl">{team.name}</h3>
          <p className="text-sm text-gray-500">{team.specialization}</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {technicians.length} Members
        </div>
      </div>

      {team.description && (
        <p className="text-gray-600 text-sm mb-4">{team.description}</p>
      )}

      <div className="space-y-2">
        <h4 className="font-semibold text-gray-700 text-sm">Team Members:</h4>
        {technicians.length > 0 ? (
          technicians.map(tech => (
            <div key={tech._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                {tech.avatar}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{tech.name}</p>
                <p className="text-xs text-gray-500">{tech.email}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm italic">No members assigned</p>
        )}
      </div>
    </div>
  );
}

// Reports View Component
function ReportsView() {
  const [byTeam, setByTeam] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byStage, setByStage] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const [teamData, categoryData, stageData] = await Promise.all([
      api.reports.getByTeam(),
      api.reports.getByCategory(),
      api.reports.getByStage()
    ]);
    setByTeam(teamData);
    setByCategory(categoryData);
    setByStage(stageData);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Requests by Team</h3>
          <div className="space-y-3">
            {byTeam.map(item => (
              <div key={item.teamId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{item.teamName}</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Requests by Category</h3>
          <div className="space-y-3">
            {byCategory.map(item => (
              <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-900">{item.category}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-4">Requests by Stage</h3>
          <div className="grid grid-cols-4 gap-4">
            {byStage.map(item => (
              <div key={item.stage} className="text-center p-4 bg-gray-50 rounded">
                <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                <p className="text-sm text-gray-600 mt-1">{item.stage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Request Modal Component
function CreateRequestModal({ onClose, onUpdate, preselectedDate = null, preventiveOnly = false }) {
  const [equipment, setEquipment] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipment: '',
    type: preventiveOnly ? 'Preventive' : 'Corrective',
    priority: 'Medium',
    scheduledDate: preselectedDate ? preselectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    createdBy: 'Current User'
  });

  useEffect(() => {
    api.equipment.getAll({}).then(setEquipment);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.requests.create(formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Create Maintenance Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g., Oil leak detected"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Describe the issue or maintenance task..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment *</label>
            <select
              required
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select equipment...</option>
              {equipment.map(eq => (
                <option key={eq._id} value={eq._id}>{eq.name} ({eq.serialNumber})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={preventiveOnly}
              >
                <option value="Corrective">Corrective (Breakdown)</option>
                <option value="Preventive">Preventive (Routine)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date *</label>
            <input
              type="date"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Equipment Modal Component
function EquipmentModal({ equipment, teams, technicians, onClose, onUpdate }) {
  const [formData, setFormData] = useState(equipment || {
    name: '',
    serialNumber: '',
    department: 'Production',
    assignedTo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date().toISOString().split('T')[0],
    location: '',
    category: 'Machinery',
    team: '',
    defaultTechnician: '',
    status: 'Active',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (equipment) {
        await api.equipment.update(equipment._id, formData);
      } else {
        await api.equipment.create(formData);
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {equipment ? 'Edit Equipment' : 'Add Equipment'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Production">Production</option>
                <option value="IT">IT</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Admin">Admin</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Machinery">Machinery</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Tools">Tools</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To *</label>
            <input
              type="text"
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Employee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry *</label>
              <input
                type="date"
                required
                value={formData.warrantyExpiry}
                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Team *</label>
              <select
                required
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select team...</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Technician</label>
              <select
                value={formData.defaultTechnician}
                onChange={(e) => setFormData({ ...formData, defaultTechnician: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">None</option>
                {technicians.map(tech => (
                  <option key={tech._id} value={tech._id}>{tech.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {equipment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Equipment Details Modal Component
function EquipmentDetailsModal({ equipment, onClose, onUpdate }) {
  const [requests, setRequests] = useState([]);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    loadRequests();
  }, [equipment]);

  const loadRequests = async () => {
    const [reqData, countData] = await Promise.all([
      api.equipment.getRequests(equipment._id),
      api.equipment.getRequestCount(equipment._id)
    ]);
    setRequests(reqData);
    setOpenCount(countData.count);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{equipment.name}</h3>
            <p className="text-sm text-gray-500">{equipment.serialNumber}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wrench className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Maintenance Requests</p>
                  <p className="text-sm text-gray-600">{openCount} open requests</p>
                </div>
              </div>
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold">
                {requests.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Equipment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{equipment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{equipment.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{equipment.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="font-medium">{equipment.assignedTo}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Warranty & Team</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Date:</span>
                  <span className="font-medium">{new Date(equipment.purchaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Warranty Expiry:</span>
                  <span className="font-medium">{new Date(equipment.warrantyExpiry).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team:</span>
                  <span className="font-medium">{equipment.team?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Default Tech:</span>
                  <span className="font-medium">{equipment.defaultTechnician?.name || 'None'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Maintenance History</h4>
            {requests.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {requests.map(req => (
                  <div key={req._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{req.subject}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        req.stage === 'New' ? 'bg-blue-100 text-blue-700' :
                        req.stage === 'In Progress' ? 'bg-purple-100 text-purple-700' :
                        req.stage === 'Repaired' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.stage}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{req.type}</span>
                      <span>•</span>
                      <span>{new Date(req.scheduledDate).toLocaleDateString()}</span>
                      {req.assignedTechnician && (
                        <>
                          <span>•</span>
                          <span>{req.assignedTechnician.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">No maintenance history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Team Modal Component
function TeamModal({ onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'General',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.teams.create(formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Add Team</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
            <select
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="IT">IT</option>
              <option value="General">General</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Technician Modal Component
function TechnicianModal({ teams, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    team: '',
    specialization: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.technicians.create(formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error creating technician:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Add Technician</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
            <select
              required
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select team...</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Technician
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}