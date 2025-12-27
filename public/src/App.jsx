import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Settings, BarChart3, Plus, X, Search } from 'lucide-react';

// API Base URL - REPLACE THIS WITH YOUR BACKEND URL
const API_URL = 'http://localhost:5000/api';

const GearGuard = () => {
  const [view, setView] = useState('kanban');
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [draggedRequest, setDraggedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  
  const [newRequest, setNewRequest] = useState({
    subject: '',
    description: '',
    equipment: '',
    type: 'Corrective',
    priority: 'Medium',
    scheduledDate: new Date().toISOString().split('T')[0],
    createdBy: 'Current User'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, eqRes, teamRes, techRes, reportRes] = await Promise.all([
        fetch(`${API_URL}/requests`),
        fetch(`${API_URL}/equipment`),
        fetch(`${API_URL}/teams`),
        fetch(`${API_URL}/technicians`),
        fetch(`${API_URL}/reports/dashboard`)
      ]);

      setRequests(await reqRes.json());
      setEquipment(await eqRes.json());
      setTeams(await teamRes.json());
      setTechnicians(await techRes.json());
      setReports(await reportRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStage = async (requestId, newStage) => {
    try {
      const res = await fetch(`${API_URL}/requests/${requestId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  const createRequest = async () => {
    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      
      if (res.ok) {
        setShowNewRequestModal(false);
        setNewRequest({
          subject: '',
          description: '',
          equipment: '',
          type: 'Corrective',
          priority: 'Medium',
          scheduledDate: new Date().toISOString().split('T')[0],
          createdBy: 'Current User'
        });
        fetchData();
      }
    } catch (err) {
      console.error('Error creating request:', err);
    }
  };

  const handleDragStart = (e, request) => {
    setDraggedRequest(request);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    if (draggedRequest && draggedRequest.stage !== newStage) {
      updateRequestStage(draggedRequest._id, newStage);
    }
    setDraggedRequest(null);
  };

  const stages = [
    { name: 'New', icon: '⏱️', color: 'border-blue-500' },
    { name: 'In Progress', icon: '🔧', color: 'border-yellow-500' },
    { name: 'Repaired', icon: '✅', color: 'border-green-500' },
    { name: 'Scrap', icon: '🗑️', color: 'border-red-500' }
  ];

  const KanbanBoard = () => (
    <div className="p-6">
      <div className="grid grid-cols-4 gap-4">
        {stages.map(stage => {
          const stageRequests = requests.filter(r => r.stage === stage.name);
          return (
            <div 
              key={stage.name}
              className="bg-gray-50 rounded-lg"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.name)}
            >
              <div className="p-4 border-b bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{stage.icon}</span>
                    <h3 className="font-semibold text-gray-700">{stage.name}</h3>
                  </div>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                    {stageRequests.length}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-3 min-h-[500px]">
                {stageRequests.map(req => (
                  <RequestCard 
                    key={req._id} 
                    request={req}
                    onDragStart={handleDragStart}
                    borderColor={stage.color}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const RequestCard = ({ request, onDragStart, borderColor }) => {
    const isOverdue = request.isOverdue && request.stage !== 'Repaired' && request.stage !== 'Scrap';
    
    return (
      <div 
        draggable
        onDragStart={(e) => onDragStart(e, request)}
        className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${borderColor} cursor-move hover:shadow-md transition`}
      >
        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 mb-1">{request.subject}</h4>
          <p className="text-sm text-gray-600">{request.equipment?.name || 'No Equipment'}</p>
        </div>
        
        <div className="mb-3">
          <span className={`text-xs px-2 py-1 rounded ${
            request.type === 'Preventive' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {request.type}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {new Date(request.scheduledDate).toLocaleDateString('en-US', { 
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </span>
          
          {request.assignedTechnician ? (
            <div 
              className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold"
              title={request.assignedTechnician.name}
            >
              {request.assignedTechnician.avatar || request.assignedTechnician.name?.substring(0, 2).toUpperCase()}
            </div>
          ) : (
            <select 
              className="text-xs border rounded px-2 py-1"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.value) {
                  fetch(`${API_URL}/requests/${request._id}/assign`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ technicianId: e.target.value })
                  }).then(() => fetchData());
                }
              }}
            >
              <option value="">Assign...</option>
              {technicians
                .filter(t => t.team._id === request.team?._id)
                .map(tech => (
                  <option key={tech._id} value={tech._id}>{tech.name}</option>
                ))
              }
            </select>
          )}
        </div>
        
        {isOverdue && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            Overdue!
          </div>
        )}
      </div>
    );
  };

  const CalendarView = () => {
    const preventiveRequests = requests.filter(r => r.type === 'Preventive');
    const groupedByDate = preventiveRequests.reduce((acc, req) => {
      const date = new Date(req.scheduledDate).toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(req);
      return acc;
    }, {});
    
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-bold">Preventive Maintenance Schedule</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {Object.entries(groupedByDate).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No preventive maintenance scheduled</p>
            ) : (
              Object.entries(groupedByDate).map(([date, reqs]) => (
                <div key={date}>
                  <h3 className="text-blue-600 font-semibold mb-3">{date}</h3>
                  <div className="space-y-2">
                    {reqs.map(req => (
                      <div key={req._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{req.subject}</h4>
                          <p className="text-sm text-gray-600">{req.equipment?.name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded ${
                            req.stage === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            req.stage === 'Repaired' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {req.stage}
                          </span>
                          {req.assignedTechnician && (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {req.assignedTechnician.avatar || req.assignedTechnician.name?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const EquipmentView = () => {
    const filteredEquipment = equipment.filter(eq => {
      const matchesSearch = searchTerm === '' || 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDepartment === 'All Departments' || eq.department === selectedDepartment;
      return matchesSearch && matchesDept;
    });

    const getRequestCount = (equipmentId) => {
      return requests.filter(r => 
        r.equipment._id === equipmentId && 
        r.stage !== 'Repaired' && 
        r.stage !== 'Scrap'
      ).length;
    };

    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                <h2 className="text-xl font-bold">Equipment Management</h2>
              </div>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                onClick={() => alert('Add Equipment feature - connect to POST ' + API_URL + '/equipment')}
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="border rounded-lg px-4 py-2"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option>All Departments</option>
                <option>Production</option>
                <option>IT</option>
                <option>Warehouse</option>
                <option>Maintenance</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {filteredEquipment.map(eq => {
              const reqCount = getRequestCount(eq._id);
              return (
                <div key={eq._id} className="border rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">{eq.name}</h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Serial:</span>
                          <span className="ml-2 font-medium">{eq.serialNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Department:</span>
                          <span className="ml-2 font-medium">{eq.department}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Assigned To:</span>
                          <span className="ml-2 font-medium">{eq.assignedTo}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="ml-2 font-medium">{eq.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">{eq.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Team:</span>
                          <span className="ml-2 font-medium">{eq.team?.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                      onClick={() => {
                        const eqRequests = requests.filter(r => r.equipment._id === eq._id);
                        alert(`Maintenance requests for ${eq.name}:\n${eqRequests.map(r => `- ${r.subject} (${r.stage})`).join('\n') || 'No requests'}`);
                      }}
                    >
                      <Wrench className="w-4 h-4" />
                      Maintenance
                      {reqCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {reqCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ReportsView = () => {
    const [teamStats, setTeamStats] = useState([]);
    const [categoryStats, setCategoryStats] = useState([]);

    useEffect(() => {
      if (view === 'reports') {
        Promise.all([
          fetch(`${API_URL}/reports/by-team`).then(r => r.json()),
          fetch(`${API_URL}/reports/by-category`).then(r => r.json())
        ]).then(([teams, cats]) => {
          setTeamStats(teams);
          setCategoryStats(cats);
        });
      }
    }, [view]);

    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              <h2 className="text-xl font-bold">Reports & Analytics</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Requests by Team</h3>
                <div className="space-y-3">
                  {teamStats.map(stat => (
                    <div key={stat.teamId}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">{stat.teamName}</span>
                        <span className="text-sm font-medium">{stat.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(stat.count / Math.max(...teamStats.map(s => s.count)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Requests by Category</h3>
                <div className="space-y-3">
                  {categoryStats.map(stat => (
                    <div key={stat.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">{stat.category}</span>
                        <span className="text-sm font-medium">{stat.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(stat.count / Math.max(...categoryStats.map(s => s.count)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{reports?.totalRequests || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Requests</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">{reports?.inProgressRequests || 0}</div>
                <div className="text-sm text-gray-600 mt-1">In Progress</div>
              </div>
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{reports?.completedRequests || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Completed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{reports?.overdueRequests || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NewRequestModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Create Maintenance Request</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Subject</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Oil Leak"
              value={newRequest.subject}
              onChange={(e) => setNewRequest({...newRequest, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Equipment</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={newRequest.equipment}
              onChange={(e) => setNewRequest({...newRequest, equipment: e.target.value})}
            >
              <option value="">Select Equipment</option>
              {equipment.map(eq => (
                <option key={eq._id} value={eq._id}>
                  {eq.name} - {eq.serialNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Request Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={newRequest.type}
              onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
            >
              <option value="Corrective">Corrective (Breakdown)</option>
              <option value="Preventive">Preventive (Routine)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Scheduled Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={newRequest.scheduledDate}
              onChange={(e) => setNewRequest({...newRequest, scheduledDate: e.target.value})}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Priority</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={newRequest.priority}
              onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={createRequest}
              disabled={!newRequest.subject || !newRequest.equipment}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Request
            </button>
            <button
              onClick={() => setShowNewRequestModal(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-medium">Loading GearGuard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800">GearGuard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex gap-1">
              <button 
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded ${view === 'kanban' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Kanban
              </button>
              <button 
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded ${view === 'calendar' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Calendar
              </button>
              <button 
                onClick={() => setView('equipment')}
                className={`px-4 py-2 rounded ${view === 'equipment' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Equipment
              </button>
              <button 
                onClick={() => setView('reports')}
                className={`px-4 py-2 rounded ${view === 'reports' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Reports
              </button>
            </nav>
            
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>
      </header>

      {view === 'kanban' && <KanbanBoard />}
      {view === 'calendar' && <CalendarView />}
      {view === 'equipment' && <EquipmentView />}
      {view === 'reports' && <ReportsView />}

      {showNewRequestModal && <NewRequestModal />}
    </div>
  );
};

export default GearGuard;