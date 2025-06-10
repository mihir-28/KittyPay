import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaLightbulb, FaCode, FaMobile, FaGithub, FaSpinner, FaBug, FaStar, FaFilter } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { fetchIssues, getIssueStatus, getIssueCategory } from '../services/github';
import { toast } from 'react-hot-toast';

const Roadmap = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('feature'); // 'feature', 'enhancement', or 'issues'
  const [issueState, setIssueState] = useState('open'); // 'open' or 'closed'
  const [expandedIssues, setExpandedIssues] = useState(new Set());

  useEffect(() => {
    fetchIssuesData();
  }, [issueState]); // Refetch when issueState changes

  const fetchIssuesData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching issues data...');
      const data = await fetchIssues({ state: issueState });
      console.log('First issue complete data:', data[0]);
      console.log('Issue keys:', data[0] ? Object.keys(data[0]) : 'No issues');
      setIssues(data);
    } catch (err) {
      console.error('Error in fetchIssuesData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (category) => {
    switch (category) {
      case 'Features':
        return <FaStar className="text-2xl" />;
      case 'Issues':
        return <FaBug className="text-2xl" />;
      default:
        return <FaCode className="text-2xl" />;
    }
  };

  // Filter issues based on active tab
  const filteredIssues = issues.filter(issue => {
    console.log('Filtering issue:', {
      number: issue.number,
      title: issue.title,
      labels: issue.labels.map(l => l.name),
      activeTab
    });

    switch (activeTab) {
      case 'feature':
        return issue.labels.some(label => label.name === 'feature');
      case 'enhancement':
        return issue.labels.some(label => label.name === 'enhancement');
      case 'issues':
        return issue.labels.some(label => label.name === 'bug');
      default:
        return false;
    }
  });

  console.log('Filtered issues:', filteredIssues);

  // Group issues by category
  const groupedIssues = filteredIssues.reduce((acc, issue) => {
    const category = getIssueCategory(issue);
    console.log('Grouping issue:', {
      number: issue.number,
      title: issue.title,
      category,
      labels: issue.labels.map(l => l.name)
    });
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(issue);
    return acc;
  }, {});

  console.log('Grouped issues:', groupedIssues);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--text-primary)]">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-4">
            <h3 className="text-xl font-semibold text-red-200 mb-2">Error Loading Roadmap</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="space-y-2 text-left text-sm text-red-200">
              <p>Please check:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your GitHub token is correctly set in .env</li>
                <li>The token has the correct permissions</li>
                <li>The repository name and owner are correct</li>
                <li>You have some issues with the correct labels</li>
              </ul>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">KittyPay Roadmap</h1>
          <p className="text-xl text-[var(--text-primary)] mb-6">
            Discover what's coming next to KittyPay
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Issue State Tabs */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIssueState('open')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                issueState === 'open'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-primary)] hover:bg-opacity-80'
              }`}
            >
              Open Issues
            </button>
            <button
              onClick={() => setIssueState('closed')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                issueState === 'closed'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-primary)] hover:bg-opacity-80'
              }`}
            >
              Closed Issues
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('feature')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'feature'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-primary)] hover:bg-opacity-80'
              }`}
            >
              <FaStar className="inline-block mr-2" />
              New Features
            </button>
            <button
              onClick={() => setActiveTab('enhancement')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'enhancement'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-primary)] hover:bg-opacity-80'
              }`}
            >
              <FaLightbulb className="inline-block mr-2" />
              Enhancements
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === 'issues'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--surface)] text-[var(--text-primary)] hover:bg-opacity-80'
              }`}
            >
              <FaBug className="inline-block mr-2" />
              Issues
            </button>
          </div>
        </div>

        {/* Roadmap Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {filteredIssues.map((issue, index) => {
            const status = getIssueStatus(issue);
            const category = getIssueCategory(issue);
            
            return (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[var(--surface)] rounded-lg p-6 shadow-lg border border-[var(--text-secondary)] hover:border-[var(--primary)] transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-[var(--primary)] rounded-lg text-white">
                    {getIconForCategory(category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-[var(--text-secondary)]">#{issue.number}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            issue.state === 'open' ? 'bg-green-500/20 text-green-500' :
                            issue.state === 'closed' ? 'bg-purple-500/20 text-purple-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {issue.state}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--primary)] transition-colors"
                          >
                            {issue.title}
                          </a>
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {issue.labels.map(label => (
                            <span
                              key={label.name}
                              className="px-2 py-1 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                          <span className="flex items-center gap-1">
                            <FaGithub className="text-sm" />
                            {new Date(issue.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {issue.assignee && (
                            <span className="flex items-center gap-1">
                              <img 
                                src={issue.assignee.avatarUrl} 
                                alt={issue.assignee.login}
                                className="w-4 h-4 rounded-full"
                              />
                              {issue.assignee.login}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-[var(--surface)] rounded-lg p-8 border border-[var(--text-secondary)]">
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                {issueState === 'open' 
                  ? activeTab === 'feature' ? 'No Planned Features' :
                    activeTab === 'enhancement' ? 'No Planned Enhancements' :
                    'No Active Issues'
                  : activeTab === 'feature' ? 'No Completed Features' :
                    activeTab === 'enhancement' ? 'No Completed Enhancements' :
                    'No Resolved Issues'}
              </h3>
              <p className="text-[var(--text-primary)]">
                {issueState === 'open' 
                  ? activeTab === 'feature' ? 'We haven\'t planned any new features yet. Stay tuned for updates!' :
                    activeTab === 'enhancement' ? 'No enhancements are currently in the pipeline. Check back later!' :
                    'All systems are running smoothly with no active issues.'
                  : activeTab === 'feature' ? 'We\'re just getting started! No features have been completed yet.' :
                    activeTab === 'enhancement' ? 'Our enhancement journey is just beginning. Watch this space!' :
                    'No issues have been resolved yet. We\'re working on it!'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-[var(--text-primary)]">
            {activeTab === 'enhancement' ? 'Have an enhancement suggestion?' : `Have a ${activeTab === 'feature' ? 'feature request' : 'bug to report'}?`} <a href="https://github.com/mihir-28/KittyPay/issues/new" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Create an issue</a> on GitHub!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Roadmap; 