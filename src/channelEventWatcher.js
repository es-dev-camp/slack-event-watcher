const Slack = require('slack');
const SlackMention = require('./util/createSlackMentionText');
const logging = require('./logger');

const logger = logging.createLogger('slackEventWatcher.log');
const slack = new Slack();

const slack_bot_token = process.env.BOT_TOKEN;
const targetChannel = !slack_bot_token ? 'CKZGKHBV2' : 'CKSPDU47K';
const streamChannel = 'CL1475Z16';
const isDebug = !slack_bot_token;
const botId = 'BKZGSLX0C';

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
      logger.debug(request);
    } else {
      slack.chat.postMessage(request).then(logger.info).catch(logger.error);
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
      logger.debug(request);
    } else {
      slack.chat.postMessage(request).then(logger.info).catch(logger.error);
    }
  },

  emoji_changed_message_post: async (change_type, emoji_name) => {
    const message = 'emoji ' + change_type + ' :' + emoji_name + ':';
    const request = {
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    };
    if (isDebug) {
      logger.debug(request);
    } else {
      slack.chat.postMessage(request).then(logger.info).catch(logger.error);
    }
  },

  now_channel_message_post: async (event) => {
    const channelId = event.channel;
    if (channelId === streamChannel) {
      return;
    }

    const channelInfoReq = {
      token: slack_bot_token,
      channel: channelId,
    }
    const channelInfoRes = await slack.channels.info(channelInfoReq)
      .catch(logger.error);
    if (!channelInfoRes.channel.name.endsWith('_now')) {
      return;
    }

    const permalinkReq = {
      token: slack_bot_token,
      channel: event.channel,
      message_ts: event.ts
    }
    const permalinkRes = await slack.chat.getPermalink(permalinkReq)
      .catch(logger.error);

    const postMessageReq = {
      token: slack_bot_token,
      channel: streamChannel,
      text: permalinkRes.permalink,
      unfurl_links: true
    };
    if (isDebug) {
      logger.debug(postMessageReq);
    } else {
      slack.chat.postMessage(postMessageReq).then(logger.info).catch(logger.error);
    }
  },
  message_changed: async (event) => {
    // HOW TO WORK
    // 1. user post message in *_now & bot post permalink in all_now
    // 2. slack unfurl permalink (message_changed) & bot update text to empty

    // NOTE: streamChannelのみかつ自分のメッセージのみ反応する
    if (event.channel !== streamChannel
      || event.message.subtype !== 'bot_message'
      || event.message.bot_id !== botId) {
      return;
    }

    // WARNING: message_changed に反応してさらにmessageを更新するため無限ループには注意
    // textを完全に空にすると、attachmentsやlink_namesがupdateReqに必要になることに加えて
    // Slack上でメッセージリンクが機能しなくなる。
    // そのため、半角スペースでアップデートすると空行が表示されないSlack側の仕様を勝手に利用
    const slipText = ' ';
    if (event.message.text === slipText) {
      return;
    }

    const updateMessageReq = {
      token: slack_bot_token,
      channel: streamChannel,
      text: slipText,
      ts: event.message.ts,
    };

    if (isDebug) {
      logger.debug(updateMessageReq);
    } else {
      slack.chat.update(updateMessageReq).then(logger.info).catch(logger.error);
    }
  },
};

module.exports = channelEventWatcher;