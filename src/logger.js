const {Logging} = require('@google-cloud/logging');
const logging = new Logging();

exports.createLogger = (logName) => {
  const log = logging.log(logName);
  const write = !process.env.IS_DEBUG
    ? async (severity, object, executionId, traceContext) => {
      const traceContextArray = !traceContext ? [] : traceContext.split('/');
      const traceId = traceContextArray.length === 0 ? '' : traceContextArray[0];
      const logMetadata = {
        resource: {
          type: 'cloud_function',
          labels: {
            function_name: process.env.FUNCTION_NAME ,
            project: process.env.GCLOUD_PROJECT,
            region: process.env.FUNCTION_REGION
          },
        },
        labels: {
          execution_id: executionId
        },
        // NOTE: https://cloud.google.com/trace/docs/viewing-details
        trace: !traceId ? '' : 'projects/' + process.env.GCLOUD_PROJECT + '/traces/' + traceId,
        severity: severity,
      };
      await log.write(log.entry(logMetadata, object));
    }
    : async (severity, object, executionId, traceContext) => {
      return console.log(severity, object);
    }
  return {
    debug: async (object) => {
      return await write('DEBUG', object, process.env['Function-Execution-Id'], process.env['X-Cloud-Trace-Context']);
    },
    info: async (object) => {
      return await write('INFO', object, process.env['Function-Execution-Id'], process.env['X-Cloud-Trace-Context']);
    },
    warn: async (object) => {
      return await write('WARNING', object, process.env['Function-Execution-Id'], process.env['X-Cloud-Trace-Context']);
    },
    error: async (object) => {
      return await write('ERROR', object, process.env['Function-Execution-Id'], process.env['X-Cloud-Trace-Context']);
    },
  }
}
