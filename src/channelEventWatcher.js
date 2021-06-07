const { App } = require('@slack/bolt');

const SlackMention = require('./util/createSlackMentionText');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

const slack = app.client;
const slack_bot_token = process.env.SLACK_BOT_TOKEN;
const generalChannel = process.env.APP_CHANNEL_GENERAL;
const allNowChannel = process.env.APP_CHANNEL_ALLNOW;
const botId = process.env.APP_SLACK_ID;
const isDebug = process.env.DEBUG === "true";

module.exports = class ChannelEventWatcher {

  constructor(logger) {
    this.logger = logger;
  }

  async channel_created_message_post(creator, channel) {
    const creatorMentionText = SlackMention.user(creator);
    const channelMentionText = SlackMention.channel(channel);
    const message = 'new channel *' + channelMentionText + '* is created by ' + creatorMentionText;
    const request = {
      channel: generalChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      await slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async channel_unarchive_message_post(user, channel) {
    const userMentionText = SlackMention.user(user);
    const channelMentionText = SlackMention.channel(channel);
    const message = '*' + channelMentionText + '* is unarchived by ' + userMentionText;
    const request = {
      token: slack_bot_token,
      channel: generalChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      await slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async channel_archive_message_post(user, channel) {
    const userMentionText = SlackMention.user(user);
    const channelMentionText = SlackMention.channel(channel);
    const message = '*' + channelMentionText + '* is archived by ' + userMentionText;
    const request = {
      token: slack_bot_token,
      channel: generalChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      await slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async emoji_changed_message_post(change_type, emoji_name) {
    const message = 'emoji ' + change_type + ' :' + emoji_name + ':';
    const request = {
      token: slack_bot_token,
      channel: generalChannel, 
      text: message
    };
    if (isDebug) {
      this.logger.debug(request);
    } else {
      await slack.chat.postMessage(request).then(this.logger.info).catch(this.logger.error);
    }
  }

  async now_channel_message_post(event) {
    const channelId = event.channel;
    if (channelId === allNowChannel) {
      return;
    }

    const channelInfoRes = await slack.conversations.info({channel: channelId})
      .catch(async e => {
        this.logger.error(e);
      });
    if (!channelInfoRes) {
      throw new Error('can\'t get channel info');
    }
    if (!channelInfoRes.channel.name.endsWith('_now')) {
      return;
    }

    const permalinkReq = {
      token: slack_bot_token,
      channel: event.channel,
      message_ts: event.ts
    }
    const permalinkRes = await slack.chat.getPermalink(permalinkReq)
      .catch(x => {
        this.logger.error(x);
      });

    const postMessageReq = {
      token: slack_bot_token,
      channel: allNowChannel,
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

    // NOTE: allNowChannelのみかつ自分のメッセージのみ反応する
    if (event.channel !== allNowChannel
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
      channel: allNowChannel,
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
