import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { FiPlus, FiTrash2, FiEdit2, FiDollarSign, FiUsers, FiX, FiEye, FiAlertTriangle } from "react-icons/fi";
import { createKitty, getUserKitties, addExpense, addMember, deleteKitty } from "../firebase/kitties";
import { trackKittyCreated, trackExpenseAdded, trackMemberAdded } from "../firebase/analytics";
import KittyDetails from "../components/KittyDetails";
import { getMemberIdentifier } from "../utils/memberUtils";

// Inline styles for cross-browser scroll hiding
const hideScrollbarStyle = {
  scrollbarWidth: 'none', /* Firefox */
  msOverflowStyle: 'none'  /* IE and Edge */
};

const Kitties = () => {
  const { currentUser } = useAuth();
  const [kitties, setKitties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentKitty, setCurrentKitty] = useState(null);
  const [selectedKittyId, setSelectedKittyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [kittyToDelete, setKittyToDelete] = useState(null);
  
  // Form states
  const [kittyName, setKittyName] = useState("");
  const [kittyDescription, setKittyDescription] = useState("");
  const [kittyCurrency, setKittyCurrency] = useState("₹");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseParticipants, setExpenseParticipants] = useState([]);
  const [expensePayer, setExpensePayer] = useState(""); // Who paid for the expense
  const [memberEmail, setMemberEmail] = useState("");
  const [memberName, setMemberName] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");

  // Add style tag for WebKit browsers
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    // Add style to head
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch kitties from Firebase
  useEffect(() => {
    const fetchKitties = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const userKitties = await getUserKitties(currentUser.uid);

          // Format the kitties data for our UI
          const formattedKitties = userKitties.map(kitty => {
            // Find the current user in members and rename to "You"
            const updatedMembers = kitty.members.map(member => {
              if (member.userId === currentUser.uid) {
                return { ...member, name: "You" };
              }
              return member;
            });

            return {
              ...kitty,
              members: updatedMembers
            };
          });

          setKitties(formattedKitties);
        } catch (error) {
          console.error("Error fetching kitties:", error);
          toast.error("Failed to load kitties");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchKitties();
  }, [currentUser]);

  const handleCreateKitty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!kittyName.trim()) {
      setError('Kitty name is required');
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading("Creating kitty...");

    try {
      const result = await createKitty(currentUser.uid, {
        name: kittyName,
        description: kittyDescription,
        currency: kittyCurrency,
        userEmail: currentUser.email,
        userName: currentUser.displayName
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to create kitty");
      }

      // Track kitty creation
      trackKittyCreated(result.id, kittyName);

      // Create a new kitty object for the UI until we refresh
      const newKitty = {
        id: result.id,
        name: kittyName,
        description: kittyDescription,
        currency: kittyCurrency,
        totalAmount: 0,
        createdAt: new Date(),
        createdBy: currentUser.uid,
        members: [
          { userId: currentUser.uid, name: "You", email: currentUser.email, isOwner: true }
        ],
        expenses: []
      };

      setKitties([...kitties, newKitty]);
      toast.success("Kitty created successfully!");
      setShowCreateModal(false);
      setKittyName("");
      setKittyDescription("");
      setKittyCurrency("₹");
    } catch (error) {
      console.error("Error creating kitty:", error);
      toast.error(error.message || "Failed to create kitty");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!expenseAmount || !expenseDescription || !expensePayer || !expenseCategory) {
      setError("Please fill in all required expense details");
      setIsSubmitting(false);
      return;
    }

    if (expenseParticipants.length === 0) {
      setError("Please select at least one participant");
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading("Adding expense...");

    try {
      const amount = parseFloat(expenseAmount);
      if (isNaN(amount) || amount <= 0) {
        setError("Amount must be a positive number");
        setIsSubmitting(false);
        return;
      }

      // Get selected participants from the form
      const participants = expenseParticipants.map(participantId => {
        const member = currentKitty.members.find(m =>
          getMemberIdentifier(m) === participantId
        );
        return member;
      }).filter(Boolean);
      // Get the payer information
      const payer = currentKitty.members.find(m =>
        getMemberIdentifier(m) === expensePayer
      );

      const result = await addExpense(currentKitty.id, {
        description: expenseDescription,
        amount: amount,
        category: expenseCategory,
        notes: expenseNotes,
        paidBy: payer.name, // Display name of who paid
        paidById: getMemberIdentifier(payer), // ID of who paid
        participants: participants
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to add expense");
      }

      // Track expense added
      trackExpenseAdded(currentKitty.id, amount, expenseCategory);

      // Update the UI with the new expense
      const updatedKitties = kitties.map(kitty => {
        if (kitty.id === currentKitty.id) {
          const newExpense = {
            ...result.expense,
            date: new Date()
          };

          return {
            ...kitty,
            expenses: [...kitty.expenses, newExpense],
            totalAmount: kitty.totalAmount + amount
          };
        }
        return kitty;
      });

      setKitties(updatedKitties);
      toast.success("Expense added successfully!");
      setShowExpenseModal(false);
      setExpenseAmount("");
      setExpenseDescription("");
      setExpenseCategory("");
      setExpenseNotes("");
      setExpenseParticipants([]);
      setExpensePayer("");
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error(error.message || "Failed to add expense");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!memberName) {
      setError("Please enter a name");
      setIsSubmitting(false);
      return;
    }

    // Check for duplicate members based on name and email/memberId
    const isDuplicate = currentKitty.members.some(member => {
      // If email is provided, check both name and email
      if (memberEmail && memberEmail.trim()) {
        return member.name.toLowerCase().trim() === memberName.toLowerCase().trim() || 
               (member.email && member.email.toLowerCase().trim() === memberEmail.toLowerCase().trim());
      }
      // If no email provided, only check name (since memberIds are unique by timestamp)
      return member.name.toLowerCase().trim() === memberName.toLowerCase().trim();
    });

    if (isDuplicate) {
      setError("This member is already in the kitty");
      setIsSubmitting(false);
      return;
    }

    const loadingToast = toast.loading("Adding member...");

    try {
      const result = await addMember(currentKitty.id, {
        email: memberEmail.trim(),
        name: memberName.trim()
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to add member");
      }

      // Track member added
      trackMemberAdded(currentKitty.id);

      // Update the UI with the new member
      const updatedKitties = kitties.map(kitty => {
        if (kitty.id === currentKitty.id) {
          return {
            ...kitty,
            members: [...kitty.members, result.member]
          };
        }
        return kitty;
      });

      setKitties(updatedKitties);
      toast.success("Member added successfully!");
      setShowMemberModal(false);
      setMemberEmail("");
      setMemberName("");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error(error.message || "Failed to add member");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const openExpenseModal = (kitty) => {
    setCurrentKitty(kitty);
    // Pre-select all members as participants by default
    const allParticipantIds = kitty.members.map(member =>
      getMemberIdentifier(member)
    );
    setExpenseParticipants(allParticipantIds);
    // Set current user as the default payer
    setExpensePayer(currentUser.uid);
    setExpenseCategory("");
    setExpenseNotes("");
    setError('');
    setShowExpenseModal(true);
  };

  const openMemberModal = (kitty) => {
    setCurrentKitty(kitty);
    setMemberEmail("");
    setMemberName("");
    setError('');
    setShowMemberModal(true);
  };

  const calculateUserShare = (kitty) => {
    if (!kitty.members.length) return 0;

    // If the kitty doesn't have expenses with participants info, use the simple calculation
    if (!kitty.expenses || kitty.expenses.length === 0 || !kitty.expenses[0].participants) {
      return (kitty.totalAmount / kitty.members.length).toFixed(2);
    }

    // Calculate based on the user's actual participation in expenses
    let userTotal = 0;
    kitty.expenses.forEach(expense => {
      // Check if participants are defined
      if (expense.participants) {
        // Check if current user is a participant in this expense
        const isParticipant = expense.participants.some(participant =>
          getMemberIdentifier(participant) === getMemberIdentifier({ userId: currentUser.uid, email: currentUser.email })
        );

        if (isParticipant) {
          userTotal += expense.amount / expense.participants.length;
        }
      } else {
        // If no participants info, assume split equally
        userTotal += expense.amount / kitty.members.length;
      }
    });

    return userTotal.toFixed(2);
  };

  // Handle participant selection
  const handleParticipantToggle = (participantId) => {
    setExpenseParticipants(prev => {
      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      } else {
        return [...prev, participantId];
      }
    });
  };

  // Select/deselect all participants
  const handleSelectAllParticipants = (select) => {
    if (!currentKitty) return;

    if (select) {
      // Select all members
      const allParticipantIds = currentKitty.members.map(member =>
        getMemberIdentifier(member)
      );
      setExpenseParticipants(allParticipantIds);
    } else {
      // Deselect all
      setExpenseParticipants([]);
    }
  };

  // View a specific kitty's details
  const viewKittyDetails = (kittyId) => {
    setSelectedKittyId(kittyId);
  };

  // Go back to the kitties list
  const handleBackToKitties = (data) => {
    setSelectedKittyId(null);
    
    // Check if a kitty was deleted in the details view
    if (data && data.deleted && data.kittyId) {
      // Update the kitties list by removing the deleted kitty
      const updatedKitties = kitties.filter(kitty => kitty.id !== data.kittyId);
      setKitties(updatedKitties);
    }
  };

  const handleDeleteKitty = async () => {
    if (!kittyToDelete) return;
    
    setIsSubmitting(true);
    const loadingToast = toast.loading("Deleting kitty...");
    
    try {
      const result = await deleteKitty(kittyToDelete.id, currentUser.uid);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update the UI
      const updatedKitties = kitties.filter(kitty => kitty.id !== kittyToDelete.id);
      setKitties(updatedKitties);
      
      toast.success("Kitty deleted successfully");
    } catch (error) {
      console.error("Error deleting kitty:", error);
      toast.error(error.message || "Failed to delete kitty");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
      setShowDeleteConfirmation(false);
      setKittyToDelete(null);
    }
  };

  const openDeleteConfirmation = (kitty) => {
    setKittyToDelete(kitty);
    setShowDeleteConfirmation(true);
  };

  return (
    <div className="w-full mx-auto px-3 sm:px-6 md:px-10 py-10">
      {selectedKittyId ? (
        <KittyDetails kittyId={selectedKittyId} onBack={handleBackToKitties} />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Kitties</h1>
            {kitties.length > 0 && (
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setError('');
                }}
                className="bg-[var(--primary)] hover:opacity-90 text-white py-2 px-4 rounded-lg flex items-center gap-2"
              >
                <FiPlus /> New Kitty
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : kitties.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl mb-4">No kitties yet</h3>
              <p className="mb-6 text-[var(--text-secondary)]">Create your first kitty to start tracking shared expenses</p>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setError('');
                }}
                className="bg-[var(--primary)] hover:opacity-90 text-white py-2 px-6 rounded-lg flex items-center gap-2 mx-auto"
              >
                <FiPlus /> Create Kitty
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kitties.map(kitty => (
                <motion.div
                  key={kitty.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[var(--surface)] p-4 sm:p-5 rounded-xl shadow-sm border border-[var(--border)] flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold">{kitty.name}</h2>
                    {kitty.members.some(m => m.userId === currentUser.uid && m.isOwner) && (
                      <button
                        onClick={() => openDeleteConfirmation(kitty)}
                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 rounded"
                        title="Delete kitty"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-[var(--text-secondary)] mb-4">{kitty.description}</p>

                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--border)]">
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Total</p>
                      <p className="text-2xl font-semibold">{kitty.currency || '$'}{kitty.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-secondary)]">Your share</p>
                      <p className="text-2xl font-semibold">{kitty.currency || '$'}{calculateUserShare(kitty)}</p>
                    </div>
                  </div>

                  <div className="mb-3 pb-3 border-b border-[var(--border)]">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Members ({kitty.members.length})</h3>
                      <button
                        onClick={() => openMemberModal(kitty)}
                        className="text-[var(--primary)] hover:underline text-sm flex items-center gap-1"
                      >
                        <FiPlus size={14} /> Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {kitty.members.map((member, idx) => (
                        <span
                          key={getMemberIdentifier(member) || idx}
                          className="bg-[var(--background)] px-2 py-1 rounded-lg text-sm"
                        >
                          {member.name}
                          {member.isOwner && " (Owner)"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Recent Expenses</h3>
                      <button
                        onClick={() => openExpenseModal(kitty)}
                        className="text-[var(--primary)] hover:underline text-sm flex items-center gap-1"
                      >
                        <FiPlus size={14} /> Add
                      </button>
                    </div>
                    {(kitty.expenses || []).length > 0 ? (
                      <div className="space-y-2">
                        {(kitty.expenses || []).slice(0, 2).map((expense, idx) => (
                          <div
                            key={expense.id || idx}
                            className="flex justify-between items-center bg-[var(--background)] p-2 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium">{expense.description}</p>
                              <p className="text-xs text-[var(--text-secondary)]">
                                {expense.category && (
                                  <span className="inline-block mr-1">
                                    {expense.category === 'food' && '🍔'}
                                    {expense.category === 'groceries' && '🛒'}
                                    {expense.category === 'transport' && '🚗'}
                                    {expense.category === 'accommodation' && '🏠'}
                                    {expense.category === 'entertainment' && '🎭'}
                                    {expense.category === 'shopping' && '🛍️'}
                                    {expense.category === 'utilities' && '💡'}
                                    {expense.category === 'medical' && '🏥'}
                                    {expense.category === 'travel' && '✈️'}
                                    {expense.category === 'other' && '📦'}
                                  </span>
                                )}
                                Paid by {expense.paidBy}
                              </p>
                            </div>
                            <p className="font-semibold">{kitty.currency || '$'}{expense.amount}</p>
                          </div>
                        ))}
                        {(kitty.expenses || []).length > 2 && (
                          <p className="text-center text-sm text-[var(--text-secondary)]">
                            + {kitty.expenses.length - 2} more expenses
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-center text-[var(--text-secondary)] py-2">
                        No expenses yet
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center gap-3 mt-auto">
                    <button
                      onClick={() => openExpenseModal(kitty)}
                      className="flex items-center gap-1 bg-[var(--background)] hover:bg-[var(--primary)] hover:text-white py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      <span className="flex items-center">
                        {kitty.currency || '$'}
                      </span>
                      <span className="ml-1">Add Expense</span>
                    </button>
                    <button
                      onClick={() => openMemberModal(kitty)}
                      className="flex items-center gap-1 bg-[var(--background)] hover:bg-[var(--primary)] hover:text-white py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      <FiUsers /> Add Member
                    </button>
                    <button
                      onClick={() => viewKittyDetails(kitty.id)}
                      className="flex items-center gap-1 bg-[var(--background)] hover:bg-[var(--primary)] hover:text-white py-2 px-3 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      <FiEye /> View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[var(--surface)] p-5 sm:p-6 rounded-xl w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Create New Kitty</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateKitty}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="kittyName" className="block mb-2 text-sm font-medium">
                      Kitty Name*
                    </label>
                    <input
                      type="text"
                      id="kittyName"
                      value={kittyName}
                      onChange={e => setKittyName(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="Weekend Trip, Apartment Expenses, etc."
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="kittyDescription" className="block mb-2 text-sm font-medium">
                      Description (optional)
                    </label>
                    <textarea
                      id="kittyDescription"
                      value={kittyDescription}
                      onChange={e => setKittyDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="What's this kitty for?"
                      rows={3}
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="kittyCurrency" className="block mb-2 text-sm font-medium">
                      Currency
                    </label>
                    <select
                      id="kittyCurrency"
                      value={kittyCurrency}
                      onChange={e => setKittyCurrency(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    >
                      <option value="₹">Indian Rupee (₹)</option>
                      <option value="$">US Dollar ($)</option>
                      <option value="€">Euro (€)</option>
                      <option value="£">British Pound (£)</option>
                      <option value="¥">Japanese Yen (¥)</option>
                      <option value="₩">Korean Won (₩)</option>
                      <option value="A$">Australian Dollar (A$)</option>
                      <option value="C$">Canadian Dollar (C$)</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setError('');
                      }}
                      className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                    >
                      Create Kitty
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {showExpenseModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[var(--surface)] rounded-xl w-full max-w-xl my-4 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[var(--border)]">
                  <h2 className="text-xl font-bold">Add Expense</h2>
                  <button
                    onClick={() => {
                      setShowExpenseModal(false);
                      setError('');
                      setExpenseAmount("");
                      setExpenseDescription("");
                      setExpenseCategory("");
                      setExpenseNotes("");
                      setExpenseParticipants([]);
                      setExpensePayer("");
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-5">
                  <form 
                    onSubmit={handleAddExpense} 
                    className="max-h-[60vh] overflow-y-auto px-0.5 hide-scrollbar"
                    style={hideScrollbarStyle}
                  >
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                      </div>
                    )}
                    
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
                            value={expenseDescription}
                            onChange={e => setExpenseDescription(e.target.value)}
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
                            value={expenseCategory}
                            onChange={e => setExpenseCategory(e.target.value)}
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
                            value={expensePayer}
                            onChange={e => setExpensePayer(e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)]"
                            required
                          >
                            <option value="">Select who paid</option>
                            {currentKitty.members.map((member, idx) => (
                              <option
                                key={getMemberIdentifier(member) || idx}
                                value={getMemberIdentifier(member)}
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
                              <span className="text-[var(--text-secondary)]">{currentKitty.currency || '$'}</span>
                            </div>
                            <input
                              type="number"
                              id="expenseAmount"
                              value={expenseAmount}
                              onChange={e => setExpenseAmount(e.target.value)}
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
                          <label htmlFor="expenseNotes" className="block mb-1 sm:mb-2 text-sm font-medium">
                            Notes (optional)
                          </label>
                          <textarea
                            id="expenseNotes"
                            value={expenseNotes}
                            onChange={e => setExpenseNotes(e.target.value)}
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
                          <div 
                            className="bg-[var(--background)] p-1.5 rounded-lg max-h-28 sm:max-h-32 overflow-y-auto mb-1 sm:mb-2 border border-[var(--border)] hide-scrollbar"
                            style={hideScrollbarStyle}
                          >
                            {currentKitty.members.map((member, idx) => (
                              <div
                                key={getMemberIdentifier(member) || idx}
                                className="flex items-center p-1.5 hover:bg-[var(--surface)] rounded-md"
                              >
                                <input
                                  type="checkbox"
                                  id={`participant-${idx}`}
                                  checked={expenseParticipants.includes(getMemberIdentifier(member))}
                                  onChange={() => handleParticipantToggle(getMemberIdentifier(member))}
                                  className="w-4 h-4 text-[var(--primary)] rounded"
                                />
                                <label
                                  htmlFor={`participant-${idx}`}
                                  className="ml-2 w-full cursor-pointer text-sm truncate"
                                >
                                  {member.name} {member.isOwner && "(Owner)"}
                                </label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Split equally among selected people
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer with action buttons */}
                    <div className="flex gap-3 justify-end mt-5 sm:mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowExpenseModal(false);
                          setError('');
                          setExpenseAmount("");
                          setExpenseDescription("");
                          setExpenseCategory("");
                          setExpenseNotes("");
                          setExpenseParticipants([]);
                          setExpensePayer("");
                        }}
                        className="px-3 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                      >
                        Add Expense
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {showMemberModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[var(--surface)] p-5 sm:p-6 rounded-xl w-full max-w-md my-4 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Add Member to {currentKitty.name}</h2>
                  <button
                    onClick={() => {
                      setShowMemberModal(false);
                      setError('');
                    }}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddMember}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="memberName" className="block mb-2 text-sm font-medium">
                      Name*
                    </label>
                    <input
                      type="text"
                      id="memberName"
                      value={memberName}
                      onChange={e => setMemberName(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="memberEmail" className="block mb-2 text-sm font-medium">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      id="memberEmail"
                      value={memberEmail}
                      onChange={e => setMemberEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      placeholder="friend@example.com"
                      // required
                    />
                    <p className="mt-2 text-xs text-[var(--text-secondary)] hidden">
                      We'll send them an invitation to join this kitty
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMemberModal(false);
                        setError('');
                      }}
                      className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmation && kittyToDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[var(--surface)] p-5 sm:p-6 rounded-xl w-full max-w-md"
              >
                <div className="flex items-center mb-4">
                  <FiAlertTriangle size={24} className="text-red-500 mr-3" />
                  <h2 className="text-xl font-bold">Delete Kitty?</h2>
                </div>
                
                <p className="mb-6 text-[var(--text-secondary)]">
                  Are you sure you want to delete "{kittyToDelete.name}"? This will permanently delete all expenses and member data. This action cannot be undone.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setKittyToDelete(null);
                    }}
                    className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--background)]"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteKitty}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete Kitty"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Kitties;
