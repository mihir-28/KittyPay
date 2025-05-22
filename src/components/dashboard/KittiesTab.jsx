import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { FiGrid } from 'react-icons/fi';

const KittiesTab = ({ dashboardData, kittyData, COLORS }) => {
  return (
    <div className="space-y-6">
      {/* Kitty Comparison */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiGrid className="mr-2" /> Kitty Comparison
        </h2>
        
        {kittyData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kittyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-secondary)"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Total Amount']}
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
                  name="Amount"
                  radius={[4, 4, 0, 0]}
                >
                  {kittyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-[var(--text-secondary)]">No kitty data available</p>
          </div>
        )}
      </motion.div>

      {/* Kitty Details Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--surface)] p-4 sm:p-6 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiGrid className="mr-2" /> Kitty Details
        </h2>
        
        {kittyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--background)]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Kitty Name</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">% of Total</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {kittyData.map((kitty, idx) => (
                  <tr key={idx} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="font-medium">{kitty.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {kitty.currency}{kitty.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {((kitty.amount / dashboardData.totalExpenses) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => window.location.href = `/kitties?id=${dashboardData.kittyComparison[idx]?.id || ''}`}
                        className="text-xs px-3 py-1 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[var(--background)] p-6 rounded-lg text-center">
            <p className="text-[var(--text-secondary)]">No kitties available</p>
            <button 
              onClick={() => window.location.href = '/kitties'}
              className="mt-3 text-sm px-4 py-2 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
            >
              Create a Kitty
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default KittiesTab; 