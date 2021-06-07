const ChannelEventWatcher = require('./channelEventWatcher');
const LoggerFactory = require('./logger');

exports.slackEventWatcher = async (req, res) => {
  const f = new LoggerFactory({
    executionId: req.get('Function-Execution-Id'),
    traceContext: req.get('X-Cloud-Trace-Context'),
  });
  const logger = f.create();

  const result = await isSkipRequest(logger, req);
  if (result) {
    logger.info('skip');
    res.status(200).end();
    return;
  }
  const channelEventWatcher = new ChannelEventWatcher(logger);

  logger.info(req.body);

  if (req.body && req.body.type && req.body.type === 'url_verification') {
    res.status(200).send({"challenge": req.body.challenge});
    return;
  }

  try {
    if (req.body && req.body.event && req.body.event.type) {
      const event = req.body.event;
      if (event.type === 'channel_created') {
        await channelEventWatcher.channel_created_message_post(event.channel.creator, event.channel.id);
      }
      if (event.type === 'channel_unarchive') {
        await channelEventWatcher.channel_unarchive_message_post(event.user, event.channel);
      }
      if (event.type === 'channel_archive') {
        await channelEventWatcher.channel_archive_message_post(event.user, event.channel);
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
        if (!event.subtype || event.subtype == 'file_share') {
          await channelEventWatcher.now_channel_message_post(event);
        } else if (event.subtype === 'message_changed') {
          await channelEventWatcher.message_changed(event);
        }
      }
    }    
  } catch (error) {
    logger.error(error);
    return res.status(200).end();
  }

  res.status(200).end();
};

async function isSkipRequest(logger, req) {
  const slackRetryNum = req.get('X-Slack-Retry-Num');
  const slackRetryReason = req.get('X-Slack-Retry-Reason');
  if (slackRetryNum && slackRetryNum.length !== 0) {
    logger.info({
      status: 'Request retried.',
      event_id: req.body.event_id,
      retry_num: slackRetryNum,
      retry_reason: slackRetryReason
    });
    return true;
  }
  return false;
}
