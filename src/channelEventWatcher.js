const Slack = require('slack');
const SlackMention = require('./util/createSlackMentionText');
const LoggerFactory = require('./logger');

const slack = new Slack();

const slack_bot_token = process.env.BOT_TOKEN;
const targetChannel = !slack_bot_token ? 'CKZGKHBV2' : 'CKSPDU47K';
const streamChannel = 'CL1475Z16';
const isDebug = !slack_bot_token;
const botId = 'BKZGSLX0C';


module.exports = class ChannelEventWatcher {

  constructor() {
    const f = new LoggerFactory();
    this.logger = f.create('slackEventWatcher.log');
  }

  async channel_created_message_post(creator, channel) {
    const creatorMentionText = SlackMention.user(creator);
    const channelMentionText = SlackMention.channel(channel);
    const message = 'new channel *' + channelMentionText + '* is created by ' + creatorMentionText;
    const request = {
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async channel_unarchive_message_post(user, channel) {
    const userMentionText = SlackMention.user(user);
    const channelMentionText = SlackMention.channel(channel);
    const message = '*' + channelMentionText + '* is unarchived by ' + userMentionText;
    const request = {
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async emoji_changed_message_post(change_type, emoji_name) {
    const message = 'emoji ' + change_type + ' :' + emoji_name + ':';
    const request = {
      token: slack_bot_token,
      channel: targetChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async now_channel_message_post(event) {
    const channelId = event.channel;
    if (channelId === streamChannel) {
      return;
    }

    const channelInfoReq = {
      token: slack_bot_token,
      channel: channelId,
    }
    const channelInfoRes = await slack.channels.info(channelInfoReq)
      .catch(this.logger.error);
    if (!channelInfoRes.channel.name.endsWith('_now')) {
      return;
    }

    const permalinkReq = {
      token: slack_bot_token,
      channel: event.channel,
      message_ts: event.ts
    }
    const permalinkRes = await slack.chat.getPermalink(permalinkReq)
      .catch(this.logger.error);

    const postMessageReq = {
      token: slack_bot_token,
      channel: streamChannel,
      text: permalinkRes.permalink,
      unfurl_links: true
    };
    if (isDebug) {
      this.logger.debug(postMessageReq);
    } else {
      slack.chat.postMessage(postMessageReq).then(this.logger.info).catch(this.logger.error);
    }
  }

  async message_changed(event) {
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
    const skipText = ' ';
    if (event.message.text === skipText) {
      return;
    }

    const updateMessageReq = {
      token: slack_bot_token,
      channel: streamChannel,
      text: skipText,
      ts: event.message.ts,
    };

    if (isDebug) {
      this.logger.debug(updateMessageReq);
    } else {
      slack.chat.update(updateMessageReq).then(this.logger.info).catch(this.logger.error);
    }
  }

}
