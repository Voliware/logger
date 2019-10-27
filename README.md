# logger
Probably the simplest logger out there.

## How to Use it
```js
let logger = new Logger("App", {
   level: Logger.level.debug,
   timestamp: {
       state: true,
       format: Logger.timestamp.utc
   },
   output: {
      console: true,
      // node only
      file: './log.txt'
   }
});

// prints to the console
// [Mon, 01 Jul 2019 23:41:04 GMT] [DBG] [App] Initializing
logger.debug("Initializing"); 
```

### API
```js
logger.verbose("verbose log");
logger.debug("debug log");
logger.info("info log");
logger.warning("warning log");
logger.error("error log");
logger.log("hello", "debug");
logger.log("hello again", Logger.level.debug);
logger.disable();
logger.enable();
logger.level("info");
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
