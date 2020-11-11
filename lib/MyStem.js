'use strict';

var Promise      = require('bluebird');
var childProcess = require('child_process');
var readline     = require('readline');
var path         = require('path');

function MyStem(args) {
    args = args || {};


    this.path = args.path || path.join(__dirname, '..', 'vendor', process.platform, 'mystem');
    
    if ( process.platform === 'win32' ) {
        this.path += '.exe'
    }
    
    this.handlers = [];
}

MyStem.prototype = {
    start: function() {
        if (this.mystemProcess) return;

        this.mystemProcess = childProcess.spawn(this.path, ['--format', 'json', '--eng-gr', '-i']);
        var rd = readline.createInterface({ input: this.mystemProcess.stdout, terminal: false });

        rd.on('line', function(line) {
            var handler = this.handlers.shift();

            if (handler) {
                var data = JSON.parse(line);
                var options = {
                    onlyLemma: handler.onlyLemma,
                    fullAnalysis: handler.fullAnalysis,
                };

                handler.resolve( this._getGrammemes(data, options) || handler.word );
            }
        }.bind(this));

        this.mystemProcess.on('error', function(err) {
            var handler = this.handlers.shift();

            if (handler) {
                handler.reject(err);
            }
        }.bind(this));

        process.on('exit', function() {
            if (this.mystemProcess) {
                this.mystemProcess.kill();
            }
        }.bind(this));
    },

    stop: function() {
        if (this.mystemProcess) {
            this.mystemProcess.kill();
        }
    },

    extractAllGrammemes : function (word) {
        return this.callMyStem(word);
    },

    lemmatize: function(word) {
        var onlyLemma = true;
        return this.callMyStem(word, {onlyLemma});
    },

    analyze: function(word) {
        var fullAnalysis = true;
        return this.callMyStem(word, {fullAnalysis});
    },

    callMyStem : function (word, options = {}) {
        word = word.replace(/(\S+)\s+.*/, '$1'); // take only first word. TODO
        return new Promise(function(resolve, reject) {
            if (!this.mystemProcess) {
                throw 'You should call MyStem.start()';
            }

            this.mystemProcess.stdin.write(word + '\n');

            this.handlers.push({
                resolve: resolve,
                reject: reject,
                word: word,
                onlyLemma: options.onlyLemma,
                fullAnalysis: options.fullAnalysis,
            });
        }.bind(this));
    },

    _getGrammemes: function(data, options = {}) {
        if (!data[0]) return;

        if (data[0].analysis.length) {
            if (options.fullAnalysis) {
                return data[0].analysis;
            }

            if ( options.onlyLemma ) {
                return data[0].analysis[0].lex;
            }

            var array = [];
            array.push( data[0].analysis[0].lex );

            data[0].analysis[0].gr.split(",").map(function(elem) {
                array.push(elem)
            });

            return array;
        }

        return data[0].text;
    }
};


module.exports = MyStem;
