import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiClock, FiCalendar, FiFilter, FiPieChart } from 'react-icons/fi';
import {
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LineChart, 
  Line, 
  BarChart, 
  Bar
} from 'recharts';

const ActivityTab = ({ dashboardData, heatmapData, formatCategoryName, formatDate }) => {
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  const [filter, setFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  
  // Transform heatmapData into a format for timeline visualization
  const getTimelineData = () => {
    if (!heatmapData || !Array.isArray(heatmapData)) return [];
    
    // Group data by date for the chart
    const groupedData = {};
    
    heatmapData.forEach(item => {
      if (!item || !item.date) return;
      
      const dateStr = typeof item.date === 'string' ? item.date : 
        item.date instanceof Date ? item.date.toISOString().split('T')[0] : null;
      
      if (!dateStr) return;
      
      if (!groupedData[dateStr]) {
        groupedData[dateStr] = {
          date: dateStr,
          displayDate: typeof item.date === 'string' ? new Date(item.date).toLocaleDateString() :
            item.date instanceof Date ? item.date.toLocaleDateString() : dateStr,
          count: 0,
          amount: 0
        };
      }
      
      groupedData[dateStr].count += item.count || 0;
      groupedData[dateStr].amount += item.amount || 0;
    });
    
    // Convert to array and sort by date
    let timelineData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Filter based on selected time range    
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(today.getMonth() - 1);
    const yearAgo = new Date();
    yearAgo.setFullYear(today.getFullYear() - 1);
    
    if (timeRange === 'week') {
      timelineData = timelineData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo && itemDate <= today;
      });
    } else if (timeRange === 'month') {
      timelineData = timelineData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo && itemDate <= today;
      });
    } else if (timeRange === 'year') {
      timelineData = timelineData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= yearAgo && itemDate <= today;
      });
    }
    
    return timelineData;
  };
  
  // Get activity stats (total and average for selected period)  
  const getActivityStats = () => {
    const timelineData = getTimelineData();
    
    if (timelineData.length === 0) {
      return { 
        totalCount: 0, 
        totalAmount: 0, 
        avgPerDay: 0, 
        avgAmount: 0,
        mostActiveDay: null,
        highestAmountDay: null
      };
    }
    
    const totalCount = timelineData.reduce((sum, item) => sum + item.count, 0);
    const totalAmount = timelineData.reduce((sum, item) => sum + item.amount, 0);
    const avgPerDay = totalCount / timelineData.length;
    const avgAmount = totalAmount / timelineData.length;
    
    // Find most active day
    const mostActiveDay = timelineData.reduce((max, item) => 
      item.count > max.count ? item : max, timelineData[0]);
    
    // Find day with highest amount
    const highestAmountDay = timelineData.reduce((max, item) => 
      item.amount > max.amount ? item : max, timelineData[0]);
    
    return { 
      totalCount, 
      totalAmount, 
      avgPerDay, 
      avgAmount,
      mostActiveDay,
      highestAmountDay
    };
  };
  
  // Get data for activity distribution by weekday  
  const getWeekdayDistribution = () => {
    // Use the already filtered timeline data to ensure consistency with selected time range
    const timelineData = getTimelineData();
    if (timelineData.length === 0) return [];
    
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const distribution = weekdays.map(day => ({ name: day, count: 0, amount: 0 }));
    
    timelineData.forEach(item => {
      if (!item || !item.date) return;
      
      const date = typeof item.date === 'string' ? new Date(item.date) : 
        item.date instanceof Date ? item.date : null;
      
      if (!date) return;
      
      const weekdayIndex = date.getDay();
      distribution[weekdayIndex].count += item.count || 0;
      distribution[weekdayIndex].amount += item.amount || 0;
    });
    
    return distribution;
  };
  
  // These values will be recalculated when timeRange changes because the component re-renders
  const timelineData = getTimelineData();
  const stats = getActivityStats();
  const weekdayDistribution = getWeekdayDistribution();

  // Filter expenses based on selected filter
  const getFilteredExpenses = () => {
    if (!dashboardData.recentExpenses) return [];
    
    if (filter === 'all') return dashboardData.recentExpenses;
    
    if (filter === 'high') {
      return dashboardData.recentExpenses.filter(expense => expense.amount >= 1000);
    } else if (filter === 'medium') {
      return dashboardData.recentExpenses.filter(expense => expense.amount >= 500 && expense.amount < 1000);
    } else if (filter === 'low') {
      return dashboardData.recentExpenses.filter(expense => expense.amount < 500);
    }
    
    return dashboardData.recentExpenses;
  };
  
  return (
    <div className="space-y-6">
      {/* Activity Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FiActivity className="mr-2" /> Activity Timeline
          </h2>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-xs rounded-full ${
                timeRange === 'week' 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'bg-[var(--background)] text-[var(--text-secondary)]'
              }`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-xs rounded-full ${
                timeRange === 'month' 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'bg-[var(--background)] text-[var(--text-secondary)]'
              }`}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-xs rounded-full ${
                timeRange === 'year' 
                  ? 'bg-[var(--primary)] text-white' 
                  : 'bg-[var(--background)] text-[var(--text-secondary)]'
              }`}
            >
              Year
            </button>
          </div>
        </div>
        
        {timelineData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="var(--text-secondary)"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip 
                  formatter={(value, name) => {
                    if (name === 'amount') return [`₹${value.toFixed(2)}`, 'Amount'];
                    if (name === 'count') return [value, 'Transactions'];
                    return [value, name];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  name="amount"
                  stroke="var(--primary)" 
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="count"
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-[var(--background)] rounded-lg">
            <p className="text-[var(--text-secondary)]">No activity data available for this period</p>
          </div>
        )}
      </motion.div>
      
      {/* Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-secondary)] text-sm">Total Transactions</p>
            <div className="p-2 rounded-full bg-[var(--primary-light)]">
              <FiActivity size={16} className="text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalCount}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Avg {stats.avgPerDay.toFixed(1)} per day
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-secondary)] text-sm">Total Amount</p>
            <div className="p-2 rounded-full bg-[var(--primary-light)]">
              <FiPieChart size={16} className="text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2">₹{stats.totalAmount.toFixed(2)}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Avg ₹{stats.avgAmount.toFixed(2)} per day
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-secondary)] text-sm">Most Active Day</p>
            <div className="p-2 rounded-full bg-[var(--primary-light)]">
              <FiCalendar size={16} className="text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-lg font-bold mt-2">
            {stats.mostActiveDay ? stats.mostActiveDay.displayDate : 'N/A'}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {stats.mostActiveDay ? `${stats.mostActiveDay.count} transactions` : 'No data'}
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-secondary)] text-sm">Highest Amount</p>
            <div className="p-2 rounded-full bg-[var(--primary-light)]">
              <FiPieChart size={16} className="text-[var(--primary)]" />
            </div>
          </div>
          <p className="text-lg font-bold mt-2">
            {stats.highestAmountDay ? `₹${stats.highestAmountDay.amount.toFixed(2)}` : 'N/A'}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {stats.highestAmountDay ? stats.highestAmountDay.displayDate : 'No data'}
          </p>
        </motion.div>
      </div>
      
      {/* Activity Distribution */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiCalendar className="mr-2" /> Activity by Day of Week
        </h2>
        
        {weekdayDistribution.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekdayDistribution}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip
                  formatter={(value, name) => {
                    if (name === 'amount') return [`₹${value.toFixed(2)}`, 'Amount'];
                    if (name === 'count') return [value, 'Transactions'];
                    return [value, name];
                  }}
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar
                  dataKey="amount" 
                  name="amount"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="count" 
                  name="count"
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-[var(--background)] rounded-lg">
            <p className="text-[var(--text-secondary)]">No activity distribution data available</p>
          </div>
        )}
      </motion.div>

      {/* Activity Log */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FiClock className="mr-2" /> Activity Log
          </h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <FiFilter className="text-[var(--text-secondary)]" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[var(--background)] text-[var(--text-primary)] text-sm px-2 py-1 rounded border border-[var(--border)]"
            >
              <option value="all">All Activities</option>
              <option value="high">High Amount (≥₹1000)</option>
              <option value="medium">Medium Amount (₹500-999)</option>
              <option value="low">Low Amount (&lt;₹500)</option>
            </select>
          </div>
        </div>
        
        {dashboardData.recentExpenses && dashboardData.recentExpenses.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {getFilteredExpenses().map((expense, idx) => {
              const date = expense.createdAt ? 
                new Date(expense.createdAt.seconds ? expense.createdAt.seconds * 1000 : expense.createdAt) : 
                null;
              
              return (
                <div key={idx} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-[var(--background)]">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--primary)]">
                      {expense.category ? expense.category.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {formatCategoryName(expense.category || 'uncategorized')} • {expense.kittyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{expense.currency || '₹'}{expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {date ? formatDate(date) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {expense.notes && (
                      <p className="text-sm mt-2 text-[var(--text-secondary)] bg-[var(--background)] p-2 rounded">
                        {expense.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--background)] p-6 rounded-lg text-center">
            <p className="text-[var(--text-secondary)]">No activity recorded yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ActivityTab;