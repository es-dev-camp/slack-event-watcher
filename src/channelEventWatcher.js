const Slack = require('slack');
const SlackMention = require('./util/createSlackMentionText');

const slack = new Slack();

const slack_bot_token = process.env.BOT_TOKEN;
const targetChannel = 'CKSPDU47K';
// const targetChannel = 'CKZGKHBV2'; // for debug

const channelEventWatcher = {
  channel_created_message_post: async (creator, channel) => {
    const creatorMentionText = SlackMention.user(creator);
    const channelMentionText = SlackMention.channel(channel);
    const message = 'new channel *' + channelMentionText + '* is created by ' + creatorMentionText;
    slack.chat.postMessage({
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    }).then(console.log).catch(console.error);
  },

  channel_unarchive_message_post: async (user, channel) => {
    const userMentionText = SlackMention.user(user);
    const channelMentionText = SlackMention.channel(channel);
    const message = '*' + channelMentionText + '* is unarchived by ' + userMentionText;
    slack.chat.postMessage({
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    }).then(console.log).catch(console.error);
  },
};

module.exports = channelEventWatcher;