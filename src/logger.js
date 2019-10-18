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
    * @param {object} [options={}] 
    * @param {number} [options.level=Logger.level.info] - starting log level
    * @param {object|boolean} [options.timestamp] - timestamp options, or boolean for default time format
    * @param {boolean} [options.timestamp.state=false] - whether to print timestamps
    * @param {number} [options.timestamp.format=Logger.timestamp.locale] - timestamp format
    * @param {string} [options.context=null] - optional context appended after logger name
    * @return {Logger}
    */
    constructor(name, options = {}){
        this.name = name;
        this.options = {
            level: Logger.level.info,
            context: null,
            timestamp: {
                state: false,
                format: Logger.timestamp.locale
            }
        };
        Object.extend(this.options, options);

        this.setTimestamp(this.options.timestamp);

        return this;
    }

    /**
     * Set the logger name, which appears
     * as the first item in the message after timestamp.
     * @param {string} name 
     */
    setName(name){
        this.name = name;
        return this;
    }

    /**
    * Set the log level.
    * This will immediately change the logger's log level.
    * @param {number} level 
    * @return {Logger}
    */
    setLogLevel(level){
        if(typeof level === "string"){
            level = Logger.level.stringmap.get(level);
        }
        
        if(!Logger.level.isValidLevel(level)){
            console.error("Logger.setLogLevel: invalid log level");
            return this;
        }

        this.options.level = level;
        return this;
    }

    /**
    * Set any timestamp options
    * @param {object|boolean} options - options or true to use default timestamp
    * @param {boolean} [options.state] - whether to print timestamps
    * @param {number} [options.format] - timestamp format
    * @return {Logger}
    */
    setTimestamp(options){
        if(typeof options === "boolean"){
            this.options.timestamp = {
                state: options,
                format: Logger.timestamp.locale
            };
        }
        this.setTimestampState(this.options.timestamp.state);
        this.setTimestampFormat(this.options.timestamp.format);
        return this;
    }
    
    /**
     * Set the timestamp printing state
     * @param {boolean} state 
     * @return {Logger}
     */
    setTimestampState(state){
        this.options.timestamp.state = state;
        return this;
    }

    /**
    * Set the timestamp format
    * @param {number} format 
    * @return {Logger}
    */
    setTimestampFormat(format){
        if(typeof format === "string"){
            format = Logger.timestamp.stringmap.get(format);
        }
        
        if(!Logger.timestamp.isValidTimestamp(format)){
            console.error("Logger.setTimestampFormat: invalid timestamp");
            return this;
        }

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
    * Append a locale time timestamp.
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
    * Log a message. Will do nothing if the current
    * log level is greater than the specified one.
    * @param {string} message - message to log
    * @param {number} [level=this.options.level] - log level; current level by default
    * @return {Logger}
    */
    log(message, level = this.options.level){
        if(level < this.options.level){
            return this;
        }

        let msg = (typeof message === "string")
            ? this.createMessage(message, level)
            : message;
            
        return this.logMessage(msg);
    }

    /**
    * Log a message. 
    * This is the actual log output function.
    * @param {string} message - message to log
    * @return {Logger}
    */
    logMessage(message){
        if(typeof message === "string"){
            console.log(message);
        }
        else {
            console.log("logging object");
            console.log(message);
        }
        return this;
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

/**
 * Map of strings to Logger levels
 */
Logger.level.stringmap = new Map()
    .set("verbose", Logger.level.verbose)
    .set("debug", Logger.level.debug)
    .set("info", Logger.level.info)
    .set("warning", Logger.level.warning)
    .set("error", Logger.level.error);

/**
 * Check if the log level is valid
 * @param {number} level 
 * @return {boolean}
 */
Logger.level.isValidLevel = function(level){
    return level >= Logger.level.verbose && level <= Logger.level.error;
};

Logger.timestamp = {
    utc: 0,
    locale: 1,
    localetime: 2,
    localedate: 3
};

/**
 * Map of strings to Logger timestamps
 */
Logger.timestamp.stringmap = new Map()
    .set("utc", Logger.timestamp.utc)
    .set("locale", Logger.timestamp.locale)
    .set("localetime", Logger.timestamp.localetime)
    .set("localedate", Logger.timestamp.localedate);

/**
 * Check if the timestamp is valid
 * @param {number} timestamp 
 * @return {boolean}
 */
Logger.timestamp.isValidTimestamp = function(timestamp){
    return timestamp >= Logger.timestamp.utc && timestamp <= Logger.timestamp.localedate;
};

if(typeof Object.extend != 'function'){
    Object.extend = function(){
        for(let i = 1; i < arguments.length; i++){
            for(let key in arguments[i]){
                if(arguments[i].hasOwnProperty(key)) { 
                    if(!arguments[0]){
                        continue;
                    }
                    if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
                        Object.extend(arguments[0][key], arguments[i][key]);
                    }
                    else{
                        arguments[0][key] = arguments[i][key];
                    }
                }
            }
        }
        return arguments[0];	
    }
}

if(typeof module !== "undefined"){
    module.exports = Logger;
}