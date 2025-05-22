import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getKittyById } from "../firebase/kitties";
import { FiArrowLeft, FiDollarSign, FiUsers } from "react-icons/fi";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const KittyDetails = ({ kittyId, onBack }) => {
  const [kitty, setKitty] = useState(null);
  const [loading, setLoading] = useState(true);
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
                        <div className="font-bold text-lg">{kitty.currency || '$'}{expense.amount.toFixed(2)}</div>
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
                {calculateSettlements().map((settlement, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row justify-between items-center p-3 rounded-md bg-[var(--surface)] border border-[var(--border)] shadow-sm"
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
                      <div className="text-xs text-[var(--text-secondary)]">receives payment</div>
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
                  </div>
                ))}
              </div>

              {calculateSettlements().length === 0 && (
                <div className="text-center py-6 text-[var(--text-secondary)] bg-[var(--surface)] rounded-md border border-[var(--border)] shadow-sm">
                  <span className="font-medium">Everyone is settled up!</span>
                  <p className="text-sm mt-1">All balances are even.</p>
                </div>
              )}

              <p className="mt-4 text-xs text-[var(--text-secondary)]">
                This plan minimizes the total number of transactions needed to settle all balances in the kitty.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KittyDetails;
