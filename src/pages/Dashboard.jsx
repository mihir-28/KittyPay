import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardData } from "../firebase/kitties";
import toast from "react-hot-toast";
import 'react-tooltip/dist/react-tooltip.css';

// Import dashboard components
import DashboardSummary from "../components/dashboard/DashboardSummary";
import DashboardTabs from "../components/dashboard/DashboardTabs";
import OverviewTab from "../components/dashboard/OverviewTab";
import ExpensesTab from "../components/dashboard/ExpensesTab";
import KittiesTab from "../components/dashboard/KittiesTab";
import ActivityTab from "../components/dashboard/ActivityTab";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [dashboardData, setDashboardData] = useState({
    totalExpenses: 0,
    totalKitties: 0,
    categoryBreakdown: {},
    recentExpenses: [],
    monthlyExpenses: Array(12).fill(0),
    pendingSettlements: [],
    totalSettlements: 0,
    topSpenders: [],
    expensesByDay: {},
    kittyComparison: [],
    previousMonthExpenses: 0,
    currentMonthExpenses: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const data = await getDashboardData(currentUser.uid);
          setDashboardData(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          toast.error("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Prepare data for charts
  const prepareChartData = () => {
    // Category breakdown for pie chart
    const categoryData = Object.entries(dashboardData.categoryBreakdown).map(([name, value]) => ({
      name: formatCategoryName(name),
      value
    }));

    // Monthly expenses for line chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = dashboardData.monthlyExpenses.map((value, index) => ({
      name: monthNames[index],
      amount: value
    }));

    // Prepare kitty comparison data
    const kittyData = dashboardData.kittyComparison.map(kitty => ({
      name: kitty.name,
      amount: kitty.amount,
      currency: kitty.currency
    }));

    // Prepare activity heatmap data
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 5);  // Go back 6 months
    
    const heatmapData = Object.entries(dashboardData.expensesByDay).map(([date, data]) => ({
      date,
      count: data.count,
      amount: data.amount
    }));

    // Month-to-month comparison
    const monthComparisonData = [
      {
        name: 'Previous Month',
        amount: dashboardData.previousMonthExpenses
      },
      {
        name: 'Current Month',
        amount: dashboardData.currentMonthExpenses
      }
    ];

    return { 
      categoryData, 
      monthlyData, 
      kittyData, 
      heatmapData, 
      monthComparisonData,
      startDate
    };
  };

  const formatCategoryName = (category) => {
    // Map category codes to readable names with emojis
    const categoryMap = {
      'food': '🍔 Food',
      'groceries': '🛒 Groceries',
      'transport': '🚗 Transport',
      'accommodation': '🏠 Accommodation',
      'entertainment': '🎭 Entertainment',
      'shopping': '🛍️ Shopping',
      'utilities': '💡 Utilities',
      'medical': '🏥 Medical',
      'travel': '✈️ Travel',
      'other': '📦 Other',
      'uncategorized': '❓ Uncategorized'
    };

    return categoryMap[category] || category;
  };

  const { 
    categoryData, 
    monthlyData, 
    kittyData, 
    heatmapData, 
    monthComparisonData,
    startDate
  } = prepareChartData();

  // Calculate month-to-month change percentage
  const monthlyChangePercentage = dashboardData.previousMonthExpenses === 0 
    ? dashboardData.currentMonthExpenses > 0 ? 100 : 0
    : ((dashboardData.currentMonthExpenses - dashboardData.previousMonthExpenses) / dashboardData.previousMonthExpenses) * 100;
  
  const isExpenseIncreased = monthlyChangePercentage > 0;

  // Colors for pie chart
  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#FF595E'];
  
  const formatDate = (dateObj) => {
    if (!dateObj) return "N/A";
    const date = dateObj.seconds ? new Date(dateObj.seconds * 1000) : new Date(dateObj);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-6 md:px-10 py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Stats */}
      <DashboardSummary dashboardData={dashboardData} />

      {/* Tab Navigation */}
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'all' && (
        <OverviewTab 
          dashboardData={dashboardData}
          monthlyData={monthlyData}
          categoryData={categoryData}
          monthComparisonData={monthComparisonData}
          formatCategoryName={formatCategoryName}
          formatDate={formatDate}
          COLORS={COLORS}
          monthlyChangePercentage={monthlyChangePercentage}
          isExpenseIncreased={isExpenseIncreased}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab 
          dashboardData={dashboardData}
          categoryData={categoryData}
          COLORS={COLORS}
          formatCategoryName={formatCategoryName}
        />
      )}

      {activeTab === 'kitties' && (
        <KittiesTab 
          dashboardData={dashboardData}
          kittyData={kittyData}
          COLORS={COLORS}
        />
      )}

      {activeTab === 'activity' && (
        <ActivityTab 
          dashboardData={dashboardData}
          heatmapData={heatmapData}
          startDate={startDate}
          formatCategoryName={formatCategoryName}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default Dashboard; 