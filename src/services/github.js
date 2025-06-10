import { Octokit } from '@octokit/rest';

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
});

// GitHub repository details
const OWNER = 'mihir-28';
const REPO = 'KittyPay';

/**
 * Fetch issues from GitHub repository
 * @param {Object} options - Query options
 * @param {string} options.state - Issue state (open/closed)
 * @returns {Promise<Array>} Array of issues
 */
export const fetchIssues = async ({ state = 'open' } = {}) => {
  try {
    console.log('Starting fetchIssues with params:', { state });
    console.log('Using GitHub token:', import.meta.env.VITE_GITHUB_TOKEN ? 'Token exists' : 'No token found');
    
    // Test token validity
    try {
      const authResponse = await octokit.rest.users.getAuthenticated();
      console.log('GitHub token is valid for user:', authResponse.data.login);
    } catch (error) {
      console.error('GitHub token validation failed:', error.message);
      throw new Error('Invalid GitHub token. Please check your token configuration.');
    }

    // First, let's check if the labels exist
    try {
      const labelsResponse = await octokit.rest.issues.listLabelsForRepo({
        owner: OWNER,
        repo: REPO
      });
      console.log('Available labels:', labelsResponse.data.map(l => l.name));
    } catch (error) {
      console.error('Error fetching labels:', error);
    }

    // Log the exact API call we're making
    console.log('Making API call to GitHub with:', {
      owner: OWNER,
      repo: REPO,
      state
    });

    // First, get all open issues without label filtering
    const response = await octokit.rest.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state,
      sort: 'created',
      direction: 'desc'
    });

    console.log(`Successfully fetched ${response.data.length} issues`);
    console.log('Raw issues data:', response.data);
    
    const processedIssues = response.data.map(issue => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      description: issue.body,
      state: issue.state,
      labels: issue.labels.map(label => ({
        name: label.name,
        color: label.color
      })),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
      assignee: issue.assignee ? {
        login: issue.assignee.login,
        avatarUrl: issue.assignee.avatar_url
      } : null
    }));

    console.log('Processed issues:', processedIssues);
    return processedIssues;
  } catch (error) {
    console.error('Error fetching GitHub issues:', error);
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      response: error.response?.data
    });
    
    // Provide more specific error messages
    if (error.status === 404) {
      throw new Error('Repository not found. Please check the repository name and owner.');
    } else if (error.status === 401) {
      throw new Error('Authentication failed. Please check your GitHub token.');
    } else if (error.status === 403) {
      throw new Error('Access denied. Please check your token permissions.');
    }
    
    throw new Error('Failed to fetch issues. Please try again later.');
  }
};

/**
 * Get issue status based on labels and state
 * @param {Object} issue - Issue object
 * @returns {string} Status (In Progress, Planned, Coming Soon)
 */
export const getIssueStatus = (issue) => {
  const labels = issue.labels.map(label => label.name);
  console.log('Getting status for issue:', issue.number, 'Labels:', labels);
  
  // Check for status labels
  if (labels.includes('in-progress')) return 'In Progress';
  if (labels.includes('planned')) return 'Planned';
  if (labels.includes('coming-soon')) return 'Coming Soon';
  
  // Default status based on issue type
  return 'Planned'; // Default status for all feature types
};

/**
 * Get issue category based on labels
 * @param {Object} issue - Issue object
 * @returns {string} Category (New Features, Enhancements, Issues)
 */
export const getIssueCategory = (issue) => {
  const labels = issue.labels.map(label => label.name);
  console.log('Getting category for issue:', issue.number, 'Labels:', labels);
  
  if (labels.includes('feature')) return 'New Features';
  if (labels.includes('enhancement')) return 'Enhancements';
  if (labels.includes('bug')) return 'Issues';
  
  return 'Other'; // Default category
}; 