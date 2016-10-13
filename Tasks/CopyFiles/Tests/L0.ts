import * as assert from 'assert';
import * as path from 'path';
import * as tl from 'vsts-task-lib/task';
let mockery = require('mockery');

describe('CopyFiles L0 Suite', function () {
    let mockFS;
    let mockTL;

    before(() => {
    });

    after(() => {
    });

    beforeEach(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
        mockFS = { };
        mockTL = {
            debug: tl.debug,
            getBoolInput: tl.getBoolInput,
            getDelimitedInput: tl.getDelimitedInput,
            getPathInput: (name: string, required?: boolean, check?: boolean) => {
                return tl.getPathInput(name, required, false); // override check to always be false
            },
            loc: tl.loc,
            match: tl.match,
            setResourcePath: tl.setResourcePath
        };
        mockery.registerMock('fs', mockFS);
        mockery.registerMock('vsts-task-lib/task', mockTL);
    });

    afterEach(() => {
        mockery.disable();
    });

    it('copy all files from srcdir to destdir', (done: MochaDone) => {
        this.timeout(1000);

        // arrange
        process.env.INPUT_CONTENTS = '**';
        process.env.INPUT_SOURCEFOLDER = '/srcDir';
        process.env.INPUT_TARGETFOLDER = '/destDir';
        process.env.INPUT_CLEANTARGETFOLDER = 'false';
        process.env.INPUT_OVERWRITE = 'false';
        tl._loadData();
        mockTL.find = (findPath: string , options?: tl.FindOptions) => {
            if (findPath == '/srcDir' && options.followSymbolicLinks) {
                return [
                    '/srcDir/someOtherDir',
                    '/srcDir/someOtherDir/file1.file',
                    '/srcDir/someOtherDir/file2.file',
                    '/srcDir/someOtherDir2',
                    '/srcDir/someOtherDir2/file1.file',
                    '/srcDir/someOtherDir2/file2.file',
                    '/srcDir/someOtherDir2/file3.file',
                    '/srcDir/someOtherDir3'
                ];
            }
        };
        mockTL.stats = (path: string) => {
            switch (path) {
                case '/srcDir/someOtherDir':
                case '/srcDir/someOtherDir2':
                case '/srcDir/someOtherDir3':
                    return { isDirectory: () => true };
                case '/srcDir/someOtherDir/file1.file':
                case '/srcDir/someOtherDir/file2.file':
                case '/srcDir/someOtherDir2/file1.file':
                case '/srcDir/someOtherDir2/file2.file':
                case '/srcDir/someOtherDir2/file3.file':
                    return { isDirectory: () => false };
                default:
                    throw { code: 'ENOENT' };
            }
        };
        let cp_items = [ ];
        mockTL.cp = function () {
            cp_items.push(Array.prototype.slice.call(arguments));
        };
        let mkdirP_items = [ ];
        mockTL.mkdirP = function () {
            mkdirP_items.push(Array.prototype.slice.call(arguments));
        };

        // act
        require('../copyfiles');

        // assert
        assert.equal(mkdirP_items.length, 3, 'should have created two directories');
        assert.equal(mkdirP_items[0], '/destDir');
        assert.equal(mkdirP_items[1], path.join('/destDir', 'someOtherDir'));
        assert.equal(mkdirP_items[2], path.join('/destDir', 'someOtherDir2'));
        assert.equal(cp_items.length, 5, 'should have copied 5 files');
        assert.deepEqual(cp_items[0], [ '/srcDir/someOtherDir/file1.file', path.join('/destDir', 'someOtherDir', 'file1.file') ]);
        assert.deepEqual(cp_items[1], [ '/srcDir/someOtherDir/file2.file', path.join('/destDir', 'someOtherDir', 'file2.file') ]);
        assert.deepEqual(cp_items[2], [ '/srcDir/someOtherDir2/file1.file', path.join('/destDir', 'someOtherDir2', 'file1.file') ]);
        assert.deepEqual(cp_items[3], [ '/srcDir/someOtherDir2/file2.file', path.join('/destDir', 'someOtherDir2', 'file2.file') ]);
        assert.deepEqual(cp_items[4], [ '/srcDir/someOtherDir2/file3.file', path.join('/destDir', 'someOtherDir2', 'file3.file') ]);

        done();
    });
});
