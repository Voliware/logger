const Assert = require('assert');
const Fs = require('fs');
const Logger = require('../index');

const testfile = "./log.txt";
try {
    Fs.accessSync(testfile);
    Fs.unlinkSync(testfile);
}
catch(e){
    
}


it('sets the name from constructor options', () => {
    let name = "App";
    let logger = new Logger(name);
    Assert.strictEqual(logger.name, name);
});

it('sets the level from constructor options', () => {
    let level = Logger.level.error;
    let logger = new Logger("App", {level});
    Assert.strictEqual(logger.options.level, level);
});

it('sets the timestamp state from constructor options', () => {
    let logger = new Logger("App", {timestamp: {state: true}});
    Assert.strictEqual(logger.options.timestamp.state, true);
});

it('sets the timestamp format from constructor options', () => {
    let format = Logger.timestamp.utc;
    let logger = new Logger("App", {timestamp: {format}});
    Assert.strictEqual(logger.options.timestamp.format, format);
});

it('sets the context from constructor options', () => {
    let context = "User";
    let logger = new Logger("App", {context});
    Assert.strictEqual(logger.options.context, context);
});

it('creates a message at the verbose level', () => {
    let level = Logger.level.verbose;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    Assert.strictEqual(msg, "[VRB] [App] Test");
});

it('creates a message at the debug level', () => {
    let level = Logger.level.debug;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    Assert.strictEqual(msg, "[DBG] [App] Test");
});

it('creates a message at the info level', () => {
    let level = Logger.level.info;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    Assert.strictEqual(msg, "[INF] [App] Test");
});

it('creates a message at the warning level', () => {
    let level = Logger.level.warning;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    Assert.strictEqual(msg, "[WRN] [App] Test");
});

it('creates a message at the error level', () => {
    let level = Logger.level.error;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    Assert.strictEqual(msg, "[ERR] [App] Test");
});

it('creates a message with no context', () => {
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", Logger.level.info);
    Assert.strictEqual(msg, "[INF] [App] Test");
});

it('creates a message with context', () => {
    let logger = new Logger("App", {context:"User"});
    let msg = logger.createMessage("Test", Logger.level.info);
    Assert.strictEqual(msg, "[INF] [App] [User] Test");
});

it('creates a message with a UTC timestamp', () => {
    let format = Logger.timestamp.utc;
    let logger = new Logger("App", {timestamp: {state:true, format}});
    let msg = logger.createMessage("Test");
    let regex = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\,\s\d{2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT/;
    let date = msg.split(']')[0].replace('[', '').replace(']', '');
    let valid = regex.test(date);
    Assert.strictEqual(valid, true);
});

it('creates a log file if it does not exist', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });
    await logger.info("Test");
    Assert.strictEqual(Fs.existsSync(testfile), true);
});

it('appends to the log file', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });

    await logger.info("Test");
    let file = Fs.readFileSync(testfile).toString();
    let contents = '[INF] [App] Test\r\n[INF] [App] Test\r\n';
    Assert.strictEqual(file, contents);
});

it('erases the log file', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });

    await logger.eraseLogFile();
    let file = Fs.readFileSync(testfile).toString();
    Assert.strictEqual(file, '');
});

it('deletes the log file', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });

    await logger.deleteLogfile();
    try {
        Fs.accessSync(testfile);
        Assert.strictEqual(1, 0);
    }
    catch(e){
        // we want it to fail
        Assert.strictEqual(1, 1);
    }
});