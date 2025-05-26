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

/**
 * Update an expense in a kitty
 * @param {string} kittyId - The kitty ID
 * @param {Object} updatedExpense - The updated expense data
 * @returns {Promise<Object>} - Result of the operation
 */
export const updateKittyExpense = async (kittyId, updatedExpense) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }

    const kittyData = kittyDoc.data();
    const expenses = kittyData.expenses || [];
    
    // Find the expense to update
    const expenseIndex = expenses.findIndex(exp => exp.id === updatedExpense.id);
    
    if (expenseIndex === -1) {
      return { error: "Expense not found" };
    }
    
    // Calculate the difference in amount
    const oldAmount = expenses[expenseIndex].amount;
    const newAmount = updatedExpense.amount;
    const amountDifference = newAmount - oldAmount;
    
    // Calculate per person share based on participants
    const participants = updatedExpense.participants || kittyData.members;
    const perPersonAmount = newAmount / participants.length;
    
    // Update the expense with new values
    expenses[expenseIndex] = {
      ...expenses[expenseIndex],
      ...updatedExpense,
      perPersonAmount
    };
    
    // Update the total amount
    const newTotalAmount = kittyData.totalAmount + amountDifference;
    
    await updateDoc(kittyRef, {
      expenses: expenses,
      totalAmount: newTotalAmount
    });

    return { success: true, expense: expenses[expenseIndex] };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { error: error.message };
  }
};

/**
 * Update settlement status in a kitty
 * @param {string} kittyId - The kitty ID
 * @param {Array} settledTransactions - Array of settled transactions
 * @returns {Promise<Object>} - Result of the operation
 */
export const updateKittySettlement = async (kittyId, settledTransactions) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }
    
    await updateDoc(kittyRef, {
      settledTransactions
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating settlements:", error);
    return { error: error.message };
  }
};

/**
 * Delete an expense from a kitty
 * @param {string} kittyId - The kitty ID
 * @param {string} expenseId - The ID of the expense to delete
 * @returns {Promise<Object>} - Result of the operation
 */
export const deleteKittyExpense = async (kittyId, expenseId) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }

    const kittyData = kittyDoc.data();
    const expenses = kittyData.expenses || [];
    
    // Find the expense to delete
    const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
    
    if (expenseIndex === -1) {
      return { error: "Expense not found" };
    }
    
    // Get the amount of the expense to subtract from total
    const expenseAmount = expenses[expenseIndex].amount;
    
    // Remove the expense from the array
    const updatedExpenses = [
      ...expenses.slice(0, expenseIndex),
      ...expenses.slice(expenseIndex + 1)
    ];
    
    // Update the total amount
    const newTotalAmount = kittyData.totalAmount - expenseAmount;
    
    await updateDoc(kittyRef, {
      expenses: updatedExpenses,
      totalAmount: newTotalAmount
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { error: error.message };
  }
};

/**
 * Update a member in a kitty
 * @param {string} kittyId - The kitty ID
 * @param {string} memberId - The user ID or email of the member to update
 * @param {Object} updatedData - The updated member data (name, email)
 * @returns {Promise<Object>} - Result of the operation
 */
export const updateKittyMember = async (kittyId, memberId, updatedData) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }

    const kittyData = kittyDoc.data();
    const members = kittyData.members || [];
    
    // Find the member to update (by userId or by email if userId is null)
    const memberIndex = members.findIndex(member => 
      (member.userId && member.userId === memberId) || 
      (!member.userId && member.email === memberId)
    );
    
    if (memberIndex === -1) {
      return { error: "Member not found" };
    }
    
    // Update member with new values
    members[memberIndex] = {
      ...members[memberIndex],
      name: updatedData.name || members[memberIndex].name,
      email: updatedData.email || members[memberIndex].email
    };
    
    // Also update this member in any expense participants
    const expenses = kittyData.expenses || [];
    const updatedExpenses = expenses.map(expense => {
      const participants = expense.participants || [];
      const updatedParticipants = participants.map(participant => {
        if ((participant.userId && participant.userId === memberId) ||
            (!participant.userId && participant.email === memberId)) {
          return {
            ...participant,
            name: updatedData.name || participant.name,
            email: updatedData.email || participant.email
          };
        }
        return participant;
      });
      
      return {
        ...expense,
        participants: updatedParticipants,
        // If this member is the payer, update the payer name
        paidBy: expense.paidById === memberId ? 
          updatedData.name || expense.paidBy : 
          expense.paidBy
      };
    });
    
    await updateDoc(kittyRef, {
      members: members,
      expenses: updatedExpenses
    });

    return { success: true, member: members[memberIndex] };
  } catch (error) {
    console.error("Error updating member:", error);
    return { error: error.message };
  }
};

/**
 * Remove a member from a kitty
 * @param {string} kittyId - The kitty ID
 * @param {string} memberId - The user ID or email of the member to remove
 * @returns {Promise<Object>} - Result of the operation
 */
export const removeKittyMember = async (kittyId, memberId) => {
  try {
    const kittyRef = doc(db, "kitties", kittyId);
    const kittyDoc = await getDoc(kittyRef);

    if (!kittyDoc.exists()) {
      return { error: "Kitty not found" };
    }

    const kittyData = kittyDoc.data();
    const members = kittyData.members || [];
    
    // Find the member to remove (by userId or by email if userId is null)
    const memberIndex = members.findIndex(member => 
      (member.userId && member.userId === memberId) || 
      (!member.userId && member.email === memberId)
    );
    
    if (memberIndex === -1) {
      return { error: "Member not found" };
    }
    
    // Cannot remove the owner of the kitty
    if (members[memberIndex].isOwner) {
      return { error: "Cannot remove the owner of the kitty" };
    }
    
    // Remove the member from the array
    const updatedMembers = [
      ...members.slice(0, memberIndex),
      ...members.slice(memberIndex + 1)
    ];
    
    // Also update any expense participants to remove this member
    const expenses = kittyData.expenses || [];
    const updatedExpenses = expenses.map(expense => {
      // Skip if this member is the payer of the expense
      if (expense.paidById === memberId) {
        return expense;
      }
      
      // Remove member from participants
      const participants = expense.participants || [];
      const updatedParticipants = participants.filter(participant => 
        !((participant.userId && participant.userId === memberId) ||
          (!participant.userId && participant.email === memberId))
      );
      
      // Recalculate per person amount if participants changed
      const perPersonAmount = updatedParticipants.length ? 
        expense.amount / updatedParticipants.length : 
        expense.amount;
      
      return {
        ...expense,
        participants: updatedParticipants,
        perPersonAmount
      };
    });
    
    await updateDoc(kittyRef, {
      members: updatedMembers,
      expenses: updatedExpenses
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing member:", error);
    return { error: error.message };
  }
};
