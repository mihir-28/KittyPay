import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "./config";

/**
 * Create a new kitty
 * @param {string} userId - The user ID of the kitty creator
 * @param {Object} kittyData - The kitty data
 * @returns {Promise<Object>} - The new kitty object
 */
export const createKitty = async (userId, { name, description, userEmail, userName, currency }) => {
  try {
    // Get user's name from the auth object if available, otherwise use email or "You"
    const displayName = userName || userEmail?.split("@")[0] || "You";

    // Create a current date object instead of using serverTimestamp in arrays
    const currentDate = new Date();

    const kittyRef = await addDoc(collection(db, "kitties"), {
      name,
      description,
      currency: currency || "₹", // Default to ₹ if no currency is provided
      createdBy: userId,
      createdAt: new Date(), // Use Date object here too for consistency
      members: [
        {
          userId,
          name: displayName,
          email: userEmail || "",
          isOwner: true,
          joinedAt: currentDate // Use Date object instead of serverTimestamp in the array
        }
      ],
      expenses: [],
      totalAmount: 0
    });

    return { id: kittyRef.id, success: true };
  } catch (error) {
    console.error("Error creating kitty:", error);
    return { error };
  }
};

/**
 * Get all kitties for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} - Array of kitties
 */
export const getUserKitties = async (userId) => {
  try {
    // Query kitties where the user is a member (by user ID)
    // Firestore can't query for specific fields in array elements directly
    // So we'll query for kitties created by this user first
    const createdByQuery = query(
      collection(db, "kitties"),
      where("createdBy", "==", userId)
    );

    const querySnapshot = await getDocs(createdByQuery);
    const kitties = [];

    querySnapshot.forEach((doc) => {
      kitties.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // TODO: To get kitties where user is a member but not creator,
    // we'd need to structure our data differently or use a Cloud Function
    // For now, this gets kitties created by the user

    return kitties;
  } catch (error) {
    console.error("Error fetching kitties:", error);
    return [];
  }
};

/**
 * Add a new expense to a kitty
 * @param {string} kittyId - The kitty ID
 * @param {Object} expenseData - The expense data
 * @returns {Promise<Object>} - Result of the operation
 */
export const addExpense = async (kittyId, { description, amount, category, notes, paidBy, paidById, participants }) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }

    const currentAmount = kittyDoc.data().totalAmount || 0;
    const parsedAmount = parseFloat(amount);

    // If no specific participants are provided, default to all members
    const kittyData = kittyDoc.data();
    let expenseParticipants = participants || kittyData.members.map(member => ({
      userId: member.userId,
      name: member.name,
      email: member.email
    }));

    // Calculate per person share based on participants
    const perPersonAmount = parsedAmount / expenseParticipants.length;

    const newExpense = {
      id: `exp_${Date.now()}`,
      description,
      amount: parsedAmount,
      category,
      notes: notes || "",
      paidBy,
      paidById,
      participants: expenseParticipants,
      perPersonAmount,
      createdAt: new Date() // Use Date object instead of serverTimestamp in arrays
    };

    await updateDoc(kittyRef, {
      expenses: arrayUnion(newExpense),
      totalAmount: currentAmount + parsedAmount
    });

    return { success: true, expense: newExpense };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { error };
  }
};

/**
 * Add a member to a kitty
 * @param {string} kittyId - The kitty ID
 * @param {Object} memberData - The member data
 * @returns {Promise<Object>} - Result of the operation
 */
export const addMember = async (kittyId, { email, name }) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }

    // In a real app, you would check if the user exists
    // and send them an invitation if they don't
    const newMember = {
      userId: null, // To be filled when they accept the invitation
      email,
      name,
      isOwner: false,
      joinedAt: new Date() // Use Date object instead of serverTimestamp in arrays
    };

    await updateDoc(kittyRef, {
      members: arrayUnion(newMember)
    });

    return { success: true, member: newMember };
  } catch (error) {
    console.error("Error adding member:", error);
    return { error };
  }
};

/**
 * Get a single kitty by ID
 * @param {string} kittyId - The kitty ID
 * @returns {Promise<Object|null>} - The kitty object or null
 */
export const getKittyById = async (kittyId) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return null;
    }

    return {
      id: kittyDoc.id,
      ...kittyDoc.data()
    };
  } catch (error) {
    console.error("Error fetching kitty:", error);
    return null;
  }
};

/**
 * Get dashboard data for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Dashboard data
 */
