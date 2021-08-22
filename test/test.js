const Assert = require('assert');
const Fs = require('fs');
const Logger = require('../index');
const MongoClient = require('mongodb').MongoClient;
const Path = require('path');

describe('Logger', function() {

    before(async function() {
        // File logger
        this.testfile = Path.join(__dirname, "test.log");
        try {Fs.unlinkSync(this.testfile);}
        catch(e){}
        this.filelogger = new Logger.FileLogger("App", {
            filepath: this.testfile, 
            console: false, 
            timestamp: Logger.LoggerMessage.timestamp.none
        });

        // Mongo DB Logger
        const url = "mongodb://localhost:27017/logger-testing?retryWrites=true&w=majority"
        this.mongoclient = new MongoClient(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await this.mongoclient.connect();
        this.db = this.mongoclient.db("logger-testing");
        await this.db.createCollection("logs").catch(error => {
            // Already exists
        })
        this.collection = this.db.collection('logs')
        this.mongologger = new Logger.MongoDbLogger("App", {
            collection: this.collection,
            console: false, 
            timestamp: Logger.LoggerMessage.timestamp.none
        });
    });

    after(function() { 
        this.mongoclient.close();
    });

    it('creates a message at the verbose level', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.verbose);
        Assert.strictEqual(message.toString(), "[VRB] [App] Test");
    });

    it('creates a message at the debug level', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.debug);
        Assert.strictEqual(message.toString(), "[DBG] [App] Test");
    });

    it('creates a message at the info level', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.info);
        Assert.strictEqual(message.toString(), "[INF] [App] Test");
    });

    it('creates a message at the warning level', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.warning);
        Assert.strictEqual(message.toString(), "[WRN] [App] Test");
    });

    it('creates a message at the error level', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.error);
        Assert.strictEqual(message.toString(), "[ERR] [App] Test");
    });

    it('creates a message with no context', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.info);
        Assert.strictEqual(message.toString(), "[INF] [App] Test");
    });

    it('creates a message with context', function() {
        const logger = new Logger.ConsoleLogger("App", {context:"User", timestamp: Logger.LoggerMessage.timestamp.none});
        const message = logger.createMessage("Test", Logger.LoggerMessage.level.info);
        Assert.strictEqual(message.toString(), "[INF] [App] [User] Test");
    });

    it('creates a message with a UTC timestamp', function() {
        const logger = new Logger.ConsoleLogger("App", {timestamp: Logger.LoggerMessage.timestamp.utc});
        const message = logger.createMessage("Test").toString();
        const regex = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\,\s\d{2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT/;
        const date = message.split(']')[0].replace('[', '').replace(']', '');
        const valid = regex.test(date);
        Assert.strictEqual(valid, true);
    });

    it('creates a log file if it does not exist', async function() {
        await this.filelogger.info("First Test");
        const exists = Fs.existsSync(this.testfile);
        Assert.strictEqual(exists, true);
    });

    it('appends to the log file', async function() {
        await this.filelogger.info("Second Test");
        const file = Fs.readFileSync(this.testfile).toString();
        const contents = '[INF] [App] First Test\r\n[INF] [App] Second Test\r\n';
        Assert.strictEqual(file, contents);
    });

    it('counts filesize correctly', async function() {
        const stats = Fs.statSync(this.testfile);
        Assert.strictEqual(stats.size, this.filelogger.filesize);
    });

    it('deletes the first line', async function() {
        await this.filelogger.deleteFirstLine();
        const file = Fs.readFileSync(this.testfile).toString();
        const contents = '[INF] [App] Second Test\r\n';
        Assert.strictEqual(file, contents);
    });

    it('erases the log file', async function() {
        await this.filelogger.clear();
        const exists = Fs.existsSync(this.testfile);
        Assert.strictEqual(exists, false);
    });

    it('deletes the log file', async function() {
        await this.filelogger.info("Delete Test");
        this.filelogger.delete();
        const exists = Fs.existsSync(this.testfile);
        Assert.strictEqual(exists, false);
    });

    it('does not log if disabled', async function() {
        this.filelogger.enabled = false;
        await this.filelogger.info("Test");
        const exists = Fs.existsSync(this.testfile);
        Assert.strictEqual(exists, false);
    });

    it('logs to the collection', async function() {
        await this.mongologger.info("Test 1");
        const data = await this.collection.findOne();
        Assert.strictEqual(data.context, null);
        Assert.strictEqual(data.level, 'INF');
        Assert.strictEqual(data.name, 'App');
        Assert.strictEqual(data.text, 'Test 1');
        Assert.strictEqual(data.timestamp, null);
    });

    it('deletes the first document', async function() {
        await this.mongologger.info("Test 2");
        await this.mongologger.deleteFirstDocument();
        const data = await this.collection.findOne();
        Assert.strictEqual(data.context, null);
        Assert.strictEqual(data.level, 'INF');
        Assert.strictEqual(data.name, 'App');
        Assert.strictEqual(data.text, 'Test 2');
        Assert.strictEqual(data.timestamp, null);
    });

    it('clears the collection', async function() {
        await this.mongologger.clear();
        const data = await this.collection.findOne();
        Assert.strictEqual(data, undefined);
    });
});