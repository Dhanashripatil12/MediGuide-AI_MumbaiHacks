// Utility function to create page URLs
export const createPageUrl = (pageName) => {
  return `/${pageName.toLowerCase()}`;
};

// Check if Base44 is available
export const isBase44Available = () => {
  return typeof window !== 'undefined' && window.base44;
};
