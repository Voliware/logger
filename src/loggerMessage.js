/**
 * A log message
 */
class LoggerMessage {

    /**
     * Constructor
     * @param {Object} [options={}]
     * @param {String|Null} [options.context=undefined]
     * @param {Number|Null} [options.level=undefined]
     * @param {String|Null} [options.name=undefined]
     * @param {String} [options.text=undefined]
     * @param {Number|Boolean} [options.timestamp=undefined]
     */
    constructor({
        context = undefined,
        level = undefined,
        name = undefined,
        text = undefined,
        timestamp = undefined
    }={}){
        
        this.context = context;
        this.level = typeof level !== 'undefined' ? LoggerMessage.level.string[level] : level;
        this.name = name;
        this.text = text;
        this.timestamp = typeof timestamp !== 'undefined' ? this.generateTimestamp(timestamp) : timestamp;
    }

    /**
     * Set the timestamp format
     * @param {Number} format 
     */
    generateTimestamp(format){
        switch(format){
            case LoggerMessage.timestamp.utc:
                return new Date().toUTCString();
            case LoggerMessage.timestamp.localedate:
                return new Date().toLocaleDateString();
            case LoggerMessage.timestamp.localetime:
                return new Date().toLocaleTimeString();
            case LoggerMessage.timestamp.numeric:
                generateNumericTimestamp();
            case LoggerMessage.timestamp.locale:
                return new Date().toLocaleString();
            case LoggerMessage.timestamp.none:
            default:
                return undefined;
        }
    }

    /**
     * Convert the message to a string
     * @returns {String}
     */
    toString(){
        const timestamp = this.timestamp ? `[${this.timestamp}] ` : '';
        const level = this.level ? `[${this.level}] ` : '';
        const name = this.name ? `[${this.name}] ` : '';
        const context = this.context ? `[${this.context}] ` : '';
        const text = this.text ? this.text : '';
        
        return `${timestamp}${level}${name}${context}${text}`;
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
    none: 0,
    utc: 1,
    locale: 2,
    localetime: 3,
    localedate: 4,
    numeric: 5
};

/**
 * Map of strings to LoggerMessage timestamps
 * @type {Map<String, Number>}
 */
LoggerMessage.timestamp.stringmap = new Map()
    .set("none", LoggerMessage.timestamp.none)
    .set("utc", LoggerMessage.timestamp.utc)
    .set("locale", LoggerMessage.timestamp.locale)
    .set("localetime", LoggerMessage.timestamp.localetime)
    .set("localedate", LoggerMessage.timestamp.localedate)
    .set("numeric", LoggerMessage.timestamp.numeric);

if(typeof module !== "undefined"){
    module.exports = LoggerMessage;
}