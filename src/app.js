const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const LoggerFactory = require('./logger');

const index = require('./index');

// debug setting
process.env['FUNCTION_NAME'] = 'FUNCTION_NAME';
process.env['GCLOUD_PROJECT'] = 'GCLOUD_PROJECT';
process.env['FUNCTION_REGION'] = 'FUNCTION_REGION';

const app = new Koa();
app.use(bodyParser());

// initialize logger
app.use(async (ctx, next) => {
  const f = new LoggerFactory({
    executionId: ctx.get('Function-Execution-Id'),
    traceContext: ctx.get('X-Cloud-Trace-Context'),
  });
  ctx.logger = f.create('appLogger.log');
  ctx.logger.info({ok: true});
  await next();
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now(); // --(1)
  await next();
  const ms = Date.now() - start;    // --(6)
  ctx.set('X-Response-Time', `${ms}ms`);    // --(7)
});


// log execution time
app.use(async (ctx, next) => {
  const start = Date.now(); // --(2)
  await next();
  const ms = Date.now() - start;    // --(4)
  ctx.logger.debug({method: ctx.method, url: ctx.url, msec: ms});  // --(5)
});

// response
app.use(async ctx => {
  // the parsed body will store in ctx.request.body
  // if nothing was parsed, body will be an empty object {}
  ctx.body = ctx.request.body; // --(3)
  ctx.logger.debug({payload: ctx.body});
  const mockRes = {
    status: (status) => {
      ctx.logger.debug(status);
      return {
        end: () => {

        }
      }
    }
  }
  await index.slackEventWatcher(ctx, mockRes)
});

app.listen(3000);
