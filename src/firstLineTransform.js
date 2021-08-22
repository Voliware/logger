const EOL = require('os').EOL;
const {Transform} = require('stream');

/**
 * A transform that removes the first line of a buffer
 * @extends {Transform}
 */
class FirstLineTransform extends Transform {

    /**
     * Constructor
     */
    constructor(eol = EOL){
        super();
        this.eol = eol;
        this.firstline_buffer = '';
        this.bytes_removed = 0;
    }

    /**
     * Transform a chunk. Skip the first line.
     * @param {Buffer|String|Any} chunk 
     * @param {String} encoding 
     * @param {Function} callback 
     * @async
     */
    async _transform(chunk, encoding, callback){
        if (this.bytes_removed) { 
            this.push(chunk); 
        } 
        else {
            this.firstline_buffer += chunk.toString();
            
            const eol_start_index = this.firstline_buffer.indexOf(this.eol);
            if (eol_start_index > -1) {
                const eol_end_index = eol_start_index + this.eol.length;
                this.bytes_removed = this.firstline_buffer.slice(0, eol_end_index).length;
                const after_eol_slice = this.firstline_buffer.slice(eol_end_index);
                this.push(after_eol_slice);
                this.firstline_buffer = '';
            }
        }
        callback();
    }
}

module.exports = FirstLineTransform;