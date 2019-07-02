/**
 * Logs messages and objects to the console.
 * 
 * @example - create a basic logger
 * let logger = new Logger("User", {
 *     level: Logger.level.debug,
 *     timestamp: {
 *         state: true,
 *         format: Logger.timestamp.local    
 *     }
 * });
 * logger.debug("Logged in"); // [7/1/2019, 10:43:26 AM] [DBG] [User] Logged in
 * 
 * @example - create a logger as part of an object "Foo"
 * this.logger = new Logger("App", {
 *     level: Logger.level.info,
 *     timestamp: {state: false}
 *     context: this
 * });
 * logger.info("Initialized"); // [INF] [App] [Foo] Initialized
 * 
 * @example - when logging an object, the object itself is passed to console.log()
 * logger.info({name: "Test", count: 100}); // [INF] [App] logging object
 *                                          // {name:"Test", count:100}
 */
class Logger {

    /**
    * Constructor
    * @param {string} name - name of the logger
    * @param {object} options 
    * @param {number} options.level - starting log level
    * @param {object} options.timestamp - timestamp options
    * @param {boolean} options.timestamp.state - whether to print timestamps
    * @param {number} options.timestamp.format - timestamp format
    * @param {string} options.context - optional context prepended before logger name
    * @return {Logger}
    */
    constructor(name, options = {}){
        this.name = name;
        this.options = {
            level: Logger.level.info,
            timestamp: {
                state: false,
                format: Logger.timestamp.locale
            },
            context: null
        };
        Object.assign(this.options, options);

        this.setTimestampFormat(this.options.timestamp.format);

        return this;
    }

    /**
    * Set the logger context. 
    * This could be set when printing logs from
    * a specific object, for example, to indicate
    * which object the logger is found in (aka its context).
    * @param {string} context 
    * @return {Logger}
    */
    setContext(context){
        this.options.context = context;
        return this;
    }

    /**
    * Set the log level.
    * This will immediately change the logger's log level.
    * @param {number} level 
    * @return {Logger}
    */
    setLogLevel(level){
        this.options.level = level;
        return this;
    }

    /**
    * Set any timestamp options
    * @param {object} options
    * @param {boolean} options.state - whether to print timestamps
    * @param {number} options.format - timestamp format
    * @return {Logger}
    */
    setTimestamp(options){
        this.options.timestamp = options;
        this.setTimestampFormat(this.options.timestamp.format);
        return this;
    }

    /**
    * Set the timestamp format
    * @param {number} format 
    * @return {Logger}
    */
    setTimestampFormat(format){
        switch(format){
            case Logger.timestamp.utc:
                this.appendTimestamp = this.appendUtcTimestamp;
                break;
            case Logger.timestamp.localedate:
                this.appendTimestamp = this.appendLocaleDateTimestamp
                break;
            case Logger.timestamp.localetime:
                this.appendTimestamp = this.appendLocaleTimeTimestamp
                break;
            case Logger.timestamp.locale:
            default:
                this.appendTimestamp = this.appendLocaleTimestamp;
                break;
        }
        return this;
    }

    /**
    * Set a custom timestamp format.
    * @param {function} func - function that outputs a timestamp string
    * @return {Logger}
    */
    setCustomTimestampFormat(func){
        this.appendTimestamp = func;
        return this;
    }

    /**
    * Append a UTC timestamp.
    * eg "Mon, 01 Jul 2019 14:43:35 GMT"
    * @return {Logger}
    */
    appendUtcTimestamp(){
        return `[${(new Date().toUTCString())}] `;
    }

    /**
    * Append a locale timestamp.
    * eg "7/1/2019, 10:43:26 AM"
    * @return {Logger}
    */
    appendLocaleTimestamp(){
        return `[${(new Date().toLocaleString())}] `;
    }

    /**
    * Append a UTC timestamp.
    * eg "10:43:06 AM"
    * @return {Logger}
    */
    appendLocaleTimeTimestamp(){
        return `[${(new Date().toLocaleTimeString())}] `;
    }

    /**
    * Append a locale date timestamp.
    * eg "7/1/2019"
    * @return {Logger}
    */
    appendLocaleDateTimestamp(){
        return `[${(new Date().toLocaleDateString())}] `;
    }

    /**
    * Create a log message.
    * @param {string} message - message to log
    * @param {number} level - log level
    * @return {Logger}
    */
    createMessage(message, level){
        let msg = "";
        if(this.options.timestamp.state){
            msg += this.appendTimestamp();
        }

        msg += `[${Logger.level.string[level]}] `;
        msg += `[${this.name}] `;

        if(this.options.context){
            msg += `[${this.options.context}] `;
        }

        if(typeof message === "string"){
            msg += message;
        }

        return msg;
    }

    /**
    * Log a message.
    * @param {string} message - message to log
    * @param {number} [level=this.options.level] - log level; current level by default
    * @return {boolean} true if it logged, false otherwise
    */
    log(message, level = this.options.level){
        if(level < this.options.level){
            return false;
        }

        let msg = this.createMessage(message, level);

        if(typeof message === "string"){
            console.log(msg);
        }
        else {
            console.log("logging object");
            console.log(message);
        }

        return true;
    }

    /**
    * Log a verbose message.
    * Use this level when logging relatively
    * unimportant information. Especially useful
    * when debugging program flow.
    * @param {string} message 
    * @return {Logger}
    */
    verbose(message){
        return this.log(message, Logger.level.verbose);
    }

    /**
    * Log a debug message
    * @param {string} message 
    * @return {Logger}
    */
    debug(message){
        return this.log(message, Logger.level.debug);
    }

    /**
    * Log an info message
    * @param {string} message 
    * @return {Logger}
    */
    info(message){
        return this.log(message, Logger.level.info);
    }

    /**
    * Log a warning message
    * @param {string} message 
    * @return {Logger}
    */
    warning(message){
        return this.log(message, Logger.level.warning);
    }

    /**
    * Log an error message
    * @param {string} message 
    * @return {Logger}
    */
    error(message){
        return this.log(message, Logger.level.error);
    }
}
Logger.level = {
    verbose: 0,
    debug: 1,
    info: 2,
    warning: 3,
    error: 4,
    string: [
        "VRB",
        "DBG",
        "INF",
        "WRN",
        "ERR"
    ]
};
Logger.timestamp = {
    utc: 0,
    locale: 1,
    localetime: 2,
    localedate: 3
};

if(typeof module !== "undefined"){
    module.exports = Logger;
}