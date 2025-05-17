
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
