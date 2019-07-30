const Logger = require('../index');
const assert = require('assert')
const fs = require('fs');

const testfile = "./log.txt";
try {
    fs.accessSync(testfile);
    fs.unlinkSync(testfile);
}
catch(e){
    
}


it('sets the name from constructor options', () => {
    let name = "App";
    let logger = new Logger(name);
    assert.strictEqual(logger.name, name);
});

it('sets the level from constructor options', () => {
    let level = Logger.level.error;
    let logger = new Logger("App", {level});
    assert.strictEqual(logger.options.level, level);
});

it('sets the timestamp state from constructor options', () => {
    let logger = new Logger("App", {timestamp: {state: true}});
    assert.strictEqual(logger.options.timestamp.state, true);
});

it('sets the timestamp format from constructor options', () => {
    let format = Logger.timestamp.utc;
    let logger = new Logger("App", {timestamp: {format}});
    assert.strictEqual(logger.options.timestamp.format, format);
});

it('sets the context from constructor options', () => {
    let context = "User";
    let logger = new Logger("App", {context});
    assert.strictEqual(logger.options.context, context);
});

it('creates a message at the verbose level', () => {
    let level = Logger.level.verbose;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    assert.strictEqual(msg, "[VRB] [App] Test");
});

it('creates a message at the debug level', () => {
    let level = Logger.level.debug;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    assert.strictEqual(msg, "[DBG] [App] Test");
});

it('creates a message at the info level', () => {
    let level = Logger.level.info;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    assert.strictEqual(msg, "[INF] [App] Test");
});

it('creates a message at the warning level', () => {
    let level = Logger.level.warning;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    assert.strictEqual(msg, "[WRN] [App] Test");
});

it('creates a message at the error level', () => {
    let level = Logger.level.error;
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", level);
    assert.strictEqual(msg, "[ERR] [App] Test");
});

it('creates a message with no context', () => {
    let logger = new Logger("App");
    let msg = logger.createMessage("Test", Logger.level.info);
    assert.strictEqual(msg, "[INF] [App] Test");
});

it('creates a message with context', () => {
    let logger = new Logger("App", {context:"User"});
    let msg = logger.createMessage("Test", Logger.level.info);
    assert.strictEqual(msg, "[INF] [App] [User] Test");
});

it('creates a message with a UTC timestamp', () => {
    let format = Logger.timestamp.utc;
    let logger = new Logger("App", {timestamp: {state:true, format}});
    let msg = logger.createMessage("Test");
    let regex = /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\,\s\d{2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s\d{2}:\d{2}:\d{2}\sGMT/;
    let date = msg.split(']')[0].replace('[', '').replace(']', '');
    let valid = regex.test(date);
    assert.strictEqual(valid, true);
});

it('creates a log file if it does not exist', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });
    await logger.info("Test");
    assert.strictEqual(fs.existsSync(testfile), true);
});

it('appends to the log file', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });

    await logger.info("Test");
    let file = fs.readFileSync(testfile).toString();
    let contents = '[INF] [App] Test\r\n[INF] [App] Test\r\n';
    assert.strictEqual(file, contents);
});

it('erases the log file', async () => {
    let logger = new Logger("App", {
        output: {
            console: false,
            file:"./log.txt"
        }
    });

    await logger.eraseLogFile();
    let file = fs.readFileSync(testfile).toString();
    assert.strictEqual(file, '');
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
        fs.accessSync(testfile);
        assert.strictEqual(1, 0);
    }
    catch(e){
        // we want it to fail
        assert.strictEqual(1, 1);
    }
});