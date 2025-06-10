import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getKittyById, updateKittyExpense, updateKittySettlement, deleteKittyExpense, updateKittyMember, removeKittyMember, deleteKitty } from "../firebase/kitties";
import { trackSettlement } from "../firebase/analytics";
import { FiArrowLeft, FiDollarSign, FiUsers, FiEdit2, FiCheck, FiX, FiTrash2, FiUser, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Custom confirmation alert component
const ConfirmationAlert = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <FiAlertTriangle size={24} className="text-red-500" />,
          confirmButtonClass: "bg-red-500 hover:bg-red-600 text-white",
          confirmTextColor: "text-red-600"
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle size={24} className="text-amber-500" />,
          confirmButtonClass: "bg-amber-500 hover:bg-amber-600 text-white",
          confirmTextColor: "text-amber-600"
        };
      default:
        return {
          icon: <FiAlertTriangle size={24} className="text-blue-500" />,
          confirmButtonClass: "bg-blue-500 hover:bg-blue-600 text-white",
          confirmTextColor: "text-blue-600"
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[var(--surface)] rounded-xl shadow-lg max-w-md w-full overflow-hidden"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-center mb-4">
            {typeStyles.icon}
            <h3 className="text-xl font-bold ml-3">{title}</h3>
          </div>

          <p className="mb-6 text-[var(--text-secondary)]">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg ${typeStyles.confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const KittyDetails = ({ kittyId, onBack }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [kitty, setKitty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [settledTransactions, setSettledTransactions] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDeleteMemberConfirmation, setShowDeleteMemberConfirmation] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleShowConfirmation = (e) => {
    if (e.detail && e.detail.type === 'deleteKitty') {
      setShowDeleteConfirmation(true);
    } else if (e.detail && e.detail.type === 'deleteMember') {
      setMemberToDelete(e.detail.member);
      setShowDeleteMemberConfirmation(true);
    }
  };

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

  useEffect(() => {
    document.addEventListener('SHOW_DELETE_CONFIRMATION', handleShowConfirmation);

    return () => {
      document.removeEventListener('SHOW_DELETE_CONFIRMATION', handleShowConfirmation);
    };
  }, []);

  useEffect(() => {
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
      setIsLoading(true);

      // Create a copy of the settlements array
      const updatedSettlements = [...settledTransactions];

      // Check if this settlement is already in the settled transactions
      const existingSettlementIndex = updatedSettlements.findIndex(
        st => st.from === settlement.from && st.to === settlement.to && st.amount === settlement.amount
      );

      if (existingSettlementIndex !== -1) {
        // Settlement exists - toggle it
        updatedSettlements[existingSettlementIndex] = {
          ...updatedSettlements[existingSettlementIndex],
          settled: !updatedSettlements[existingSettlementIndex].settled
        };
      } else {
        // Settlement doesn't exist - add it with settled=true
        updatedSettlements.push({
          ...settlement,
          settled: true
        });
      }

      // Update the settlements in Firestore
      const { error } = await updateKittySettlement(kittyId, updatedSettlements);

      if (error) {
        toast.error('Failed to update settlement status');
        console.error(error);
        setIsLoading(false);
        return;
      }

      // If marking as settled, track the settlement
      const isNowSettled = existingSettlementIndex !== -1 ?
        updatedSettlements[existingSettlementIndex].settled :
        true;

      if (isNowSettled) {
        trackSettlement(kittyId, settlement.amount);
      }

      // Update local state
      setSettledTransactions(updatedSettlements);
      toast.success('Settlement status updated');

      // Refetch kitty to update balances
      fetchKitty();
    } catch (err) {
      console.error('Error updating settlement:', err);
      toast.error('An error occurred while updating the settlement');
    } finally {
      setIsLoading(false);
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

  const handleEditMember = (member) => {
    setEditingMember(member);
  };

  const handleCancelEditMember = () => {
    setEditingMember(null);
  };

  const handleSaveMember = async (updatedMember) => {
    try {
      const memberId = updatedMember.userId || updatedMember.email;
      const result = await updateKittyMember(kittyId, memberId, {
        name: updatedMember.name,
        email: updatedMember.email
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Update local state
      const updatedMembers = kitty.members.map(member => {
        const memberIdentifier = member.userId || member.email;
        if (memberIdentifier === memberId) {
          return { ...member, ...updatedMember };
        }
        return member;
      });

      // Update expenses where this member is involved
      const updatedExpenses = kitty.expenses.map(expense => {
        // Update participants
        const updatedParticipants = expense.participants?.map(participant => {
          const participantId = participant.userId || participant.email;
          if (participantId === memberId) {
            return { ...participant, name: updatedMember.name, email: updatedMember.email };
          }
          return participant;
        }) || [];

        // Update payer name if this member is the payer
        const updatedPaidBy = expense.paidById === memberId ? updatedMember.name : expense.paidBy;

        return {
          ...expense,
          participants: updatedParticipants,
          paidBy: updatedPaidBy
        };
      });

      setKitty({
        ...kitty,
        members: updatedMembers,
        expenses: updatedExpenses
      });

      setEditingMember(null);
      toast.success("Member updated successfully");
    } catch (error) {
      console.error("Error updating member:", error);
      toast.error("Failed to update member");
    }
  };

  const handleDeleteMember = async (member) => {
    try {
      const memberId = member.userId || member.email;

      // Cannot delete the owner
      if (member.isOwner) {
        toast.error("Cannot remove the owner of the kitty");
        return;
      }

      // Cannot delete yourself (for security)
      if (member.userId === currentUser.uid) {
        toast.error("You cannot remove yourself. Leave the kitty instead.");
        return;
      }

      const result = await removeKittyMember(kittyId, memberId);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update local state - remove the member
      const updatedMembers = kitty.members.filter(m => {
        const mId = m.userId || m.email;
        return mId !== memberId;
      });

      // Update expenses to reflect member removal
      const updatedExpenses = kitty.expenses.map(expense => {
        // Skip if this member is the payer of the expense
        if (expense.paidById === memberId) {
          return expense;
        }

        // Remove member from participants
        const updatedParticipants = expense.participants?.filter(participant => {
          const participantId = participant.userId || participant.email;
          return participantId !== memberId;
        }) || [];

        return {
          ...expense,
          participants: updatedParticipants
        };
      });

      setKitty({
        ...kitty,
        members: updatedMembers,
        expenses: updatedExpenses
      });

      setEditingMember(null);
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleDeleteKitty = async () => {
    // Show confirmation dialog
    document.dispatchEvent(new CustomEvent('SHOW_DELETE_CONFIRMATION', {
      detail: {
        title: "Delete Kitty?",
        message: `Are you sure you want to delete "${kitty.name}"? This will permanently delete all expenses and member data. This action cannot be undone.`,
        onConfirm: async () => {
          try {
            const loadingToast = toast.loading("Deleting kitty...");
            const result = await deleteKitty(kittyId, currentUser.uid);

            if (result.error) {
              toast.dismiss(loadingToast);
              toast.error(result.error);
              return;
            }

            toast.dismiss(loadingToast);
            toast.success("Kitty deleted successfully");
            // Pass deleted kitty ID back to parent
            onBack({ deleted: true, kittyId });
          } catch (error) {
            console.error("Error deleting kitty:", error);
            toast.error("Failed to delete kitty");
          }
        },
        type: 'danger'
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  } if (!kitty) return null;

  const isOwner = kitty.members.find(m => m.userId === currentUser.uid)?.isOwner;

  return (
    <div className="w-full mx-auto max-w-8xl px-3 sm:px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-[var(--primary)] hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Kitties
        </button>

        {isOwner && (
          <button
            onClick={handleDeleteKitty}
            className="flex items-center text-red-500 hover:text-red-600"
          >
            <FiTrash2 className="mr-1" /> Delete Kitty
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Header section - spans full width */}
        <div className="xl:col-span-12 bg-[var(--surface)] p-4 md:p-6 rounded-xl shadow-sm border border-[var(--border)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">{kitty.name}</h1>
              <p className="text-[var(--text-secondary)] max-w-2xl">{kitty.description}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="flex -space-x-2 mr-4">
                {kitty.members.slice(0, 3).map((member, idx) => (
                  <div
                    key={member.userId || idx}
                    className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white border-2 border-[var(--surface)]"
                    title={member.name}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {kitty.members.length > 3 && (
                  <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--text-primary)] border-2 border-[var(--surface)]">
                    +{kitty.members.length - 3}
                  </div>
                )}
              </div>
              <div className="font-semibold text-xl">
                {kitty.currency || '$'}{kitty.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Left sidebar - members and balances */}
        <div className="xl:col-span-4 space-y-6">
          {/* Members section */}
          <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FiUsers className="mr-2" /> Members ({kitty.members.length})
            </h2>
            <div className="bg-[var(--background)] p-3 rounded-lg">
              <ul className="divide-y divide-[var(--border)]">
                {kitty.members.map((member, idx) => (
                  <li key={member.userId || idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{member.name} {member.isOwner && "(Owner)"}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{member.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditMember(member)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface)] rounded-full"
                      title="Edit member"
                    >
                      <FiEdit2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Member Balances section */}
          <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FiDollarSign className="mr-2" /> Balances
            </h2>

            {/* Your balance highlighted card - only visible for your own balance */}
            {balances.filter(b => b.name === "You").map((balance, idx) => (
              <div
                key={idx}
                className={`p-4 mb-4 rounded-lg ${balance.owes > 0 ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30' :
                  balance.owes < 0 ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30' :
                    'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white">
                      {balance.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 font-medium">Your Balance</span>
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

            {/* Other members balances */}
            <div className="bg-[var(--background)] p-3 rounded-lg">
              <ul className="divide-y divide-[var(--border)]">
                {balances.filter(b => b.name !== "You").map((balance, idx) => (
                  <li key={balance.userId || idx} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-xs">
                          {balance.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="ml-2 font-medium">{balance.name}</span>
                      </div>

                      {balance.owes > 0 ? (
                        <span className="text-sm text-red-600 dark:text-red-400 font-semibold">
                          Owes {kitty.currency || '$'}{balance.owes.toFixed(2)}
                        </span>
                      ) : balance.owes < 0 ? (
                        <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                          Gets {kitty.currency || '$'}{Math.abs(balance.owes).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold">
                          Settled
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                      <div>Paid: {kitty.currency || '$'}{balance.paid.toFixed(2)}</div>
                      <div>Share: {kitty.currency || '$'}{balance.shouldPay.toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right content area - expenses and settlements */}
        <div className="xl:col-span-8 space-y-6">
          {/* Expenses section */}
          <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
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
                        <th className="py-3 px-4 text-left">Amount</th>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kitty.expenses.map((expense, idx) => (
                        <tr key={expense.id || idx} className="border-t border-[var(--border)] hover:bg-[var(--surface)]/50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{expense.description}</div>
                            {expense.notes && (
                              <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
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
                              <span className="text-sm">
                                {expense.participants.length === kitty.members.length ?
                                  "Everyone" :
                                  expense.participants.map(p => p.name).join(", ")
                                }
                              </span>
                            ) : (
                              <span className="text-sm">Everyone</span>
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
                <div className="md:hidden space-y-3">
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
              <p className="text-center py-6 bg-[var(--background)] rounded-lg text-[var(--text-secondary)]">
                No expenses yet
              </p>
            )}
          </div>

          {/* Net Settlement Plan section */}
          <div className="bg-[var(--surface)] p-4 rounded-xl shadow-sm border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-3">Settlement Plan</h3>
            <div className="bg-[var(--background)] p-4 rounded-lg">
              <p className="mb-3 text-sm text-[var(--text-secondary)]">
                The following transactions will settle all balances with the minimum number of payments:
              </p>

              <div className="space-y-3">
                {calculateSettlements().map((settlement, idx) => {
                  const isSettled = settledTransactions.some(
                    st => st.from === settlement.from && st.to === settlement.to &&
                      st.amount === settlement.amount && st.settled === true
                  );

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row sm:items-center p-3 rounded-md ${isSettled
                        ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30'
                        : 'bg-[var(--surface)] border border-[var(--border)]'
                        } shadow-sm`}
                    >
                      {/* Mobile layout (stacked) */}
                      <div className="flex w-full justify-between items-center sm:hidden">
                        <div className="flex items-center">
                          <div className="w-7 h-7 bg-red-500 text-white dark:bg-red-900/20 dark:text-red-400 rounded-full flex items-center justify-center mr-2">
                            <span className="text-sm font-semibold">-</span>
                          </div>
                          <span className="font-medium">{settlement.from}</span>
                        </div>
                        <div className="font-bold text-lg">{kitty.currency || '$'}{settlement.amount.toFixed(2)}</div>
                      </div>
                      <div className="flex w-full justify-between items-center mt-2 sm:hidden">
                        <div className="flex items-center">
                          <div className="w-7 h-7 bg-green-500 text-white dark:bg-green-900/20 dark:text-green-400 rounded-full flex items-center justify-center mr-2">
                            <span className="text-sm font-semibold">+</span>
                          </div>
                          <span className="font-medium">{settlement.to}</span>
                        </div>
                        <button
                          onClick={() => handleSettlementToggle(settlement, idx)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${isSettled
                            ? 'bg-green-500 text-white dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-[var(--background)] text-[var(--text-secondary)]'
                            }`}
                        >
                          {isSettled ? 'Settled' : 'Mark settled'}
                        </button>
                      </div>

                      {/* Desktop layout (horizontal) - equally spaced 4-column grid */}
                      <div className="hidden sm:grid sm:grid-cols-4 w-full gap-2">
                        {/* Column 1: Payer */}
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-red-500 text-white dark:bg-red-900/20 dark:text-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold">-</span>
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium truncate block">{settlement.from}</span>
                            <div className="text-xs text-[var(--text-secondary)]">should pay</div>
                          </div>
                        </div>

                        {/* Column 2: Amount */}
                        <div className="flex justify-center items-center">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="text-lg font-bold">{kitty.currency || '$'}{settlement.amount.toFixed(2)}</div>
                            <div className="text-xs text-[var(--text-secondary)]">to</div>
                          </div>
                        </div>

                        {/* Column 3: Receiver */}
                        <div className="flex items-center space-x-2">
                          <div className="min-w-0">
                            <span className="font-medium truncate block">{settlement.to}</span>
                            <div className="text-xs text-[var(--text-secondary)]">will receive</div>
                          </div>
                          <div className="w-7 h-7 bg-green-500 text-white dark:bg-green-900/20 dark:text-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold">+</span>
                          </div>
                        </div>

                        {/* Column 4: Action Button */}
                        <div className="flex justify-end items-center">
                          <button
                            onClick={() => handleSettlementToggle(settlement, idx)}
                            className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${isSettled
                              ? 'bg-green-500 text-white dark:bg-green-900/20 dark:text-green-400'
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
                      </div>
                    </div>
                  );
                })}
              </div>

              {calculateSettlements().length === 0 && (
                <div className="text-center py-8 bg-[var(--surface)] rounded-md border border-[var(--border)] shadow-sm">
                  <span className="font-medium text-lg">Everyone is settled up!</span>
                  <p className="text-sm mt-1 text-[var(--text-secondary)]">All balances are even.</p>
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

      {/* Edit Member Modal */}
      {editingMember && (
        <MemberEditForm
          member={editingMember}
          kitty={kitty}
          onSave={handleSaveMember}
          onCancel={handleCancelEditMember}
          onDelete={handleDeleteMember}
          currentUser={currentUser}
        />
      )}

      {/* Confirmation Alert */}
      <ConfirmationAlert
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteKitty}
        title="Delete Kitty?"
        message="Are you sure you want to delete this kitty? This action cannot be undone."
      />

      {/* Member Delete Confirmation */}
      {showDeleteMemberConfirmation && memberToDelete && (
        <ConfirmationAlert
          isOpen={showDeleteMemberConfirmation}
          onClose={() => setShowDeleteMemberConfirmation(false)}
          onConfirm={() => handleDeleteMember(memberToDelete)}
          title="Remove Member?"
          message={`Are you sure you want to remove ${memberToDelete.name} from this kitty? Their expenses will remain, but they won't be part of future expenses. This action cannot be undone.`}
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
    // Show custom confirmation instead of window.confirm
    document.dispatchEvent(new CustomEvent('SHOW_DELETE_CONFIRMATION', {
      detail: {
        title: "Delete Expense?",
        message: `Are you sure you want to delete the expense "${expense.description}" of ${kitty.currency || '$'}${expense.amount.toFixed(2)}? This action cannot be undone.`,
        onConfirm: () => onDelete(expense),
        type: 'danger'
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
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

// Member edit form component
const MemberEditForm = ({ member, onSave, onCancel, onDelete, kitty, currentUser }) => {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    userId: member.userId
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!formData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    onSave(formData);
  };

  const handleDeleteConfirm = () => {
    // Show custom confirmation instead of window.confirm
    document.dispatchEvent(new CustomEvent('SHOW_DELETE_CONFIRMATION', {
      detail: {
        title: `Remove ${member.name}?`,
        message: `Are you sure you want to remove ${member.name} from this kitty? Their expenses will remain, but they won't be part of future expenses. This action cannot be undone.`,
        onConfirm: () => onDelete(member),
        type: 'danger'
      }
    }));
  };

  const isCurrentUser = member.userId === currentUser.uid;
  const isOwner = member.isOwner;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[var(--surface)] rounded-xl shadow-lg max-w-md w-full my-4 overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold">
            {isCurrentUser ? "Edit Your Details" : `Edit Member: ${member.name}`}
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="memberName" className="block mb-1 sm:mb-2 text-sm font-medium">
                Name*
              </label>
              <input
                type="text"
                id="memberName"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="Member name"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="memberEmail" className="block mb-1 sm:mb-2 text-sm font-medium">
                Email*
              </label>
              <input
                type="email"
                id="memberEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                placeholder="member@example.com"
                required
              />
            </div>

            {isOwner && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30">
                <div className="flex items-center">
                  <div className="text-amber-600 dark:text-amber-400 mr-2">
                    <FiUsers size={18} />
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    This member is the owner of the kitty and cannot be removed.
                  </p>
                </div>
              </div>
            )}

            {isCurrentUser && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
                <div className="flex items-center">
                  <div className="text-blue-600 dark:text-blue-400 mr-2">
                    <FiUser size={18} />
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This is you. Changes will update how you appear to others in this kitty.
                  </p>
                </div>
              </div>
            )}

            {/* Footer with action buttons */}
            <div className="flex justify-between mt-5 sm:mt-6">
              {!isOwner && !isCurrentUser && (
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
                >
                  <FiTrash2 className="mr-1" /> Remove
                </button>
              )}
              {(isOwner || isCurrentUser) && (
                <div></div> // Empty div to maintain spacing when delete button is hidden
              )}

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
