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
          name: 'comment-alt',
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
    case 'joinClub':
      return {
        actionText: 'Join',
        actionHeader: 'Join Club',
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

const sanitizeSportsList = (sports) => {
  let sportsList = sports.map((sport) => sport?.text);
  const otherIndex = sportsList.indexOf('Other');
  const strippedData =
    otherIndex !== -1 ? sportsList.splice(otherIndex, 1) : [];
  return [...sportsList, ...strippedData];
};

export {generateID, getSelectionActionDecorations, sanitizeSportsList};
