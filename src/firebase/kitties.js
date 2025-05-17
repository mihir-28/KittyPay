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
      currency: currency || "$", // Default to $ if no currency is provided
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
export const addExpense = async (kittyId, { description, amount, paidBy, paidById, participants }) => {
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
