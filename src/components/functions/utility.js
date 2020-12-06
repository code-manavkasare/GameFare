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
        icon: {
          type: 'font',
          name: 'video',
        },
      };
    case 'invite':
      return {
        actionText: 'Add',
        actionHeader: 'Add to group',
        icon: {
          type: 'font',
          name: 'user-plus',
        },
      };
    case 'message':
      return {
        actionText: 'Message',
        actionHeader: 'Recent',
        icon: {
          type: 'font',
          name: 'comment-alt',
        },
      };
    case 'shareArchives':
      return {
        actionText: 'Share with',
        actionHeader: 'Share',
        icon: {
          type: 'font',
          name: 'photo-video',
        },
      };
    case 'inviteToClub':
      return {
        actionText: 'Add',
        actionHeader: 'Invite to Club',
        icon: {
          type: 'font',
          name: 'user-plus',
        },
      };
    default:
      return {
        actionText: 'Unknown action',
        actionHeader: 'Unknown action',
        icon: {
          size: 18,
          type: 'font',
          name: 'video',
        },
      };
  }
};

export {generateID, getSelectionActionDecorations};
