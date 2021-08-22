if(typeof module !== "undefined"){
    LoggerMessage = require('./loggerMessage');
}

/**
 * Logs messages and objects to the console.
 * 
 * @example - create a basic logger
 * const logger = new Logger("User", {
 *     level: LoggerMessage.level.debug,
 *     timestamp: LoggerMessage.timestamp.local    
 * });
 * logger.debug("Logged in"); // [7/1/2019, 10:43:26 AM] [DBG] [User] Logged in
 * 
 * @example - create a logger as part of an object "Foo"
 * this.logger = new Logger("App", {
 *     level: LoggerMessage.level.info,
 *     timestamp: false
 *     context: this
 * });
 * logger.info("Initialized"); // [INF] [App] [Foo] Initialized
 * 
 * @example - when logging an object, the object itself is passed to console.log()
 * logger.info({name: "Test", count: 100}); // [INF] [App] logging object
 *                                          // {name: "Test", count: 100}
 */
class Logger {

    /**
     * Constructor
     * @param {String} name - Name of the logger
     * @param {Object} [params={}] 
     * @param {Number|String} [params.level=LoggerMessage.level.info] - Starting log level
     * @param {Boolean} [params.enabled=true] - Whether the logger is enabled
     * @param {String} [params.context=null] - Optional context appended after logger name
     * @param {Boolean|Number|String} [params.timestamp=LoggerMessage.timestamp.locale] - Timestamp format
     * @param {Number} [params.maxlogs=0] - Maximum number of logs until the first log is deleted
     * @param {Boolean} [params.objects_to_string=false] - Whether to log plain objects as a string
     */
    constructor(name, {
        level = LoggerMessage.level.info,
        enabled = true,
        context = null,
        timestamp = LoggerMessage.timestamp.locale,
        maxlogs = 0,
        objects_to_string = false
    }={})
    {
        this.name = name;
        this.level = level;
        this.enabled = enabled;
        this.context = context;
        this.timestamp = timestamp;
        this.maxlogs = maxlogs;
        this.objects_to_string = objects_to_string;
        this.log_count = 0;
    }

    /**
     * Get the timestamp
     */
    get timestamp(){
        return this._timestamp;
    }

    /**
     * Set the timestamp format
     * @param {Boolean|Number|String} timestamp
     */
    set timestamp(timestamp){
        if(typeof timestamp === "boolean" && !timestamp){
            this.timestamp = null;
        }
        else if(typeof timestamp === "string"){
            timestamp = LoggerMessage.timestamp.stringmap.get(timestamp);
        }
        this._timestamp = timestamp;
    }

    /**
     * Get the level
     */
    get level(){
        return this._level;
    }

    /**
     * Set the level
     * @param {Number|String} level
     */
    set level(level){
        if(typeof level === "boolean" && !level){
            this.enabled = false;
        }
        else if(typeof level === "string"){
            level = LoggerMessage.level.stringmap.get(level);
        }
        this._level = level;
    }

    /**
     * Create a log message.
     * @param {String} text - message to log
     * @param {Number} level - log level
     * @return {String}
     */
    createMessage(text, level){
        return new LoggerMessage({
            context: this.context,
            level: level,
            name: this.name,
            text: text, 
            timestamp: this.timestamp
        });
    }

    /**
     * Log a message. Will do nothing if the current
     * log level is greater than the specified one.
     * @param {LoggerMessage|Object|String} message - message to log
     * @param {Number|String} [level=this.level] - log level; current level by default
     * @return {Promise}
     */
    async log(message, level = this._level){
        if(!this.enabled){
            return;
        }

        // If set as a string, ie "verbose", convert to enum value
        if(typeof level === "string"){
            level = LoggerMessage.level.stringmap.get(level);
        }

        // Check current log level
        if(level < this._level){
            return;
        }

        if(typeof message === "string"){
            message = this.createMessage(message, level);
        }
        else if (typeof message === "object" && !(message instanceof LoggerMessage)){
            if(this.objects_to_string){
                message = this.createMessage(JSON.stringify(message), level);
            }
        }

        await this.checkLogCount();

        this.log_count++;

        return this.logToLevel(message, level);
    }

    /**
     * Log to the appropriate output level
     * @param {LoggerMessage|Object|String} message - message to log
     * @param {Number|String} [level=this.level] - log level; current level by default
     * @returns {Promise}
     */
    async logToLevel(message, level){
        switch(level){
            case LoggerMessage.level.verbose:
                await this._verbose(message);
                break;
            case LoggerMessage.level.debug:
                await this._debug(message);
                break;
            case LoggerMessage.level.info:
                await this._info(message);
                break;
            case LoggerMessage.level.warning:
                await this._warning(message);
                break;
            case LoggerMessage.level.error:
                await this._error(message);
                break;
        }
    }

    /**
     * The output function to log a verbose message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    async _verbose(message){
        if(message instanceof LoggerMessage){
            message = message.toString();
        }
        console.log(message);
    }

    /**
     * Log a verbose message.
     * Use this level when logging relatively
     * unimportant information. Especially useful
     * when debugging program flow.
     * @param {String} message  
     * @returns {Promise}
     */
    async verbose(message){
        await this.log(message, LoggerMessage.level.verbose);
    }

    /**
     * The output function to log a debug message.
     * @param {LoggerMessage|Object} message  
     * @returns {Promise}
     */
    async _debug(message){
        if(message instanceof LoggerMessage){
            message = message.toString();
        }
        console.debug(message);
    }

    /**
     * Log a debug message
     * @param {String} message  
     * @returns {Promise}
     */
    async debug(message){
        await this.log(message, LoggerMessage.level.debug);
    }

    /**
     * The output function to log an info message.
     * @param {LoggerMessage|Object} message  
     * @returns {Promise}
     */
    async _info(message){
        if(message instanceof LoggerMessage){
            message = message.toString();
        }
        console.info(message);
    }

    /**
     * Log an info message
     * @param {String} message 
     * @return {Promise}
     */
    async info(message){
        await this.log(message, LoggerMessage.level.info);
    }

    /**
     * The output function to log a warning message.
     * @param {LoggerMessage|Object} message  
     * @returns {Promise}
     */
    async _warning(message){
        if(message instanceof LoggerMessage){
            message = message.toString();
        }
        console.warn(message);
    }

    /**
     * Log a warning message
     * @param {String} message 
     * @returns {Promise}
     */
    async warning(message){
        await this.log(message, LoggerMessage.level.warning);
    }

    /**
     * The output function to log an error message.
     * @param {LoggerMessage|Object} message  
     * @returns {Promise}
     */
    async _error(message){
        if(message instanceof LoggerMessage){
            message = message.toString();
        }
        console.error(message);
    }

    /**
     * Log an error message
     * @param {String} message 
     * @returns {Promise}
     */
    async error(message){
        await this.log(message, LoggerMessage.level.error);
    }

    /**
     * Check the number of logs and do something if necessary.
     * @returns {Promise}
     */
    async checkLogCount(){

    }
}

if(typeof module !== "undefined"){
    module.exports = Logger;
}