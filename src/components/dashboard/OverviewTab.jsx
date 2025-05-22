import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { FiCalendar, FiClock, FiPieChart, FiTrendingUp } from 'react-icons/fi';

const OverviewTab = ({ 
  dashboardData, 
  monthlyData, 
  categoryData, 
  monthComparisonData, 
  formatCategoryName, 
  formatDate, 
  COLORS, 
  monthlyChangePercentage, 
  isExpenseIncreased,
  setActiveTab
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Monthly Expenses Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiCalendar className="mr-2" /> Monthly Expenses
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip 
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
                  name="Amount" 
                  stroke="var(--primary)" 
                  fill="var(--primary-light)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiClock className="mr-2" /> Recent Expenses
          </h2>
          
          {dashboardData.recentExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--background)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Kitty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Amount</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentExpenses.map((expense, idx) => (
                    <tr key={expense.id || idx} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-sm">{expense.description}</td>
                      <td className="px-4 py-3 text-sm">{formatCategoryName(expense.category || 'uncategorized')}</td>
                      <td className="px-4 py-3 text-sm">{expense.kittyName}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {expense.currency || '₹'}{expense.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-[var(--text-secondary)]">
                        {formatDate(expense.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-[var(--text-secondary)]">No expenses recorded yet</p>
          )}
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Month-to-Month Comparison */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiTrendingUp className="mr-2" /> Monthly Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthComparisonData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
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
                  fill="var(--primary)" 
                  name="Amount"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {isExpenseIncreased 
                ? `Spending increased by ${Math.abs(monthlyChangePercentage).toFixed(1)}% from last month`
                : monthlyChangePercentage === 0
                  ? 'No change in spending from last month'
                  : `Spending decreased by ${Math.abs(monthlyChangePercentage).toFixed(1)}% from last month`
              }
            </p>
          </div>
        </motion.div>

        {/* Expense Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiPieChart className="mr-2" /> Expense Categories
          </h2>
          
          {categoryData.length > 0 ? (
            <div className="h-64 flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                    labelStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-[var(--text-secondary)]">No category data available</p>
            </div>
          )}

          {/* Category breakdown list - top 3 only for overview */}
          {categoryData.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2 text-sm">Top Categories</h3>
              <div className="space-y-2">
                {categoryData.slice(0, 3).map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">₹{category.value.toFixed(2)}</span>
                  </div>
                ))}
                {categoryData.length > 3 && (
                  <div className="text-center">
                    <button 
                      onClick={() => setActiveTab('expenses')} 
                      className="text-xs text-[var(--primary)] hover:underline mt-2"
                    >
                      View all categories
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewTab; 