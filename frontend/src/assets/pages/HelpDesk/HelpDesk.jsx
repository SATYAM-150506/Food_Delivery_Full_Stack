import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import helpDeskService from '../../services/helpDeskService';
import { 
  FiMessageSquare, 
  FiMail, 
  FiClock, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiSend,
  FiPlus,
  FiRefreshCw
} from 'react-icons/fi';

const HelpDesk = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'tickets'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Create ticket form states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('general_inquiry');
  const [priority, setPriority] = useState('medium');

  // Response form state
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && activeTab === 'tickets') {
      fetchTickets();
    }
  }, [isAuthenticated, activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await helpDeskService.getMyTickets();
      setTickets(data.tickets || []);
    } catch (error) {
      setMessage('❌ Failed to fetch tickets');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const ticketData = {
        subject: subject.trim(),
        message: description.trim(),
        issueType,
        priority
      };

      await helpDeskService.createTicket(ticketData);
      setMessage('✅ Help desk ticket created successfully!');
      
      // Reset form
      setSubject('');
      setDescription('');
      setIssueType('general_inquiry');
      setPriority('medium');
      
      // Switch to tickets tab and refresh
      setActiveTab('tickets');
      fetchTickets();
      
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      setMessage(error.response?.data?.error || '❌ Failed to create ticket');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !responseMessage.trim()) return;

    setLoading(true);
    try {
      await helpDeskService.addResponse(selectedTicket._id, responseMessage.trim());
      setMessage('✅ Response added successfully!');
      setResponseMessage('');
      
      // Refresh ticket details
      const updatedTicket = await helpDeskService.getTicket(selectedTicket._id);
      setSelectedTicket(updatedTicket);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || '❌ Failed to add response');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FiAlertCircle className="text-orange-500" />;
      case 'in_progress': return <FiClock className="text-blue-500" />;
      case 'resolved': return <FiCheckCircle className="text-green-500" />;
      case 'closed': return <FiCheckCircle className="text-gray-500" />;
      default: return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Help Desk</h1>
          <p className="text-gray-600 dark:text-gray-400">Get support for your questions and issues</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 border-l-4 border-blue-500 dark:border-blue-400 shadow-sm dark:shadow-gray-900/20">
            <p className="text-gray-800">{message}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-t-2xl shadow-sm">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'create' 
                ? 'bg-blue-600 text-white rounded-tl-2xl' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FiPlus className="inline-block w-5 h-5 mr-2" />
            Create Ticket
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'tickets' 
                ? 'bg-blue-600 text-white rounded-tr-2xl' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <FiMessageSquare className="inline-block w-5 h-5 mr-2" />
            My Tickets
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          {activeTab === 'create' ? (
            /* Create Ticket Form */
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Type *
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general_inquiry">General Inquiry</option>
                      <option value="order_issue">Order Issue</option>
                      <option value="payment_issue">Payment Issue</option>
                      <option value="delivery_issue">Delivery Issue</option>
                      <option value="account_issue">Account Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please provide detailed information about your issue..."
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FiSend className="w-5 h-5" />
                    )}
                    {loading ? 'Creating...' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Tickets List */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Support Tickets</h2>
                <button
                  onClick={fetchTickets}
                  disabled={loading}
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center gap-2"
                >
                  <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading && tickets.length === 0 ? (
                <div className="text-center py-8">
                  <FiRefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">Loading tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No support tickets found</p>
                  <p className="text-gray-500">Create your first ticket to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{ticket.subject}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            <span className="text-sm font-medium capitalize">{ticket.status.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{ticket.message}</p>
                      
                      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                        <span>Type: {ticket.issueType.replace('_', ' ')}</span>
                        <span>{ticket.responses.length} responses</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedTicket.subject}</h2>
                    <p className="text-gray-600 mt-1">
                      Ticket ID: {selectedTicket._id.slice(-8)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {selectedTicket.responses.map((response, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        response.isAgent 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'bg-gray-50 border-l-4 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{response.author}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(response.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="p-6 border-t border-gray-200">
                  <form onSubmit={handleAddResponse}>
                    <textarea
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                      placeholder="Add your response..."
                      required
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !responseMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiSend className="w-4 h-4" />
                        )}
                        Send Response
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpDesk;
