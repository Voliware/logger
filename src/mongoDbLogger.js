const {ObjectId} = require('mongodb');
const Logger = require('./logger');
const LoggerMessage = require('./LoggerMessage');

/**
 * Logs to a MongoDB collection
 * The Collection object must be from the @voliware/node-mongodb package.
 * @extends {Logger}
 */
class MongoDbLogger extends Logger {

    /**
     * Constructor
     * @param {String} name - Name of the logger
     * @param {Object} [options={}] 
     * @param {Number} [options.level=LoggerMessage.level.info] - Starting log level
     * @param {Boolean} [options.enabled=true] - Whether the logger is enabled
     * @param {String} [options.context=null] - Optional context appended after logger name
     * @param {Number} [options.timestamp=LoggerMessage.timestamp.locale] - Timestamp format
     * @param {Number} [options.maxlogs=0] - Maximum number of logs until the first log is deleted
     * @param {Collection} options.collection - MongoDB collection reference
     * @param {Boolean} [options.console=true] - Whether to also log to the console
     * @param {Boolean} [params.objects_to_string=false] - Whether to log plain objects as a string
     */
    constructor(name, {
        level = LoggerMessage.level.info,
        enabled = true,
        context = null,
        timestamp = LoggerMessage.timestamp.locale,
        maxlogs = 0,
        collection = null,
        console = true,
        objects_to_string = false
    }={})
    {
        super(name, {level, enabled, context, maxlogs, timestamp, objects_to_string});
        this.collection = collection;
        this.log_count = 0;
        this.console_logger = new Logger(name, {level, enabled: console, context, maxlogs, timestamp, objects_to_string});
    }

    /**
     * Set the console logging state
     * @param {Boolean} state
     */
    set console(state){
        this.console_logger.enabled = state;
    }

    /**
     * Clear the collection
     */
    clear(){
        this.collection.deleteMany({});
    }

    /**
     * Insert a message into the collection
     * @param {LoggerMessage} message 
     */
    insertMessage(message){
        if(!this.collection){
            return;
        }

        if(!this.log_count){
            this.log_count = this.collection.countDocuments();
        }

        if(typeof message.text === 'object'){
            message.text = this.cloneAndFilterObject(message.text);
        }

        this.collection.insertOne(message);
    }


    /**
     * Process a message just before logging
     * If the incoming message is a plain old object, the intention
     * is to log this object directly to the MongoDB 
     * @param {LoggerMessage|Object|String} message - message to log
     * @param {Number} level
     */
    processMessage(message, level){
        if(typeof message === 'object' && !(message instanceof LoggerMessage)){
            if(!this.objects_to_string){
                message = this.createMessage(message, level);
            }
        }
        return message;
    }

    /**
     * The output function to log a verbose message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    _verbose(message){
        this.console_logger.enabled &&  this.console_logger._verbose(message);
        message = this.processMessage(message, LoggerMessage.level.verbose);
        return this.insertMessage(message);
    }

    /**
     * The output function to log a debug message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    _debug(message){
        this.console_logger.enabled && this.console_logger._debug(message);
        message = this.processMessage(message, LoggerMessage.level.debug);
        return this.insertMessage(message);
    }

    /**
     * The output function to log an info message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    _info(message){
        this.console_logger.enabled && this.console_logger._info(message);
        message = this.processMessage(message, LoggerMessage.level.info);
        return this.insertMessage(message);
    }

    /**
     * The output function to log a warning message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    _warning(message){
        this.console_logger.enabled && this.console_logger._warning(message);
        message = this.processMessage(message, LoggerMessage.level.warning);
        return this.insertMessage(message);
    }

    /**
     * The output function to log an error message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    _error(message){
        this.console_logger.enabled && this.console_logger._error(message);
        message = this.processMessage(message, LoggerMessage.level.error);
        return this.insertMessage(message);
    }

    /**
     * Create a new collection
     */
    createNewCollection(){
        // return this.db.createCollection(name)
    }

    /**
     * Delete the first document
     * @returns {Promise}
     */
    deleteFirstDocument(){
        return this.collection.deleteOne({});
    }

    /**
     * Check the number of logs and if higher than size or count,
     * start a new file or remove the first line from the file.
     * @returns {Promise}
     */
    async checkLogCount(){
        if(this.maxlogs && this.log_count >= this.maxlog){
            if(this.multiple_collections){
                await this.createNewCollection();
            }
            else{
                await this.deleteFirstDocument();
            }
        }
    }

    /**
     * Clone object helper
     * @param {Object} object 
     * @returns {Object}
     */
    cloneAndFilterObject(object) {
        const clone = {};
        for(const i in object) {
            if(object[i] instanceof ObjectId){
                clone[i] = object[i].toString()
            }
            else {
                const clean_key = i.replace(/[$.]/g, '');
                if(object[i] !== null && typeof(object[i]) === 'object'){
                    clone[clean_key] = this.cloneAndFilterObject(object[i]);
                }
                else{
                    clone[clean_key] = object[i];
                }
            }
        }
        return clone;
    }
    
}

module.exports = MongoDbLogger;