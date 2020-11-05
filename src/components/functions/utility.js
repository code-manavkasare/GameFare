const generateID = () => {
  return (
    Math.random()
      .toString(36)
      .substring(2) + Date.now().toString(36)
  );
};

const getSelectionActionDecorations = (action) => {
  switch (action) {
    case 'call':
      return {
        actionText: 'Call',
        actionHeader: 'Video Calls',
      };
    case 'invite':
      return {
        actionText: 'Add',
        actionHeader: 'Add to group',
      };
    case 'message':
      return {
        actionText: 'Message',
        actionHeader: 'Recent',
      };
    case 'shareArchives':
      return {
        actionText: 'Share with',
        actionHeader: 'Share',
      };
    default:
      return {
        actionText: 'Unknown action',
        actionHeader: 'Unknown action',
      };
  }
};

export {generateID, getSelectionActionDecorations};
