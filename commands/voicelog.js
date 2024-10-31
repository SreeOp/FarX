const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { voiceLogs } = require('../functions/voiceLogger'); // Import voice logs

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicelog')
    .setDescription("Shows the user's last voice channel activity")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to view voice log for')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const log = voiceLogs.get(user.id);

    // If there's no log data for the user
    if (!log) {
      return interaction.reply({
        content: `${user.username} has no recent voice activity.`,
        ephemeral: true,
      });
    }

    // Calculate time spent in the channel
    let timeSpent;
    let status;
    if (log.leaveTime) {
      // If user has left the channel, use the logged time spent
      timeSpent = log.timeSpent;
      status = 'Left';
    } else {
      // If user is still in the channel, calculate current time spent
      timeSpent = (new Date() - log.joinTime) / 1000;
      status = 'In Channel';
    }

    // Format time spent in HH:MM:SS
    const hours = Math.floor(timeSpent / 3600);
    const minutes = Math.floor((timeSpent % 3600) / 60);
    const seconds = Math.floor(timeSpent % 60);
    const formattedTimeSpent = `${hours}h ${minutes}m ${seconds}s`;

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Voice Channel Activity`)
      .setColor('#3498db')
      .addFields(
        { name: 'Username', value: log.username, inline: true },
        { name: 'Last Voice Channel', value: log.channelName, inline: true },
        { name: 'Join Date', value: `<t:${Math.floor(log.joinTime / 1000)}:F>`, inline: true },
        { name: 'Current Status', value: status, inline: true },
        { name: 'Time Spent in Channel', value: formattedTimeSpent, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Voice Log' });

    await interaction.reply({ embeds: [embed] });
  }
};
