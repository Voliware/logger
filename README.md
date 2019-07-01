# logger
Probably the simplest logger out there.

## How to Use it
```js
let logger = new Logger("App", {
   level: Logger.level.debug,
   timestamp: {
       state: true,
       format: Logger.timestamp.utc
   }
});

// prints to the console
// [Mon, 01 Jul 2019 23:41:04 GMT] [DBG] [App] Initializing
logger.debug("Initializing"); 
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
Save the `/dist/logger.min.js` file and upload it to a web host, or use this CDN https://cdn.jsdelivr.net/npm/@voliware/logger/dist/logger.min.js 

Include in a file
```html
<script src="https://cdn.jsdelivr.net/npm/@voliware/logger/dist/logger.min.js"></script>
```
