const {Logging} = require('@google-cloud/logging');
const logging = new Logging();

module.exports = class LoggerFactory {

  constructor(option = null) {
    if (!option && !!LoggerFactory.instance) {
      return LoggerFactory.instance;
    }

    const traceContextArray = !option || !option.traceContext
      ? []
      : option.traceContext.split('/');
    const traceId = traceContextArray.length === 0
      ? ''
      : traceContextArray[0];

    this.logMetadata = {
      resource: {
        type: 'cloud_function',
        labels: {
          function_name: process.env.FUNCTION_NAME ,
          project: process.env.GCLOUD_PROJECT,
          region: process.env.FUNCTION_REGION
        },
      },
      labels: {
        execution_id: option.executionId
      },
      // NOTE: https://cloud.google.com/trace/docs/viewing-details
      trace: !traceId ? '' : 'projects/' + process.env.GCLOUD_PROJECT + '/traces/' + traceId,
      severity: 'WARNING',
    };

    LoggerFactory.instance = this;
    return this;
  }

  create(logName) {
    const log = logging.log(logName);
    const write = !process.env.IS_DEBUG
      ? async (object) => {
        // prod
        await log.write(log.entry(this.logMetadata, object));
      }
      : async (object) => {
        // dev
        const timestamp = new Date();
        console.log(timestamp, this.logMetadata.severity);
        console.log(JSON.stringify({
          ...this.logMetadata,
          ...{
            jsonPayload: object,
            logName: logName,
            timestamp: timestamp
          }
        }, null, 4));
      }
    return {
      debug: async (object) => {
        this.logMetadata.severity = 'DEBUG';
        return await write(object);
      },
      info: async (object) => {
        this.logMetadata.severity = 'INFO';
        return await write(object);
      },
      warn: async (object) => {
        this.logMetadata.severity = 'WARNING';
        return await write(object);
      },
      error: async (object) => {
        this.logMetadata.severity = 'ERROR';
        return await write(object);
      }
    };
  }
}
