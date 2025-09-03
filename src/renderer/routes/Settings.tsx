import React, { useState, useEffect } from 'react';

interface DbStatus {
  path: string;
  mainDbConnected: boolean;
  searchDbConnected: boolean;
  initialized?: boolean;
}

export default function Settings() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [autoUpdateDb, setAutoUpdateDb] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    // Get initial DB status
    window.electronAPI.getDbStatus().then(setDbStatus);
    
    // Listen for DB status updates
    window.electronAPI.onDbStatus((status: DbStatus) => {
      setDbStatus(status);
      if (status.initialized) {
        setUpdateMessage('Database initialized successfully!');
        setTimeout(() => setUpdateMessage(''), 3000);
      }
    });
  }, []);

  const handleUpdateCriteria = async () => {
    try {
      const result = await window.electronAPI.updateSearchCriteria();
      setUpdateMessage(result.message);
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      setUpdateMessage('Error updating criteria: ' + error.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      {/* Database Status Section */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-4">Database Status</h3>
        
        {dbStatus && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Database Location:</span>
              <span className="text-gray-600 font-mono">{dbStatus.path}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Main Database:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                dbStatus.mainDbConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {dbStatus.mainDbConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Search Database:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                dbStatus.searchDbConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {dbStatus.searchDbConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Criteria Management */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold mb-4">Search Criteria Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpdateCriteria}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Criteria
            </button>
            <span className="text-sm text-gray-600">
              Manually update search criteria from analysis results
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="auto-update"
              checked={autoUpdateDb}
              onChange={(e) => setAutoUpdateDb(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="auto-update" className="text-sm font-medium">
              Auto-update DB
            </label>
            <span className="text-sm text-gray-600">
              Automatically update search criteria when analysis is run
            </span>
          </div>
        </div>

        {updateMessage && (
          <div className={`mt-4 p-3 rounded ${
            updateMessage.includes('Error') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {updateMessage}
          </div>
        )}
      </div>

      {/* Future Settings Sections */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Analysis Settings</h3>
        <p className="text-gray-600">Analysis configuration options will be added here.</p>
      </div>
    </div>
  );
}
