import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getKittyById, updateKittyExpense, updateKittySettlement, deleteKittyExpense } from "../firebase/kitties";
import { FiArrowLeft, FiDollarSign, FiUsers, FiEdit2, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const KittyDetails = ({ kittyId, onBack }) => {
  const [kitty, setKitty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [settledTransactions, setSettledTransactions] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchKitty = async () => {
      try {
        setLoading(true);
        const kittyData = await getKittyById(kittyId);

        if (!kittyData) {
          toast.error("Kitty not found");
          onBack();
          return;
        }

        // Format the kitty data
        const formattedKitty = {
          ...kittyData,
          // Mark the current user as "You"
          members: kittyData.members.map(member => {
            if (member.userId === currentUser.uid) {
              return { ...member, name: "You" };
            }
            return member;
          })
        };

        // Load settled transactions if they exist
        if (kittyData.settledTransactions) {
          setSettledTransactions(kittyData.settledTransactions);
        }

        setKitty(formattedKitty);
      } catch (error) {
        console.error("Error fetching kitty details:", error);
        toast.error("Failed to load kitty details");
      } finally {
        setLoading(false);
      }
    };

    if (kittyId) {
      fetchKitty();
    }
  }, [kittyId, currentUser, onBack]);
  // Calculate what each person owes
  const calculateBalances = () => {
    if (!kitty || !kitty.members || !kitty.expenses) return [];

    // Initialize balances for each member
    const memberBalances = kitty.members.map(member => ({
      ...member,
      paid: 0, // Total amount paid by this member
      shouldPay: 0, // Total amount this member should have paid based on participation
      owes: 0 // Net balance (positive means they owe, negative means they are owed)
    }));
    // Calculate how much each person paid and should have paid
    kitty.expenses.forEach(expense => {
      // Add to the payer's paid amount
      // Check both userId and email to identify the payer correctly
      const payer = memberBalances.find(m =>
        (m.userId && m.userId === expense.paidById) ||
        (!m.userId && m.email === expense.paidById)
      );
      if (payer) {
        payer.paid += expense.amount;
      }

      // Calculate what each participant should pay for this expense
      const participants = expense.participants || kitty.members;
      const perPersonAmount = expense.amount / participants.length;

      // For each participant, add to their shouldPay amount
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

    return memberBalances;
  };
  const balances = kitty ? calculateBalances() : [];
  // Function to calculate settlement plan (minimum number of transactions)
  const calculateSettlements = () => {
    if (!balances.length) return [];

    // Deep copy the balances to avoid mutating the original array
    const members = JSON.parse(JSON.stringify(balances));

    // Filter members who owe money (positive balance) or are owed money (negative balance)
    const debtors = members.filter(member => member.owes > 0.01)
      .sort((a, b) => b.owes - a.owes); // Sort by amount owed (highest first)

    const creditors = members.filter(member => member.owes < -0.01)
      .sort((a, b) => a.owes - b.owes); // Sort by amount owed (lowest/most negative first)

    const settlements = [];

    // Create settlement transactions until all debts are resolved
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];

      // Calculate how much can be settled in this transaction
      const amount = Math.min(debtor.owes, -creditor.owes);

      // Add the settlement transaction if the amount is significant
      if (amount > 0.01) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: parseFloat(amount.toFixed(2))
        });
      }

      // Update balances
      debtor.owes -= amount;
      creditor.owes += amount;

      // Remove members who have settled their balance
      if (Math.abs(debtor.owes) < 0.01) debtors.shift();
      if (Math.abs(creditor.owes) < 0.01) creditors.shift();
    }

    return settlements;
  };

  const handleSettlementToggle = async (settlement, index) => {
    try {
      const isSettled = settledTransactions.some(
        st => st.from === settlement.from && st.to === settlement.to && st.amount === settlement.amount
      );
      
      let updatedSettledTransactions;
      
      if (isSettled) {
        // Remove from settled transactions
        updatedSettledTransactions = settledTransactions.filter(
          st => !(st.from === settlement.from && st.to === settlement.to && st.amount === settlement.amount)
        );
      } else {
        // Add to settled transactions
        updatedSettledTransactions = [
          ...settledTransactions,
          { ...settlement, settledAt: new Date() }
        ];
      }
      
      // Update state
      setSettledTransactions(updatedSettledTransactions);
      
      // Update in Firebase
      await updateKittySettlement(kittyId, updatedSettledTransactions);
      
      toast.success(isSettled ? "Settlement marked as unsettled" : "Settlement marked as settled");
    } catch (error) {
      console.error("Error updating settlement status:", error);
      toast.error("Failed to update settlement status");
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleSaveExpense = async (updatedExpense) => {
    try {
      await updateKittyExpense(kittyId, updatedExpense);
      
      // Update local state
      const updatedExpenses = kitty.expenses.map(exp => 
        exp.id === updatedExpense.id ? updatedExpense : exp
      );
      
      setKitty({
        ...kitty,
        expenses: updatedExpenses,
        totalAmount: updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      });
      
      setEditingExpense(null);
      toast.success("Expense updated successfully");
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense");
    }
  };

  const handleDeleteExpense = async (expense) => {
    try {
      const result = await deleteKittyExpense(kittyId, expense.id);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update local state
      const updatedExpenses = kitty.expenses.filter(exp => exp.id !== expense.id);
      const newTotalAmount = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      setKitty({
        ...kitty,
        expenses: updatedExpenses,
        totalAmount: newTotalAmount
      });
      
      setEditingExpense(null);
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );  }  if (!kitty) return null;
  return (
    <div className="w-full mx-auto px-3 sm:px-6 md:px-8 py-4">
      <button
        onClick={onBack}
        className="flex items-center mb-6 text-[var(--primary)] hover:underline"
      >
        <FiArrowLeft className="mr-2" /> Back to Kitties
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{kitty.name}</h1>
        <p className="text-[var(--text-secondary)]">{kitty.description}</p>
      </div>      {/* Main content with 30% left, 70% right layout on desktop */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left sidebar - 30% on desktop */}
        <div className="w-full lg:w-[30%] space-y-4">          {/* Members section */}
          <div className="bg-[var(--surface)] p-3 md:p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-3">Members ({kitty.members.length})</h2>
            <div className="bg-[var(--background)] p-3 rounded-lg">
              <ul className="space-y-2">
                {kitty.members.map((member, idx) => (
                  <li key={member.userId || idx} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{member.name} {member.isOwner && "(Owner)"}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{member.email}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>          {/* Summary section */}
          <div className="bg-[var(--surface)] p-3 md:p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-3">Summary</h2>
            <div className="bg-[var(--background)] p-3 rounded-lg">
              <div className="flex justify-between mb-3 pb-3 border-b border-[var(--border)]">
                <span>Total spent</span>
                <span className="font-semibold">{kitty.currency || '$'}{kitty.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Your share</span>
                <span className="font-semibold">{kitty.currency || '$'}{balances.find(b => b.name === "You")?.shouldPay.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Your balance card - only visible on mobile */}
          <div className="lg:hidden">
            {balances.filter(b => b.name === "You").map((balance, idx) => (
              <div
                key={idx}
                className={`p-3 md:p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] ${
                  balance.owes > 0 ? 'border-l-4 border-l-red-400' :
                  balance.owes < 0 ? 'border-l-4 border-l-green-400' : ''
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                    {balance.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 font-medium">Your Balance</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total paid</span>
                    <span className="font-medium">{kitty.currency || '$'}{balance.paid.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Fair share</span>
                    <span className="font-medium">{kitty.currency || '$'}{balance.shouldPay.toFixed(2)}</span>
                  </div>

                  <div className="h-px bg-[var(--border)] my-2"></div>

                  {balance.owes > 0 ? (
                    <div className="flex justify-between text-red-600 dark:text-red-400">
                      <span>You owe</span>
                      <span className="font-bold">{kitty.currency || '$'}{balance.owes.toFixed(2)}</span>
                    </div>
                  ) : balance.owes < 0 ? (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>You are owed</span>
                      <span className="font-bold">{kitty.currency || '$'}{Math.abs(balance.owes).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Balance</span>
                      <span className="font-bold">{kitty.currency || '$'}0.00</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>        </div>

        {/* Right content area - 70% on desktop */}
        <div className="w-full lg:w-[70%] space-y-4">          {/* Expenses section */}
          <div className="bg-[var(--surface)] p-3 md:p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-3">All Expenses</h2>
            {kitty.expenses && kitty.expenses.length > 0 ? (
              <>
                {/* Table view for desktop */}
                <div className="hidden md:block bg-[var(--background)] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--surface)]">
                      <tr>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-left">Category</th>
                        <th className="py-3 px-4 text-left">Paid By</th>
                        <th className="py-3 px-4 text-left">Shared With</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">Date</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kitty.expenses.map((expense, idx) => (
                        <tr key={expense.id || idx} className="border-t border-[var(--border)]">
                          <td className="py-3 px-4">
                            {expense.description}
                            {expense.notes && (
                              <div className="text-xs text-[var(--text-secondary)] mt-1">
                                {expense.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {expense.category ? (
                              <span className="inline-flex items-center">
                                {expense.category === 'food' && '🍔 Food & Dining'}
                                {expense.category === 'groceries' && '🛒 Groceries'}
                                {expense.category === 'transport' && '🚗 Transportation'}
                                {expense.category === 'accommodation' && '🏠 Accommodation'}
                                {expense.category === 'entertainment' && '🎭 Entertainment'}
                                {expense.category === 'shopping' && '🛍️ Shopping'}
                                {expense.category === 'utilities' && '💡 Utilities'}
                                {expense.category === 'medical' && '🏥 Medical'}
                                {expense.category === 'travel' && '✈️ Travel'}
                                {expense.category === 'other' && '📦 Other'}
                                {!['food', 'groceries', 'transport', 'accommodation', 'entertainment', 'shopping', 'utilities', 'medical', 'travel', 'other'].includes(expense.category) && expense.category}
                              </span>
                            ) : (
                              <span className="text-sm text-[var(--text-secondary)]">No category</span>
                            )}
                          </td>
                          <td className="py-3 px-4">{expense.paidBy}</td>
                          <td className="py-3 px-4">
                            {expense.participants ? (
                              <div className="flex flex-wrap gap-1">
                                {expense.participants.length === kitty.members.length ? (
                                  <span className="text-sm text-[var(--text-secondary)]">Everyone</span>
                                ) : (
                                  expense.participants.map((p, i) => (
                                    <span key={i} className="text-sm bg-[var(--background)] px-1.5 py-0.5 rounded">
                                      {p.name}
                                    </span>
                                  ))
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-[var(--text-secondary)]">Everyone</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{kitty.currency || '$'}{expense.amount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right text-[var(--text-secondary)]">
                            {expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleEditExpense(expense)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-full"
                              title="Edit expense"
                            >
                              <FiEdit2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card view for mobile */}
                <div className="md:hidden space-y-4">
                  {kitty.expenses.map((expense, idx) => (
                    <div key={expense.id || idx} className="bg-[var(--background)] rounded-lg p-4 shadow-sm border border-[var(--border)]">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-lg">{expense.description}</h3>
                        <div className="flex items-center">
                          <div className="font-bold text-lg mr-3">{kitty.currency || '$'}{expense.amount.toFixed(2)}</div>
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-full"
                            title="Edit expense"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {expense.category && (
                          <div className="flex justify-between">
                            <span className="text-sm text-[var(--text-secondary)]">Category</span>
                            <span className="text-sm font-medium">
                              {expense.category === 'food' && '🍔 Food & Dining'}
                              {expense.category === 'groceries' && '🛒 Groceries'}
                              {expense.category === 'transport' && '🚗 Transportation'}
                              {expense.category === 'accommodation' && '🏠 Accommodation'}
                              {expense.category === 'entertainment' && '🎭 Entertainment'}
                              {expense.category === 'shopping' && '🛍️ Shopping'}
                              {expense.category === 'utilities' && '💡 Utilities'}
                              {expense.category === 'medical' && '🏥 Medical'}
                              {expense.category === 'travel' && '✈️ Travel'}
                              {expense.category === 'other' && '📦 Other'}
                              {!['food', 'groceries', 'transport', 'accommodation', 'entertainment', 'shopping', 'utilities', 'medical', 'travel', 'other'].includes(expense.category) && expense.category}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-sm text-[var(--text-secondary)]">Paid by</span>
                          <span className="text-sm font-medium">{expense.paidBy}</span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm text-[var(--text-secondary)] mb-1">Shared with</span>
                          <div className="flex flex-wrap gap-1">
                            {expense.participants ? (
                              expense.participants.length === kitty.members.length ? (
                                <span className="text-sm">Everyone</span>
                              ) : (
                                expense.participants.map((p, i) => (
                                  <span key={i} className="text-xs bg-[var(--surface)] px-2 py-1 rounded-full">
                                    {p.name}
                                  </span>
                                ))
                              )
                            ) : (
                              <span className="text-sm">Everyone</span>
                            )}
                          </div>
                        </div>

                        {expense.notes && (
                          <div className="flex flex-col pt-2 mt-2 border-t border-[var(--border)]">
                            <span className="text-sm text-[var(--text-secondary)] mb-1">Notes</span>
                            <p className="text-sm">{expense.notes}</p>
                          </div>
                        )}

                        <div className="flex justify-between pt-2 mt-2 border-t border-[var(--border)]">
                          <span className="text-xs text-[var(--text-secondary)]">Date</span>
                          <span className="text-xs">
                            {expense.createdAt ? new Date(expense.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center py-4 bg-[var(--background)] rounded-lg text-[var(--text-secondary)]">
                No expenses yet
              </p>
            )}
          </div>          {/* Member Balances section */}
          <div className="bg-[var(--surface)] p-3 md:p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-xl font-bold mb-3">Member Balances</h2>
            <p className="mb-3 text-sm text-[var(--text-secondary)]">
              These balances show what each person has paid, what they should have paid based on their participation in expenses, and their net balance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {balances.map((balance, idx) => (
                <div
                  key={balance.userId || idx}
                  className={`p-3 md:p-4 rounded-lg ${
                    balance.owes > 0 ? 'bg-red-50 dark:bg-red-900/10' :
                    balance.owes < 0 ? 'bg-green-50 dark:bg-green-900/10' :
                    'bg-[var(--background)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                        {balance.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-3 font-medium">{balance.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total paid</span>
                      <span className="font-medium">{kitty.currency || '$'}{balance.paid.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Fair share</span>
                      <span className="font-medium">{kitty.currency || '$'}{balance.shouldPay.toFixed(2)}</span>
                    </div>

                    <div className="h-px bg-[var(--border)] my-2"></div>

                    {balance.owes > 0 ? (
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Owes others</span>
                        <span className="font-bold">{kitty.currency || '$'}{balance.owes.toFixed(2)}</span>
                      </div>
                    ) : balance.owes < 0 ? (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Gets back</span>
                        <span className="font-bold">{kitty.currency || '$'}{Math.abs(balance.owes).toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Balance</span>
                        <span className="font-bold">{kitty.currency || '$'}0.00</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>          {/* Net Settlement Plan section */}
          <div className="bg-[var(--surface)] p-3 md:p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-3">Net Settlement Plan</h3>
            <div className="bg-[var(--background)] p-3 rounded-lg">
              <p className="mb-3 text-sm text-[var(--text-secondary)]">
                The following transactions will settle all balances with the minimum number of payments:
              </p>

              <div className="space-y-3">
                {calculateSettlements().map((settlement, idx) => {
                  const isSettled = settledTransactions.some(
                    st => st.from === settlement.from && st.to === settlement.to && st.amount === settlement.amount
                  );
                  
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row justify-between items-center p-3 rounded-md ${
                        isSettled 
                          ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30' 
                          : 'bg-[var(--surface)] border border-[var(--border)]'
                      } shadow-sm`}
                    >
                      {/* Mobile layout (stacked) */}
                      <div className="flex w-full justify-between items-center sm:hidden">
                        <div className="flex items-center">
                          <div className="w-7 h-7 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mr-2">
                            <span className="text-sm font-semibold">-</span>
                          </div>
                          <span className="font-medium">{settlement.from}</span>
                        </div>
                        <div className="font-bold text-lg">{kitty.currency || '$'}{settlement.amount.toFixed(2)}</div>
                      </div>
                      <div className="flex w-full justify-between items-center mt-2 sm:hidden">
                        <div className="flex items-center">
                          <div className="w-7 h-7 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mr-2">
                            <span className="text-sm font-semibold">+</span>
                          </div>
                          <span className="font-medium">{settlement.to}</span>
                        </div>
                        <button
                          onClick={() => handleSettlementToggle(settlement, idx)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isSettled 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-[var(--background)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {isSettled ? 'Settled' : 'Mark settled'}
                        </button>
                      </div>

                      {/* Desktop layout (horizontal) */}
                      <div className="hidden sm:flex items-center space-x-2">
                        <div className="w-7 h-7 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                          <span className="text-sm font-semibold">-</span>
                        </div>
                        <div>
                          <span className="font-medium">{settlement.from}</span>
                          <div className="text-xs text-[var(--text-secondary)]">should pay</div>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-center px-2">
                        <div className="text-lg font-bold">{kitty.currency || '$'}{settlement.amount.toFixed(2)}</div>
                        <div className="text-xs text-[var(--text-secondary)]">to</div>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2">
                        <div>
                          <span className="font-medium">{settlement.to}</span>
                          <div className="text-xs text-[var(--text-secondary)]">will receive</div>
                        </div>
                        <div className="w-7 h-7 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                          <span className="text-sm font-semibold">+</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSettlementToggle(settlement, idx)}
                        className={`hidden sm:flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          isSettled 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                        }`}
                      >
                        {isSettled ? (
                          <>
                            <FiCheck className="mr-1.5" size={14} />
                            Settled
                          </>
                        ) : (
                          'Mark settled'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {calculateSettlements().length === 0 && (
                <div className="text-center py-6 text-[var(--text-secondary)] bg-[var(--surface)] rounded-md border border-[var(--border)] shadow-sm">
                  <span className="font-medium">Everyone is settled up!</span>
                  <p className="text-sm mt-1">All balances are even.</p>
                </div>
              )}

              <p className="mt-4 text-xs text-[var(--text-secondary)]">
                This plan minimizes the total number of transactions needed to settle all balances in the kitty.
                Mark transactions as settled once they've been completed.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseEditForm
          expense={editingExpense}
          kitty={kitty}
          onSave={handleSaveExpense}
          onCancel={handleCancelEdit}
          onDelete={handleDeleteExpense}
        />
      )}
    </div>
  );
};

// Expense edit form component
const ExpenseEditForm = ({ expense, onSave, onCancel, onDelete, kitty }) => {
  const [formData, setFormData] = useState({
    description: expense.description,
    amount: expense.amount,
    category: expense.category || '',
    notes: expense.notes || '',
    paidById: expense.paidById || '',
    participants: expense.participants || [],
    date: expense.createdAt ? 
      new Date(expense.createdAt.seconds ? expense.createdAt.seconds * 1000 : expense.createdAt)
        .toISOString().substring(0, 10) : 
      new Date().toISOString().substring(0, 10)
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleParticipantToggle = (participantId) => {
    const isSelected = formData.participants.some(p => 
      (p.userId && p.userId === participantId) || 
      (!p.userId && p.email === participantId)
    );
    
    let updatedParticipants;
    if (isSelected) {
      updatedParticipants = formData.participants.filter(p => 
        !((p.userId && p.userId === participantId) || 
        (!p.userId && p.email === participantId))
      );
    } else {
      const member = kitty.members.find(m => 
        (m.userId && m.userId === participantId) || 
        (!m.userId && m.email === participantId)
      );
      if (member) {
        updatedParticipants = [...formData.participants, {
          userId: member.userId,
          name: member.name,
          email: member.email
        }];
      } else {
        updatedParticipants = formData.participants;
      }
    }
    
    setFormData({ ...formData, participants: updatedParticipants });
  };

  const handleSelectAllParticipants = (select) => {
    if (select) {
      const allParticipants = kitty.members.map(member => ({
        userId: member.userId,
        name: member.name,
        email: member.email
      }));
      setFormData({ ...formData, participants: allParticipants });
    } else {
      setFormData({ ...formData, participants: [] });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get the payer information
    const payer = kitty.members.find(m =>
      (m.userId === formData.paidById) ||
      (!m.userId && m.email === formData.paidById)
    );

    if (!payer) {
      toast.error("Please select who paid");
      return;
    }

    if (formData.participants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }
    
    // Convert the date string to a Date object
    const expenseDate = new Date(formData.date);
    
    onSave({ 
      ...expense, 
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
      notes: formData.notes,
      paidById: formData.paidById,
      paidBy: payer.name,
      participants: formData.participants,
      createdAt: {
        seconds: Math.floor(expenseDate.getTime() / 1000),
        nanoseconds: 0
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      onDelete(expense);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
    >
      <div className="bg-[var(--surface)] rounded-xl shadow-lg max-w-2xl w-full my-4 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">Edit Expense</h2>
          <button
            onClick={onCancel}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="max-h-[60vh] overflow-y-auto scrollbar-hide px-0.5">
            {/* Two-column layout for larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div>
                <div className="mb-3 sm:mb-4">
                  <label htmlFor="expenseDescription" className="block mb-1 sm:mb-2 text-sm font-medium">
                    Description*
                  </label>
                  <input
                    type="text"
                    id="expenseDescription"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    placeholder="Short title for the expense"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label htmlFor="expenseCategory" className="block mb-1 sm:mb-2 text-sm font-medium">
                    Category*
                  </label>
                  <select
                    id="expenseCategory"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="food">🍔 Food & Dining</option>
                    <option value="groceries">🛒 Groceries</option>
                    <option value="transport">🚗 Transportation</option>
                    <option value="accommodation">🏠 Accommodation</option>
                    <option value="entertainment">🎭 Entertainment</option>
                    <option value="shopping">🛍️ Shopping</option>
                    <option value="utilities">💡 Utilities</option>
                    <option value="medical">🏥 Medical</option>
                    <option value="travel">✈️ Travel</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div className="mb-3 sm:mb-4">
                  <label htmlFor="expensePayer" className="block mb-1 sm:mb-2 text-sm font-medium">
                    Paid by*
                  </label>
                  <select
                    id="expensePayer"
                    name="paidById"
                    value={formData.paidById}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    required
                  >
                    <option value="">Select who paid</option>
                    {kitty.members.map((member, idx) => (
                      <option
                        key={member.userId || member.email || idx}
                        value={member.userId || member.email}
                      >
                        {member.name} {member.isOwner && "(Owner)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3 sm:mb-4">
                  <label htmlFor="expenseAmount" className="block mb-1 sm:mb-2 text-sm font-medium">
                    Amount*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-[var(--text-secondary)]">{kitty.currency || '$'}</span>
                    </div>
                    <input
                      type="number"
                      id="expenseAmount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full pl-8 pr-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div>
                <div className="mb-3 sm:mb-4">
                  <label htmlFor="expenseDate" className="block mb-1 sm:mb-2 text-sm font-medium">
                    Date*
                  </label>
                  <input
                    type="date"
                    id="expenseDate"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    required
                  />
                </div>

                <div className="mb-3 sm:mb-4">
                  <label htmlFor="expenseNotes" className="block mb-1 sm:mb-2 text-sm font-medium">
                    Notes (optional)
                  </label>
                  <textarea
                    id="expenseNotes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                    placeholder="Additional details"
                    rows={2}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <label className="block text-sm font-medium">
                      Who's involved?*
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllParticipants(true)}
                        className="text-xs text-[var(--primary)] hover:underline"
                      >
                        All
                      </button>
                      <span className="text-xs">|</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAllParticipants(false)}
                        className="text-xs text-[var(--primary)] hover:underline"
                      >
                        None
                      </button>
                    </div>
                  </div>
                  <div className="bg-[var(--background)] p-1.5 rounded-lg max-h-28 sm:max-h-32 overflow-y-auto scrollbar-hide mb-1 sm:mb-2 border border-[var(--border)]">
                    {kitty.members.map((member, idx) => {
                      const isSelected = formData.participants.some(p => 
                        (p.userId && p.userId === (member.userId || member.email)) || 
                        (!p.userId && p.email === (member.userId || member.email))
                      );
                      
                      return (
                        <div
                          key={member.userId || member.email || idx}
                          className="flex items-center p-1.5 hover:bg-[var(--surface)] rounded-md"
                        >
                          <input
                            type="checkbox"
                            id={`participant-edit-${idx}`}
                            checked={isSelected}
                            onChange={() => handleParticipantToggle(member.userId || member.email)}
                            className="w-4 h-4 text-[var(--primary)] rounded"
                          />
                          <label
                            htmlFor={`participant-edit-${idx}`}
                            className="ml-2 w-full cursor-pointer text-sm truncate"
                          >
                            {member.name} {member.isOwner && "(Owner)"}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Split equally among selected people
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="flex justify-between mt-5 sm:mt-6">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
              >
                <FiTrash2 className="mr-1" /> Delete
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default KittyDetails;
