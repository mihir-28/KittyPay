import React from 'react';

const DashboardTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mb-6 border-b border-[var(--border)]">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent hover:text-[var(--primary)] text-[var(--text-secondary)]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'expenses' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent hover:text-[var(--primary)] text-[var(--text-secondary)]'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('kitties')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'kitties' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent hover:text-[var(--primary)] text-[var(--text-secondary)]'
          }`}
        >
          Kitties
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'activity' 
              ? 'border-[var(--primary)] text-[var(--primary)]' 
              : 'border-transparent hover:text-[var(--primary)] text-[var(--text-secondary)]'
          }`}
        >
          Activity
        </button>
      </div>
    </div>
  );
};

export default DashboardTabs;
