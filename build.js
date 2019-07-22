const uglify = require('uglify-es');
const fs = require('fs');

const input = './src/logger.js';
const output = './dist/logger.min.js';

fs.readFile(input, function(err, code){
    if(err) throw err;
    let result = uglify.minify(code.toString());
    fs.writeFile(output, result.code, function(err){
        let status = "OK";
        if(err){
           status = "ERR";
           console.error(err);
        } 

        console.log(`\r\n\\\\     \/\/ \/\/\/\/\/\/ \/\/     \/\/ \\\\           \/\/ \/\/\\ \\\\\\\\\\\\ \\\\\\\\\\\\\\\r\n \\\\   \/\/ \/\/  \/\/ \/\/     \/\/   \\\\   \/\/\\   \/\/ \/\/ \\\\ \\\\  \\\\ \\\\___\r\n  \\\\ \/\/ \/\/  \/\/ \/\/     \/\/     \\\\ \/\/ \\\\ \/\/ \/\/   \\\\ \\\\\\\\\\  \\\\\r\n   \\\\\/ \/\/\/\/\/\/ \/\/\/\/\/\/ \/\/       \\\\\/   \\\\\/ \/\/     \\\\ \\\\  \\\\ \\\\\\\\\\\\`);
        console.log(`
            - ${(new Date()).toLocaleString()}
            - INPUT: ${input}
            - OUTPUT: ${output}
            - STATUS: ${status}
        `);
    });
});