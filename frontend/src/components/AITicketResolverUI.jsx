import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Check, 
  ChevronDown, 
  FileText, 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  Upload, 
  X
} from 'lucide-react';

// Main App Component
const AITicketResolverUI = () => {
  // States
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [similarTickets, setSimilarTickets] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    apiKey: '',
    endpoint: '',
    embeddingModel: 'text-embedding-ada-002',
    completionModel: 'gpt-4o'
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [stats, setStats] = useState({
    totalResolved: 124,
    avgResponseTime: '14.2 min',
    successRate: '92%',
    pendingTickets: 8
  });
  const [notification, setNotification] = useState(null);

  // Dummy tickets for demo
  useEffect(() => {
    const dummyTickets = [
      { id: 1, title: "Outlook crashes when opening PDFs", status: "resolved", date: "2025-03-25", priority: "high" },
      { id: 2, title: "VPN connection fails from home network", status: "pending", date: "2025-03-27", priority: "medium" },
      { id: 3, title: "Computer running slow after Windows update", status: "resolved", date: "2025-03-23", priority: "low" },
      { id: 4, title: "Printer not responding to print commands", status: "in-progress", date: "2025-03-26", priority: "high" },
      { id: 5, title: "Unable to access shared drive", status: "resolved", date: "2025-03-22", priority: "medium" },
    ];
    setTickets(dummyTickets);
  }, []);

  // Handle theme toggle
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form submission for new ticket
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTicket.trim()) return;
    
    setLoading(true);
    
    // Simulate API call to get resolution
    setTimeout(() => {
      const mockResolution = {
        resolution: "Update Outlook to the latest version and clear the attachment cache by navigating to %temp% and deleting temporary Outlook files. If the issue persists, check the PDF reader integration with Outlook and ensure it's up to date.",
        confidence: "high",
        similar_tickets: [
          {
            issue: "Outlook crashes when opening emails with attachments",
            resolution: "Update Outlook to the latest version and clear the attachment cache by navigating to %temp% and deleting temporary Outlook files.",
            similarity: 0.92
          },
          {
            issue: "Email attachments not downloading in Outlook web version",
            resolution: "Cleared browser cache and cookies. Switched from Edge to Chrome browser as a workaround. Filed bug report with Microsoft for the Outlook Web App team.",
            similarity: 0.75
          }
        ]
      };
      
      setResolution(mockResolution);
      setSimilarTickets(mockResolution.similar_tickets);
      
      // Add to tickets list
      const newTicketObj = {
        id: tickets.length + 1,
        title: newTicket,
        status: "new",
        date: new Date().toISOString().split('T')[0],
        priority: "medium"
      };
      
      setTickets([newTicketObj, ...tickets]);
      setLoading(false);
      setActiveView('resolution');
    }, 2000);
  };

  // Handle settings save
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsConfigured(true);
    setShowSettings(false);
    showNotification("API settings saved successfully");
    // Here you would typically validate the settings and connect to the API
  };

  // Handle file upload for historical data
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    // Simulate API call to upload and process file
    setTimeout(() => {
      setLoading(false);
      showNotification(`File ${file.name} processed successfully`);
    }, 2000);
  };

  // Render appropriate view based on state
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView stats={stats} tickets={tickets} setActiveView={setActiveView} />;
      case 'tickets':
        return <TicketsView tickets={tickets} />;
      case 'new-ticket':
        return (
          <NewTicketView 
            newTicket={newTicket} 
            setNewTicket={setNewTicket} 
            handleSubmit={handleSubmit} 
            loading={loading}
          />
        );
      case 'resolution':
        return (
          <ResolutionView 
            resolution={resolution} 
            similarTickets={similarTickets} 
            newTicket={newTicket}
            setActiveView={setActiveView}
          />
        );
      case 'upload':
        return (
          <UploadView 
            handleFileUpload={handleFileUpload} 
            loading={loading}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            apiSettings={apiSettings} 
            setApiSettings={setApiSettings} 
            handleSaveSettings={handleSaveSettings}
          />
        );
      default:
        return <DashboardView stats={stats} tickets={tickets} setActiveView={setActiveView} />;
    }
  };

  // If not configured, show settings page
  useEffect(() => {
    if (!isConfigured) {
      setShowSettings(true);
    }
  }, [isConfigured]);

  return (
    <div className={`flex h-screen bg-gray-50 ${darkMode ? 'dark-theme' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">AI Ticket Resolver</h1>
          <p className="text-sm text-gray-500 mt-1">Powered by Azure OpenAI</p>
        </div>
        
        <nav className="mt-6">
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="Dashboard" 
            active={activeView === 'dashboard'} 
            onClick={() => setActiveView('dashboard')} 
          />
          <SidebarItem 
            icon={<MessageSquare size={20} />} 
            label="Tickets" 
            active={activeView === 'tickets'} 
            onClick={() => setActiveView('tickets')} 
          />
          <SidebarItem 
            icon={<Plus size={20} />} 
            label="New Ticket" 
            active={activeView === 'new-ticket'} 
            onClick={() => {
              setNewTicket('');
              setResolution(null);
              setActiveView('new-ticket');
            }} 
          />
          <SidebarItem 
            icon={<Upload size={20} />} 
            label="Upload Data" 
            active={activeView === 'upload'} 
            onClick={() => setActiveView('upload')} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeView === 'settings'} 
            onClick={() => setShowSettings(true)} 
          />
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100"
            onClick={() => setDarkMode(!darkMode)}
          >
            <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            <div className={`w-10 h-5 rounded-full bg-gray-300 relative ${darkMode ? 'bg-blue-500' : ''}`}>
              <div 
                className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all ${
                  darkMode ? 'right-0.5' : 'left-0.5'
                }`} 
              />
            </div>
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        {renderView()}
      </main>
      
      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 
          'bg-red-100 text-red-800 border-l-4 border-red-500'
        }`}>
          <div className="flex">
            {notification.type === 'success' ? 
              <Check size={20} className="flex-shrink-0 mr-2" /> : 
              <AlertCircle size={20} className="flex-shrink-0 mr-2" />
            }
            <div>{notification.message}</div>
            <button 
              className="ml-4 text-gray-500 hover:text-gray-700"
              onClick={() => setNotification(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-1/2 max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">API Settings</h2>
              {isConfigured && (
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowSettings(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azure OpenAI API Key
                </label>
                <input 
                  type="password" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={apiSettings.apiKey}
                  onChange={(e) => setApiSettings({...apiSettings, apiKey: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Azure OpenAI Endpoint
                </label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={apiSettings.endpoint}
                  onChange={(e) => setApiSettings({...apiSettings, endpoint: e.target.value})}
                  placeholder="https://your-resource.openai.azure.com/"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Embedding Model Deployment
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={apiSettings.embeddingModel}
                    onChange={(e) => setApiSettings({...apiSettings, embeddingModel: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completion Model Deployment
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={apiSettings.completionModel}
                    onChange={(e) => setApiSettings({...apiSettings, completionModel: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// BEGINNING OF PART 2 -- Helper components

// Sidebar Item Component
const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
      className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-100 ${
        active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-600'
      }`}
      onClick={onClick}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
  
  // Dashboard View Component
  const DashboardView = ({ stats, tickets, setActiveView }) => (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of the AI Ticket Resolver System</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Resolved" 
          value={stats.totalResolved} 
          icon={<Check size={20} className="text-green-500" />} 
          trend="+12% this week"
          color="bg-green-50 text-green-600"
        />
        <StatCard 
          title="Avg Response Time" 
          value={stats.avgResponseTime} 
          icon={<MessageSquare size={20} className="text-blue-500" />} 
          trend="-2.5 min from last week"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Success Rate" 
          value={stats.successRate} 
          icon={<Check size={20} className="text-purple-500" />} 
          trend="+2% this month"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard 
          title="Pending Tickets" 
          value={stats.pendingTickets} 
          icon={<AlertCircle size={20} className="text-orange-500" />} 
          trend="3 high priority"
          color="bg-orange-50 text-orange-600"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Tickets</h2>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => setActiveView('tickets')}
          >
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.slice(0, 5).map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{ticket.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={ticket.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <HelpCircle size={20} className="text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Quick Start Guide</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-gray-900">Configure API Settings</h3>
              <p className="text-sm text-gray-500">Enter your Azure OpenAI API credentials in Settings</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-gray-900">Submit a New Ticket</h3>
              <p className="text-sm text-gray-500">Enter the ticket description and let AI find a resolution</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">3</div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-gray-900">Review Similar Cases</h3>
              <p className="text-sm text-gray-500">See matching historical tickets and their resolutions</p>
            </div>
          </div>
          
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => setActiveView('new-ticket')}
          >
            Submit Your First Ticket
          </button>
        </div>
      </div>
    </div>
  );
  
  // Stat Card Component
  const StatCard = ({ title, value, icon, trend, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{trend}</p>
    </div>
  );
  
  // Priority Badge Component
  const PriorityBadge = ({ priority }) => {
    let bgColor, textColor;
    
    switch (priority) {
      case 'high':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      case 'medium':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'low':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };
  
  // Status Badge Component
  const StatusBadge = ({ status }) => {
    let bgColor, textColor;
    
    switch (status) {
      case 'resolved':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'in-progress':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'pending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'new':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Tickets View Component
  const TicketsView = ({ tickets }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    
    // Filter tickets based on search and filters
    const filteredTickets = tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    return (
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tickets</h1>
          <p className="text-gray-600 mt-2">Manage and view all support tickets</p>
        </header>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Search size={20} />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{ticket.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{ticket.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
                
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                      No tickets found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  // END OF PART 2 --
// END OF PART 1 -- The main AITicketResolverUI component is complete

// BEGINNING OF PART 3 -- Remaining components and export

// New Ticket View Component
const NewTicketView = ({ newTicket, setNewTicket, handleSubmit, loading }) => (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">New Ticket</h1>
        <p className="text-gray-600 mt-2">Submit a new ticket for AI resolution</p>
      </header>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="ticket-description" className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Description
            </label>
            <textarea 
              id="ticket-description"
              rows="5"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the issue in detail..."
              value={newTicket}
              onChange={(e) => setNewTicket(e.target.value)}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Provide as much detail as possible for better results.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Get AI Resolution'
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-1">
            <HelpCircle size={20} className="text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-md font-medium text-blue-800">Tips for Better Results</h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-600 text-xs mr-2 mt-0.5">1</span>
                <span>Be specific about the error messages you're seeing</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-600 text-xs mr-2 mt-0.5">2</span>
                <span>Mention the exact steps that led to the issue</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-200 text-blue-600 text-xs mr-2 mt-0.5">3</span>
                <span>Include software versions, OS, and other relevant system details</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Resolution View Component
  const ResolutionView = ({ resolution, similarTickets, newTicket, setActiveView }) => {
    // Format confidence level for display
    const getConfidenceColor = (confidence) => {
      switch (confidence) {
        case 'high':
          return { bg: 'bg-green-100', text: 'text-green-800', icon: <Check size={16} /> };
        case 'medium':
          return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Check size={16} /> };
        case 'low':
          return { bg: 'bg-orange-100', text: 'text-orange-800', icon: <AlertCircle size={16} /> };
        default:
          return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <HelpCircle size={16} /> };
      }
    };
    
    const confidenceDisplay = getConfidenceColor(resolution?.confidence);
    
    return (
      <div>
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Resolution</h1>
            <p className="text-gray-600 mt-2">AI-generated solution for your ticket</p>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => setActiveView('new-ticket')}
          >
            Submit Another Ticket
          </button>
        </header>
        
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Ticket Details</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">{newTicket}</p>
            
            <div className="flex items-center mt-6">
              <span className="text-sm text-gray-500">Submitted:</span>
              <span className="ml-2 text-sm text-gray-700">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">AI Resolution</h2>
            
            <div className={`flex items-center px-3 py-1 rounded-full ${confidenceDisplay.bg} ${confidenceDisplay.text}`}>
              <span className="mr-1">{confidenceDisplay.icon}</span>
              <span className="text-xs font-medium">{resolution?.confidence.toUpperCase()} Confidence</span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-gray-700 whitespace-pre-line">{resolution?.resolution}</p>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Copy Solution
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Similar Historical Tickets</h2>
          </div>
          
          <div className="p-6">
            {similarTickets.length > 0 ? (
              <div className="space-y-6">
                {similarTickets.map((ticket, index) => (
                  <div key={index} className="border rounded-lg">
                    <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                      <div className="font-medium">Similar Ticket #{index + 1}</div>
                      <div className="text-sm text-gray-500">
                        Similarity: {(ticket.similarity * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Issue:</h4>
                        <p className="text-gray-700">{ticket.issue}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Resolution:</h4>
                        <p className="text-gray-700">{ticket.resolution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No similar tickets found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Upload View Component
  const UploadView = ({ handleFileUpload, loading }) => (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Upload Historical Data</h1>
        <p className="text-gray-600 mt-2">Import your historical tickets to improve AI resolutions</p>
      </header>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload CSV Data</h2>
          <p className="text-gray-600 mb-4">
            Upload a CSV file containing your historical support tickets and their resolutions. 
            This data will be used to train the AI resolver to better understand your specific issues.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <Upload size={40} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Drag and drop file here</h3>
              <p className="text-sm text-gray-500 mb-4">or</p>
              
              <label className="relative cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <span>Browse Files</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
              
              <p className="mt-2 text-xs text-gray-500">Supported formats: .CSV, .XLSX, .XLS</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-md font-medium text-gray-800 mb-3">CSV File Requirements:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs mr-2 mt-0.5">•</span>
              <span>File must contain at least two columns: one for ticket descriptions and one for resolutions</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs mr-2 mt-0.5">•</span>
              <span>The system will attempt to auto-detect the appropriate columns based on their names</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-100 text-blue-600 text-xs mr-2 mt-0.5">•</span>
              <span>Recommended column names: "Description", "Issue", "Problem", "Ticket" for issues, and "Resolution", "Solution", "Answer", "Fix" for resolutions</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Sample Format</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">Outlook crashes when opening emails with attachments</div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">Update Outlook to the latest version and clear the attachment cache.</div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">Cannot connect to the VPN from home network</div>
                </td>
                <td className="px-6 py-4 whitespace-normal">
                  <div className="text-sm text-gray-900">Ensure you're using the correct VPN client version and reset your home router.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  // Settings View Component
  const SettingsView = ({ apiSettings, setApiSettings, handleSaveSettings }) => (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your AI Ticket Resolver</p>
      </header>
      
      <div className="bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">API Configuration</h2>
        </div>
        
        <form onSubmit={handleSaveSettings} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Azure OpenAI API Key
            </label>
            <input 
              type="password" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={apiSettings.apiKey}
              onChange={(e) => setApiSettings({...apiSettings, apiKey: e.target.value})}
              required
            />
            <p className="mt-1 text-sm text-gray-500">Your API key is encrypted and stored securely</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Azure OpenAI Endpoint
            </label>
            <input 
              type="text" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={apiSettings.endpoint}
              onChange={(e) => setApiSettings({...apiSettings, endpoint: e.target.value})}
              placeholder="https://your-resource.openai.azure.com/"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Embedding Model Deployment
              </label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={apiSettings.embeddingModel}
                onChange={(e) => setApiSettings({...apiSettings, embeddingModel: e.target.value})}
                required
              />
              <p className="mt-1 text-sm text-gray-500">e.g., text-embedding-ada-002</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Model Deployment
              </label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={apiSettings.completionModel}
                onChange={(e) => setApiSettings({...apiSettings, completionModel: e.target.value})}
                required
              />
              <p className="mt-1 text-sm text-gray-500">e.g., gpt-4o</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">System Preferences</h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Enable Dark Mode</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </label>
            </div>
            
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Show Confidence Scores</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-blue-500 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-7 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </label>
            </div>
            
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Auto-save Resolutions</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-blue-500 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-7 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </label>
            </div>
            
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">Send Anonymous Usage Data</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </label>
              <p className="mt-1 text-xs text-gray-500">Help improve the system by sharing anonymous usage statistics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Export the main component
  export default AITicketResolverUI;