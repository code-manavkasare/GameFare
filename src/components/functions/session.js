import React, {Component} from 'react';
import {store} from '../../../reduxStore';

const getSortedMembers = (members) => {
  const userID = store.getState().user.userID;

  members = members ? Object.values(members) : [];
  if (members.length !== 1)
    members = members
      .sort((a, b) => {
        if (!a) return -1;
        else if (!b) return 1;
        else if (a.id === userID) return 1;
        else if (b.id === userID) return -1;
        else if (a.invitationTimeStamp === undefined) return -1;
        else if (a.isConnected && !b.isConnected) return -1;
        else if (!a.isConnected && b.isConnected) return 1;
        else if (a.invitationTimeStamp > b.invitationTimeStamp) return -1;
        else if (a.invitationTimeStamp < b.invitationTimeStamp) return 1;
        else if (a.disconnectionTimeStamp > b.disconnectionTimeStamp) return 1;
        else if (a.disconnectionTimeStamp < b.disconnectionTimeStamp) return -1;
      })
      .filter((a) => a.id !== userID);
  return members;
};

module.exports = {
  getSortedMembers,
};
