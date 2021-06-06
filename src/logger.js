module.exports = class LoggerFactory {

  constructor(option = null) {
    if (!option && !!LoggerFactory.instance) {
      return LoggerFactory.instance;
    }
    this.jsonPayload = {
      severity: 'WARNING'
    };
    LoggerFactory.instance = this;
    return this;
  }

  create() {
    return {
      debug: (object) => {
        this.jsonPayload.severity = 'DEBUG';
        this.jsonPayload.payload = object;
        console.debug(JSON.stringify(this.jsonPayload));
      },
      info: (object) => {
        this.jsonPayload.severity = 'INFO';
        this.jsonPayload.payload = object;
        console.info(JSON.stringify(this.jsonPayload));
      },
      warn: (object) => {
        this.jsonPayload.severity = 'WARNING';
        this.jsonPayload.payload = object;
        console.warn(JSON.stringify(this.jsonPayload));
      },
      error: (object) => {
        this.jsonPayload.severity = 'ERROR';
        this.jsonPayload.payload = object;
        console.error(JSON.stringify(this.jsonPayload));
      }
    };
  }
}
