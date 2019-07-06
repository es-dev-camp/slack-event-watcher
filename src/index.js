const channelEventWatcher = require('./channelEventWatcher');
const logging = require('./logger');
const logger = logging.createLogger('api.log');

exports.slackEventWatcher = async (req, res) => {

  logger.info(req.body);

  if (req.body && req.body.type && req.body.type === 'url_verification') {
    res.status(200).send({"challenge": req.body.challenge});
    return;
  }

  if (req.body && req.body.event && req.body.event.type) {
    const event = req.body.event;
    if (event.type === 'channel_created') {
      await channelEventWatcher.channel_created_message_post(event.channel.creator, event.channel.id);
    }
    if (event.type === 'channel_unarchive') {
      await channelEventWatcher.channel_unarchive_message_post(event.user, event.channel);
    }
    if (event.type === 'emoji_changed') {
      let name = '';
      if (event.subtype === 'remove') {
        name = event.names.join(', ');
      } else {
        name = event.name;
      }
      await channelEventWatcher.emoji_changed_message_post(event.subtype, name);
    }
    if (event.type === 'message') {
      if (!event.subtype) {
        await channelEventWatcher.now_channel_message_post(event);
      }
    }
  }
  res.status(200).end();
};