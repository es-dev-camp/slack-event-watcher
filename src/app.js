const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const index = require('./index');

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
  const mockRes = {
    status: (status) => {
      console.log(status);
      return {
        end: () => {
          
        }
      }
    }
  }
  await index.slackEventWatcher(ctx, mockRes)
});

app.listen(3000);
