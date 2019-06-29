const Slack = require('slack');
const SlackMention = require('./util/createSlackMentionText');

const slack = new Slack();

const slack_bot_token = process.env.BOT_TOKEN;
const targetChannel = !slack_bot_token ? 'CKZGKHBV2' : 'CKSPDU47K';
const isDebug = !slack_bot_token;

const channelEventWatcher = {
  channel_created_message_post: async (creator, channel) => {
    const creatorMentionText = SlackMention.user(creator);
    const channelMentionText = SlackMention.channel(channel);
    const message = 'new channel *' + channelMentionText + '* is created by ' + creatorMentionText;
    const request = {
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    };
    if (isDebug) {
      console.log(request);
    } else {
      slack.chat.postMessage(request).then(console.log).catch(console.error);
    }
  },

  channel_unarchive_message_post: async (user, channel) => {
    const userMentionText = SlackMention.user(user);
    const channelMentionText = SlackMention.channel(channel);
    const message = '*' + channelMentionText + '* is unarchived by ' + userMentionText;
    const request = {
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    };
    if (isDebug) {
      console.log(request);
    } else {
      slack.chat.postMessage(request).then(console.log).catch(console.error);
    }
  },
};

module.exports = channelEventWatcher;