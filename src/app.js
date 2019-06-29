const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const channelEventWatcher = require('./channelEventWatcher');

const app = new Koa();
app.use(bodyParser());

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now(); // --(1)
  await next();
  const ms = Date.now() - start;    // --(6)
  ctx.set('X-Response-Time', `${ms}ms`);    // --(7)
});
 

// logger
app.use(async (ctx, next) => {
  const start = Date.now(); // --(2)
  await next();
  const ms = Date.now() - start;    // --(4)
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);  // --(5)
});

// response
app.use(async ctx => {
  // the parsed body will store in ctx.request.body
  // if nothing was parsed, body will be an empty object {}
  ctx.body = ctx.request.body; // --(3)
  console.log(ctx.body);
  // とりあえず
  if (ctx.body && ctx.body.event && ctx.body.event.type) {
    const event = ctx.body.event;
    if (event.type === 'channel_created') {
      await channelEventWatcher.channel_created_message_post(event.channel.creator, event.channel.id);
    }
    if (event.type === 'channel_unarchive') {
      await channelEventWatcher.channel_unarchive_message_post(event.user, event.channel);
    }
  }
});

app.listen(3000);
