/**
 * Utility function to get a unique identifier for a member
 * @param {Object} member - The member object
 * @returns {string} - A unique identifier for the member
 */
export const getMemberIdentifier = (member) => {
  return member.userId || member.email || member.memberId || `member_${member.name || 'unknown'}_${Math.random()}`;
};

/**
 * Check if two members are the same
 * @param {Object} member1 - First member
 * @param {Object} member2 - Second member
 * @returns {boolean} - True if members are the same
 */
export const areMembersEqual = (member1, member2) => {
  return getMemberIdentifier(member1) === getMemberIdentifier(member2);
};
