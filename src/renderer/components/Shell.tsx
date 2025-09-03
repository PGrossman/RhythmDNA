import React, { useState } from 'react';
import Analysis from '../routes/Analysis';
import Search from '../routes/Search';
import Settings from '../routes/Settings';

const tabs = [
  { id: 'analysis', label: 'Analysis' },
  { id: 'search', label: 'Search' },
  { id: 'settings', label: 'Settings' }
];

export default function Shell() {
  const [activeTab, setActiveTab] = useState('analysis');

  return (
    <div className="min-h-screen">
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-semibold mb-2">RhythmDNA</h1>
        <nav className="flex gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="p-6 bg-gray-50 min-h-screen">
        {activeTab === 'analysis' && <Analysis />}
        {activeTab === 'search' && <Search />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
