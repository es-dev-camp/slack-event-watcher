const SlackMention = {
  user: (slack_user_id) => {
    return '<@' + slack_user_id + '>';
  },
  channel: (slack_channel_id) => {
    return '<#' + slack_channel_id + '>';
  }
}

module.exports = SlackMention;