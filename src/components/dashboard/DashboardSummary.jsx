import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiGrid, FiArrowUp, FiArrowDown, FiTrendingUp } from 'react-icons/fi';

const DashboardSummary = ({ dashboardData }) => {
  // Calculate month-to-month change percentage
  const monthlyChangePercentage = dashboardData.previousMonthExpenses === 0 
    ? dashboardData.currentMonthExpenses > 0 ? 100 : 0
    : ((dashboardData.currentMonthExpenses - dashboardData.previousMonthExpenses) / dashboardData.previousMonthExpenses) * 100;
  
  const isExpenseIncreased = monthlyChangePercentage > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)] text-sm">Total Expenses</p>
            <p className="text-2xl font-bold mt-1">₹{dashboardData.totalExpenses.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-full bg-[var(--primary-light)]">
            <FiDollarSign size={20} className="text-[var(--primary)]" />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)] text-sm">Month-to-Month</p>
            <div className="flex items-center mt-1">
              <p className="text-2xl font-bold">₹{dashboardData.currentMonthExpenses.toFixed(2)}</p>
              <div className={`flex items-center ml-2 ${isExpenseIncreased ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                {isExpenseIncreased ? <FiArrowUp size={16} /> : <FiArrowDown size={16} />}
                <span className="text-xs ml-1">{Math.abs(monthlyChangePercentage).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-full bg-[var(--primary-light)]">
            <FiTrendingUp size={20} className="text-[var(--primary)]" />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)] text-sm">Active Kitties</p>
            <p className="text-2xl font-bold mt-1">{dashboardData.totalKitties}</p>
          </div>
          <div className="p-3 rounded-full bg-[var(--primary-light)]">
            <FiGrid size={20} className="text-[var(--primary)]" />
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[var(--surface)] p-5 rounded-xl shadow-sm border border-[var(--border)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)] text-sm">Pending Settlements</p>
            <p className="text-2xl font-bold mt-1">₹{dashboardData.totalSettlements.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-full bg-[var(--primary-light)]">
            <FiArrowUp size={20} className="text-[var(--primary)]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardSummary; 