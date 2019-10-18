const Logger = require('./logger');
const fs = require('fs');
const endOfLine = require('os').EOL;

/**
 * Logger with file output support
 * 
 * @example - create a logger that saves to a file (node only)
 * let logger = new Logger("Module", {
    *      level: Logger.level.debug,
    *      timestamp: true,
    *      output: {
    *          console: true,
    *          file: "./logs/module.txt"
    *      }
    * });
 */
class NodeLogger extends Logger {

    
    /**
    * Constructor
    * @param {string} name - name of the logger
    * @param {object} [options={}] 
    * @param {number} [options.level=Logger.level.info] - starting log level
    * @param {object|boolean} [options.timestamp] - timestamp options, or boolean for default time format
    * @param {boolean} [options.timestamp.state=false] - whether to print timestamps
    * @param {number} [options.timestamp.format=Logger.timestamp.locale] - timestamp format
    * @param {string} [options.context=null] - optional context appended after logger name
    * @param {object} [options.output]
    * @param {boolean} [options.output.console=true] - whether to output to the console
    * @param {string} [options.output.file=""] - a file to save the log to, or blank for none
    * @return {Logger}
    */
    constructor(name, options = {}){
        let defaults = {
            output: {
                console: true,
                file: ""
            }
        };
        super(name, Object.extend(defaults, options));
        if(!this.isNodeEnv()){
            throw new Error("Not useable in non-node environment");
        }
        return this;
    }
    
    /**
     * Check if this is a node environment
     * @return {boolean} true if it is
     */
    isNodeEnv(){
        return typeof process !== 'undefined' && typeof process.versions.node !== 'undefined';
    }

    /**
     * Check if a file path is valid
     * @param {string} filepath - file path
     * @return {boolean} true if it is
     */
    isValidFilepath(filepath){
        return filepath && filepath !== "";
    }

    /**
     * Set the state of logging to the console.
     * @param {boolean} state - true to enable
     * @return {NodeLogger}
     */
    setConsoleState(state){
        this.options.output.console = state;
        return this;
    }

    /**
     * Set the out file path
     * @param {string} filepath - file path
     * @return {NodeLogger}
     */
    setLogFileOutput(filepath){
        if(this.isValidFilepath(filepath)){
            this.options.output.file = filepath;
        }
        else {
            console.log("Cannot enable file output: invalid output file");
            this.options.output.file = "";
        }
        return this;
    }

    /**
     * Append text to the output file.
     * Automatically adds an end of line character.
     * @param {string} text - text to append
     * @return {Promise}
     */
    appendToLogFile(text){
        return new Promise((resolve, reject) => {
            return fs.appendFile(this.options.output.file, text + endOfLine, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            }); 
        });
    }

    /**
     * Erase the log file
     * @return {Promise}
     */
    eraseLogFile(){
        return new Promise((resolve, reject) => {
            fs.writeFile(this.options.output.file, "", function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            }); 
        });
    }

    /**
     * Delete the log file
     * @return {Promise}
     */
    deleteLogfile(){
        return new Promise((resolve, reject) => {
            fs.unlink(this.options.output.file, function(err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            }); 
        });
    }

    /**
     * Log a message.
     * If console logging is enabled, logs to the console.
     * If file output is valid, logs to the file.
     * @param {string} message - message to log
     * @return {NodeLogger}
     */
    logMessage(message){
        if(this.options.output.console){
            super.logMessage(message);
            return this;
        }
        if(this.isValidFilepath(this.options.output.file)){
            return this.appendToLogFile(message);
        }
    }
}

module.exports = NodeLogger;