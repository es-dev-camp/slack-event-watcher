module.exports = class LoggerFactory {

  constructor(option = null) {
    if (!option && !!LoggerFactory.instance) {
      return LoggerFactory.instance;
    }
    this.jsonPayload = {};
    LoggerFactory.instance = this;
    return this;
  }

  create() {
    return {
      debug: (object) => {
        this.jsonPayload.payload = object;
        console.debug(JSON.stringify(this.jsonPayload));
      },
      info: (object) => {
        this.jsonPayload.payload = object;
        console.info(JSON.stringify(this.jsonPayload));
      },
      warn: (object) => {
        this.jsonPayload.payload = object;
        console.warn(JSON.stringify(this.jsonPayload));
      },
      error: (object) => {
        this.jsonPayload.payload = object;
        console.error(JSON.stringify(this.jsonPayload));
      }
    };
  }
}