export const getDashboardData = async (userId) => {
  try {
    // Fetch all kitties for the user
    const kitties = await getUserKitties(userId);

    if (!kitties.length) {
      return {
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
      };
    }

    // Process kitties data
    let totalExpenses = 0;
    let totalSettlements = 0;
    let categoryBreakdown = {};
    let allExpenses = [];
    let pendingSettlements = [];
    let spenderMap = {};
    let expensesByDay = {};
    let kittyExpenses = {};

    // Monthly expenses (array of 12 months)
    const monthlyExpenses = Array(12).fill(0);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    let currentMonthExpenses = 0;
    let previousMonthExpenses = 0;

    kitties.forEach(kitty => {
      // Initialize kitty in expenses map
      kittyExpenses[kitty.id] = {
        name: kitty.name,
        amount: 0,
        currency: kitty.currency || '₹'
      };

      // Add to total expenses
      totalExpenses += kitty.totalAmount || 0;

      // Process expenses
      if (kitty.expenses && kitty.expenses.length) {
        // Add expenses to all expenses array
        allExpenses = [...allExpenses, ...kitty.expenses.map(exp => ({
          ...exp,
          kittyName: kitty.name,
          kittyId: kitty.id,
          currency: kitty.currency
        }))];

        // Process category breakdown
        kitty.expenses.forEach(expense => {
          // Add to kitty expenses for comparison
          kittyExpenses[kitty.id].amount += expense.amount;

          // Process by category
          const category = expense.category || 'uncategorized';
          if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = 0;
          }
          categoryBreakdown[category] += expense.amount;

          // Process by payer (top spenders)
          const payerName = expense.paidBy || 'Unknown';
          const payerId = expense.paidById || 'unknown';
          if (!spenderMap[payerId]) {
            spenderMap[payerId] = {
              name: payerName,
              total: 0,
              count: 0
            };
          }
          spenderMap[payerId].total += expense.amount;
          spenderMap[payerId].count += 1;

          // Add to monthly expenses if from current year
          if (expense.createdAt) {
            const expenseDate = new Date(expense.createdAt.seconds ? expense.createdAt.seconds * 1000 : expense.createdAt);
            
            // Monthly data
            if (expenseDate.getFullYear() === currentYear) {
              const month = expenseDate.getMonth();
              monthlyExpenses[month] += expense.amount;
              
              // Current vs previous month comparison
              if (month === currentMonth) {
                currentMonthExpenses += expense.amount;
              } else if (month === previousMonth) {
                previousMonthExpenses += expense.amount;
              }
            }
            
            // Daily activity heatmap
            const dateKey = expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            if (!expensesByDay[dateKey]) {
              expensesByDay[dateKey] = {
                count: 0,
                amount: 0
              };
            }
            expensesByDay[dateKey].count += 1;
            expensesByDay[dateKey].amount += expense.amount;
          }
        });
      }

      // Calculate pending settlements
      const members = kitty.members || [];
      if (members.length > 1 && kitty.expenses && kitty.expenses.length) {
        // Initialize balances for each member
        const memberBalances = members.map(member => ({
          ...member,
          paid: 0,
          shouldPay: 0,
          owes: 0
        }));

        // Calculate balances
        kitty.expenses.forEach(expense => {
          // Add to the payer's paid amount
          const payer = memberBalances.find(m =>
            (m.userId && m.userId === expense.paidById) ||
            (!m.userId && m.email === expense.paidById)
          );
          if (payer) {
            payer.paid += expense.amount;
          }

          // Calculate what each participant should pay
          const participants = expense.participants || members;
          const perPersonAmount = expense.amount / participants.length;

          participants.forEach(participant => {
            const member = memberBalances.find(m =>
              (m.userId && m.userId === participant.userId) ||
              (!m.userId && m.email === participant.email)
            );
            if (member) {
              member.shouldPay += perPersonAmount;
            }
          });
        });

        // Calculate net balance for each member
        memberBalances.forEach(member => {
          member.owes = member.shouldPay - member.paid;
        });

        // Filter for the current user's settlements
        const userBalance = memberBalances.find(m => m.userId === userId);
        
        if (userBalance) {
          if (userBalance.owes > 0) {
            // User owes money
            const creditors = memberBalances.filter(m => m.owes < 0);
            creditors.forEach(creditor => {
              const settlementAmount = Math.min(userBalance.owes, -creditor.owes);
              if (settlementAmount > 0.01) {
                pendingSettlements.push({
                  kittyId: kitty.id,
                  kittyName: kitty.name,
                  to: creditor.name,
                  toId: creditor.userId || creditor.email,
                  amount: settlementAmount,
                  currency: kitty.currency || '₹'
                });
                totalSettlements += settlementAmount;
              }
            });
          }
        }
      }
    });

    // Convert spender map to sorted array
    const topSpenders = Object.entries(spenderMap)
      .map(([id, data]) => ({
        id,
        name: data.name,
        total: data.total,
        count: data.count
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 spenders

    // Convert kitty expenses to sorted array
    const kittyComparison = Object.values(kittyExpenses)
      .sort((a, b) => b.amount - a.amount);

    // Sort all expenses by date (newest first)
    allExpenses.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    // Get only the 10 most recent expenses
    const recentExpenses = allExpenses.slice(0, 10);

    return {
      totalExpenses,
      totalKitties: kitties.length,
      categoryBreakdown,
      recentExpenses,
      monthlyExpenses,
      pendingSettlements,
      totalSettlements,
      topSpenders,
      expensesByDay,
      kittyComparison,
      previousMonthExpenses,
      currentMonthExpenses
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
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
    };
  }
};
