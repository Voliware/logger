# logger
Probably the simplest logger out there. Now with a little more kick.

Version 2 introduces breaking changes, as well as new `FileLogger` and `MongoDbLogger` classes.

## How to Use it
### Use it in the Browser or Node.js
```js
const logger = new Logger("App", {
   level: "debug",     // or LoggerMessage.level.debug
   timestamp: "utc"    // or LoggerMessage.timestamp.utc
});

// Prints to a console
// [Mon, 01 Jul 2019 23:41:04 GMT] [DBG] [App] Initializing
logger.debug("Initializing"); 
```

### Use it for File Logging in Node.js
```js
const {FileLogger} = require('@voliware/logger');

const filelogger = new FileLogger("App", {
    context: "User",
    filepath: "/path/to/file.log",
    timestamp: false,
    maxlogs: 10000,
    maxsize: 1024 * 1000,
    //multiplefiles: true // Not yet supported
});

// Logs to a file
// [INF] [App] [User] Logged in
logger.info("Logged in"); 
```

### Use it for MongoDB Logging in Node.js
```js
const {MongoDbLogger} = require('@voliware/logger');

// Setup MongoDB example
const url = "mongodb://localhost:27017/logger-testing?retryWrites=true&w=majority"
const mongoclient = new MongoClient(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
await mongoclient.connect();
const mongodb = mongoclient.db("logger-testing");
await mongodb.createCollection("logs");

// Create the logger
const mongodblogger = new MongoDbLogger("App", {
    collection: mongodb.collection('logs')
});
```

### Single Logger
If you want to use a single logger throughout, but want to change the [Name] or [Context] per message, you can pass a `LoggerMessage` object to the associated log function.

```js
logger.debug(new LoggerMessage({
    name: "[Social]",
    context: "[Posts]",
    text: "Bob posted something"
}))
```

## Logger API
```js
logger.verbose("verbose log");
logger.debug("debug log");
logger.info("info log");
logger.warning("warning log");
logger.error("error log");
logger.log("hello", "debug");
logger.log("hello again", Logger.level.debug);
logger.name = "App";
logger.context = "Users";
logger.timestamp = "numeric";
logger.level = "info";
logger.enabled = false;
logger.maxlogs = 1000;
logger.maxlogs = 0; // no limit
logger.maxsize = 1024 * 1024;
logger.maxsize = 0; // no limit
```

## FileLogger API
```js
logger.console = false; // don't also print to console
logger.filepath = 'path/to/file.ext';
logger.maxsize = 1024 * 1024;
logger.maxsize = 0; // no limit
//logger.multiplefiles = true; // future
logger.clear();
logger.delete();
logger.rename('new/file/name.ext');
```

## MongoDbLogger API
```js
logger.console = false; // don't also print to console
logger.collection = collection; // native MongoDB collection
logger.clear();
```


## Node
Install with node package manager
```js
npm install @voliware/logger
```
Include in a file
```js
const Logger = require('@voliware/logger');
```

## Browser
Include in a file
```html
<script src="https://cdn.jsdelivr.net/npm/@voliware/logger/dist/logger.min.js"></script>
```
