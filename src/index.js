const channelEventWatcher = require('./channelEventWatcher');

exports.slackEventWatcher = async (req, res) => {

  console.log(req.body);
  if (req.body && req.body.event && req.body.event.type) {
    const event = req.body.event;
    if (event.type === 'channel_created') {
      await channelEventWatcher.channel_created_message_post(event.channel.creator, event.channel.id);
    }
    if (event.type === 'channel_unarchive') {
      await channelEventWatcher.channel_unarchive_message_post(event.user, event.channel);
    }
  }
  res.status(200).end();
};