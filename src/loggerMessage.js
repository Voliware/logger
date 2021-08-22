/**
 * A log message
 */
class LoggerMessage {

    /**
     * Constructor
     * @param {Object} options
     * @param {String|Null} options.context
     * @param {Number|Null} options.level
     * @param {String|Null} options.name
     * @param {String} options.text
     * @param {Number|Boolean} options.timestamp
     */
    constructor({
        context = null,
        level = null,
        name = null,
        text = '',
        timestamp = null
    }){
        
        this.context = context ? `[${context}] ` : '';
        this.level = typeof level !== null ? `[${LoggerMessage.level.string[level]}] ` : '';
        this.name = name ? `[${name}] ` : '';
        this.text = text;
        this.timestamp = typeof timestamp !== null ? this.generateTimestamp(timestamp) : '';
    }

    /**
     * Set the timestamp format
     * @param {Number} format 
     */
    generateTimestamp(format){
        switch(format){
            case LoggerMessage.timestamp.utc:
                return this.generateUtcTimestamp();
            case LoggerMessage.timestamp.localedate:
                return this.generateLocaleDateTimestamp();
            case LoggerMessage.timestamp.localetime:
                return this.generateLocaleTimeTimestamp();
            case LoggerMessage.timestamp.numeric:
                return this.generateNumericTimestamp();
            case LoggerMessage.timestamp.locale:
                return this.generateLocaleTimestamp();
            default:
                return '';
        }
    }

    /**
     * Generate a UTC timestamp.
     * eg "Mon, 01 Jul 2019 14:43:35 GMT"
     * @return {String}
     */
    generateUtcTimestamp(){
        return `[${(new Date().toUTCString())}] `;
    }

    /**
     * Generate a locale timestamp.
     * eg "7/1/2019, 10:43:26 AM"
     * @return {String}
     */
    generateLocaleTimestamp(){
        return `[${(new Date().toLocaleString())}] `;
    }

    /**
     * Generate a locale time timestamp.
     * eg "10:43:06 AM"
     * @return {String}
     */
    generateLocaleTimeTimestamp(){
        return `[${(new Date().toLocaleTimeString())}] `;
    }

    /**
     * Generate a locale date timestamp.
     * eg "7/1/2019"
     * @return {String}
     */
    generateLocaleDateTimestamp(){
        return `[${(new Date().toLocaleDateString())}] `;
    }

    /**
     * Generate a numerical timestamp.
     * eg 1628828513146
     * @return {String}
     */
    generateNumericTimestamp(){
        return `[${Date.now()}] `;
    }

    /**
     * Convert the message to a string
     * @returns {String}
     */
    toString(){
        return `${this.timestamp}${this.level}${this.name}${this.context}${this.text}`;
    }
}

/**
 * LoggerMessage levels
 * @type {Object}
 */
LoggerMessage.level = {
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
 * Map of strings to LoggerMessage levels
 * @type {Map<String, Number>}
 */
LoggerMessage.level.stringmap = new Map()
    .set("verbose", LoggerMessage.level.verbose)
    .set("debug", LoggerMessage.level.debug)
    .set("info", LoggerMessage.level.info)
    .set("warning", LoggerMessage.level.warning)
    .set("error", LoggerMessage.level.error);

/**
 * Timestamp enum
 * @type {Object}
 */
LoggerMessage.timestamp = {
    utc: 0,
    locale: 1,
    localetime: 2,
    localedate: 3,
    numeric: 4
};

/**
 * Map of strings to LoggerMessage timestamps
 * @type {Map<String, Number>}
 */
LoggerMessage.timestamp.stringmap = new Map()
    .set("utc", LoggerMessage.timestamp.utc)
    .set("locale", LoggerMessage.timestamp.locale)
    .set("localetime", LoggerMessage.timestamp.localetime)
    .set("localedate", LoggerMessage.timestamp.localedate)
    .set("numeric", LoggerMessage.timestamp.numeric);

if(typeof module !== "undefined"){
    module.exports = LoggerMessage;
}