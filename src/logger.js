const {Logging} = require('@google-cloud/logging');
const logging = new Logging();

exports.createLogger = (logName) => {
  const log = logging.log(logName);
  const logMetadata = {
    resource: {
      type: 'cloud_function',
      labels: {
        function_name: process.env.FUNCTION_NAME ,
        project: process.env.GCLOUD_PROJECT,
        region: process.env.FUNCTION_REGION
      },
    },
    severity: 'DEFAULT',
  };
  const write = !process.env.IS_DEBUG
    ? async (severity, object) => {
      logMetadata.severity = severity;
      await log.write(log.entry(logMetadata, object));
    }
    : async (severity, object) => {
      return console.log(severity, object);
    }
  return {
    debug: async (object) => {
      return await write('DEBUG', object);
    },
    info: async (object) => {
      return await write('INFO', object);
    },
    warn: async (object) => {
      return await write('WARNING', object);
    },
    error: async (object) => {
      return await write('ERROR', object);
    },
  }
}
