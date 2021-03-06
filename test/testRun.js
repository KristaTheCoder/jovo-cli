'use strict';
const chai = require('chai');
const assert = chai.assert;
const tmpTestfolder = 'tmpTestfolderRun';
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

const pathSep = path.sep;
/**
 * Deletes folder recursively
 * Found here: https://stackoverflow.com/a/32197381
 * @param {string} path
 */
let deleteFolderRecursive = function(path) {
    if ( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file, index) {
            let curPath = path + pathSep + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

before(function(done) {
    this.timeout(5000);
    deleteFolderRecursive(tmpTestfolder);
    if (!fs.existsSync(tmpTestfolder)) {
        fs.mkdirSync(tmpTestfolder);
    }
    done();
});


describe('run', function() {
    it('jovo new <project>\n      jovo run', function(done) {
        this.timeout(200000);
        const projectName = 'helloworldRun';

        const projectFolder = tmpTestfolder + path.sep + projectName;
        let child = spawn('node', ['./../index.js',
            'new', projectName,
            '-t', 'helloworldtest',
            ], {
            cwd: tmpTestfolder,
        });
        child.stderr.on('data', (data) => {
            console.log(data.toString());
            done();
        });
        child.stdout.on('data', (data) => {
            if (data.indexOf('Installation completed.') > -1) {
                child.kill();
                let childRun = spawn('node', ['./../../index.js',
                    'run'], {
                    cwd: projectFolder,
                });
                childRun.stdout.on('data', (data) => {
                    if (data.indexOf('error') > -1) {
                        assert.ok(false);
                    }
                    if (data.indexOf('Example server listening on port 3000!') > -1) {
                        childRun.kill();
                        done();
                    }
                });
            }
        });
    });

    it('jovo run --bst-proxy', function(done) {
        this.timeout(200000);
        const projectName = 'helloworldRun';
        const projectFolder = tmpTestfolder + path.sep + projectName;
        let child = spawn('node', ['./../../index.js',
            'run',
            '--bst-proxy'], {
            cwd: projectFolder,
        });
        let fullData = '';
        child.stdout.on('data', (data) => {
            fullData += data.toString();
        });

        setTimeout(() => {
            const validation =
                // If proxy has already being run a configuration exists
                fullData.indexOf('Example server listening on port 3000!') > -1 ||
                // If proxy haven't run, one is created
                fullData.indexOf('info: CONFIG      No configuration. Creating one') > -1;
            assert.ok(validation);
            child.kill();
            done();
        }, 8000);
    });
    it('jovo run --webhook-standalone', function(done) {
        this.timeout(200000);
        const projectName = 'helloworldRun';
        const projectFolder = tmpTestfolder + path.sep + projectName;
        let child = spawn('node', ['./../../index.js',
            'run',
            '--webhook-standalone'], {
            cwd: projectFolder,
        });
        let fullData = '';
        child.stdout.on('data', (data) => {
            fullData += data.toString();
        });

        setTimeout(() => {
            assert.ok(fullData.indexOf('Example server listening on port 3000!') === -1);
            child.kill();
            done();
        }, 8000);
    });
});

after(function(done) {
    this.timeout(5000);
    setTimeout(function() {
        deleteFolderRecursive(tmpTestfolder);
        done();
    }, 2000);
});
