const { Collection } = require('discord.js');

// Create a collection to store user voice activity data
const voiceLogs = new Collection();

module.exports = (client) => {
  client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;

    // If the user joins a voice channel
    if (!oldState.channel && newState.channel) {
      voiceLogs.set(userId, {
        username: newState.member.user.tag,
        channelName: newState.channel.name,
        joinTime: new Date(),
        leaveTime: null,
        timeSpent: null,
      });
    }

    // If the user leaves a voice channel
    if (oldState.channel && !newState.channel) {
      const log = voiceLogs.get(userId);
      if (log) {
        log.leaveTime = new Date();
        log.timeSpent = (log.leaveTime - log.joinTime) / 1000; // Time spent in seconds
        voiceLogs.set(userId, log);
      }
    }
  });
};

// Export the voiceLogs collection for access in the /voicelog command
module.exports.voiceLogs = voiceLogs;
