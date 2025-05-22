import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { FiPieChart, FiUsers, FiArrowUp } from 'react-icons/fi';

const ExpensesTab = ({ dashboardData, categoryData, COLORS, formatCategoryName }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Full Category Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiPieChart className="mr-2" /> Full Category Breakdown
        </h2>
        
        {categoryData.length > 0 ? (
          <>
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-sm border-b border-[var(--border)] pb-2">Detailed Breakdown</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {categoryData.map((category, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--background)]">
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span>{category.name}</span>
                    </div>
                    <div>
                      <span className="font-medium">₹{category.value.toFixed(2)}</span>
                      <span className="text-xs text-[var(--text-secondary)] ml-2">
                        ({((category.value / dashboardData.totalExpenses) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-[var(--text-secondary)]">No category data available</p>
          </div>
        )}
      </motion.div>

      {/* Right Column - Top Spenders */}
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiUsers className="mr-2" /> Top Spenders
          </h2>
          
          {dashboardData.topSpenders.length > 0 ? (
            <div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.topSpenders}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--text-secondary)" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100}
                      stroke="var(--text-secondary)" 
                    />
                    <RechartsTooltip
                      formatter={(value, name) => {
                        if (name === 'total') return [`₹${value.toFixed(2)}`, 'Total Spent'];
                        if (name === 'count') return [value, 'Number of Expenses'];
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
                      dataKey="total" 
                      fill="var(--primary)" 
                      name="total"
                      radius={[0, 4, 4, 0]}
                    >
                      {dashboardData.topSpenders.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-sm border-b border-[var(--border)] pb-2">Spender Details</h3>
                <div className="space-y-3">
                  {dashboardData.topSpenders.map((spender, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--background)]">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center mr-3">
                          <span className="text-[var(--primary)] font-medium">{idx + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{spender.name}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{spender.count} expenses</div>
                        </div>
                      </div>
                      <div className="font-medium">₹{spender.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-[var(--text-secondary)]">No spender data available</p>
            </div>
          )}
        </motion.div>

        {/* Pending Settlements */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FiArrowUp className="mr-2" /> Pending Settlements
          </h2>
          
          {dashboardData.pendingSettlements.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.pendingSettlements.map((settlement, idx) => (
                <div key={idx} className="bg-[var(--background)] p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">{settlement.to}</p>
                    <p className="text-xs text-[var(--text-secondary)]">From {settlement.kittyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500 dark:text-red-400">{settlement.currency}{settlement.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--background)] p-6 rounded-lg text-center">
              <p className="text-[var(--text-secondary)]">No pending settlements</p>
              <p className="text-sm mt-1">You're all settled up!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExpensesTab; 