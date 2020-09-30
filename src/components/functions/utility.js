function generateID() {
  return (
    Math.random()
      .toString(36)
      .substring(2) + Date.now().toString(36)
  );
}

function getSelectionActionDecorations(action) {
  switch (action) {
    case 'call':
      return {
        actionText: 'Call',
        actionHeader: 'Video calls',
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
}

module.exports = {generateID, getSelectionActionDecorations};
