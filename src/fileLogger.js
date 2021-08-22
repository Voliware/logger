const EOL = require('os').EOL;
const FirstLineTransform = require('./firstLineTransform');
const Fs = require('fs');
const Logger = require('./logger');
const LoggerMessage = require('./loggerMessage');

/**
 * Logs to a file
 * @extends {Logger}
 */
class FileLogger extends Logger {

    /**
     * Constructor
     * @param {String} name - Name of the logger
     * @param {Object} [options={}] 
     * @param {Number} [options.level=LoggerMessage.level.info] - Starting log level
     * @param {Boolean} [options.enabled=true] - Whether the logger is enabled
     * @param {String} [options.context=null] - Optional context appended after logger name
     * @param {Number} [options.timestamp=LoggerMessage.timestamp.locale] - Timestamp format
     * @param {Number} [options.maxlogs=0] - Maximum number of logs until the first log is deleted
     * @param {String} options.filepath='' - Full path of file to write to
     * @param {Number} [options.maxsize=0] - Maximum size of logs until the first log is deleted
     * @param {Boolean} [options.multiplefiles=false] - Whether to start a new file on maxsize or maxlogs
     * @param {Boolean} [options.console=true] - Whether to also log to the console
     * @param {Boolean} [params.objects_to_string=false] - Whether to log plain objects as a string
     */
    constructor(name, {
        level = LoggerMessage.level.info,
        enabled = true,
        context = undefined,
        timestamp = LoggerMessage.timestamp.locale,
        maxlogs = 0,
        filepath = '',
        maxsize = 0,
        multiplefiles = false,
        console = true,
        objects_to_string = false
    }={})
    {
        super(name, {level, enabled, context, maxlogs, timestamp, objects_to_string});
        this.maxsize = maxsize;
        this.multiplefiles = multiplefiles;
        this.console_logger = new Logger(name, {level, enabled: console, context, maxlogs, timestamp, objects_to_string});

        // todo
        if(this.multiplefiles){
            const last_slash = filepath.lastIndexOf('/');
            const dir = last_slash > -1 ? filepath.slice(0, last_slash) : "";
            const filename = filepath.slice(last_slash + 1, filepath.length);
            const last_dot = filename.lastIndexOf('.');
            const filename_noext = last_dot > -1 ? filename.slice(0, last_dot) : filename;
            const logfiles = [];
            const files = Fs.readdirSync(dir);
            files.forEach(file => {
                if(file.includes(filename)){
                    logfiles.push(file);
                }
            })
        }
        
        this.filepath = filepath;
        this.filesize = 0;
        try { this.filesize = Fs.statSync(filepath); } catch (error) { }
        
        this.stream = null;
        this.open();
    }

    /**
     * Set the console logging state
     * @param {Boolean} state
     */
    set console(state){
        this.console_logger.enabled = state;
    }

    /**
     * Open the write stream
     */
    open() {
        this.stream = Fs.createWriteStream(this.filepath, { flags: 'a' });
        this.stream.on('error', error => {
            console.log(error);
        });
    }

    /**
     * Append text to the output file.
     * @param {String} text - text to append
     * @returns {Promise}
     */
    append(text){
        text += EOL;
        this.filesize += text.length;
        return new Promise((resolve, reject) => {
            this.stream.write(text, error => {
                if(error){
                    reject(error);
                }
                else{
                    resolve();
                }
            });
        });
    }

    createNewFile(){

    }

    /**
     * Delete the file
     */
    delete(){
        try {
            Fs.unlinkSync(this.filepath);
        }
        catch (error){
        }
    }

    /**
     * Destroy the stream.
     */
    destroy(){
        if(this.stream){
            this.stream.destroy();
        }
    }

    /**
     * Rename the logfile
     * @param {String} filepath - Full filepath
     */
    rename(filepath){
        Fs.renameSync(this.filepath, filepath);
    }

    /**
     * Clear the file 
     * @returns {Promise}
     */
    async clear(){
        await this.end();
        this.delete();
        this.open();
    }

    /**
     * End the write stream
     * @returns {Promise}
     */
    end(){
        return new Promise((resolve, reject) => {
            this.stream.once('close', () => {
                resolve();
            });
            this.stream.end();
        });
    }

    /**
     * Delete the first line of the file
     * @returns {Promise}
     */
    deleteFirstLine(){
        const read = Fs.createReadStream(this.filepath);
        const tempfile = this.filepath + ".tmp";
        const write = Fs.createWriteStream(tempfile);
        const transform = new FirstLineTransform();
        return new Promise((resolve, reject) => {
            read.pipe(transform)
                .pipe(write)  
                .on("error", (err) => {
                    reject(err);
                })
                .on("finish", async () => {
                    this.filesize -= transform.bytes_removed;
                    if(this.filesize < 0){
                        this.filesize = 0;
                    }
                    await this.end();
                    this.delete();
                    Fs.renameSync(tempfile, this.filepath);
                    this.open();
                    resolve();
                });
        });     
    }

    /**
     * Check the number of logs and if higher than size or count,
     * start a new file or remove the first line from the file.
     * @returns {Promise}
     */
    async checkLogCount(){
        if((this.maxlogs && this.log_count >= this.maxlogs) || (this.maxsize && this.filesize >= this.maxsize)){
            if(this.multiplefiles){
                await this.createNewFile();
            }
            else{
                await this.deleteFirstLine();
            }
        }
    }

    /**
     * The output function to log a verbose message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    async _verbose(message){
        this.console_logger.enabled && this.console_logger._verbose(message);
        await this.append(message.toString());
    }

    /**
     * The output function to log a debug message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    async _debug(message){
        this.console_logger.enabled && this.console_logger._debug(message);
        await this.append(message.toString());
    }

    /**
     * The output function to log an info message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    async _info(message){
        this.console_logger.enabled && this.console_logger._info(message);
        await this.append(message.toString());
    }

    /**
     * The output function to log a warning message.
     * @param {LoggerMessage|Object} message 
     * @returns {Promise}
     */
    async _warning(message){
        this.console_logger.enabled && this.console_logger._warning(message);
        await this.append(message.toString());
    }

    /**
     * The output function to log an error message.
     * @param {LoggerMessage|Object} message 
     */
    async _error(message){
        this.console_logger.enabled && this.console_logger._error(message);
        await this.append(message.toString());
    }
}

module.exports = FileLogger;