import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'vsts-task-lib/mock-test';

describe('Npm Suite', function () {
    before(() => {
    });

    after(() => {
    });
    
    it('Simple npm dummy', (done: MochaDone) => {
        this.timeout(1000);
        let tp = path.join(__dirname, 'configlist.js')
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run()

        assert(tr.ran('C:\\Program Files (x86)\\nodejs\\npm config list'), 'it should have run npm');
        assert(tr.stdOutContained('; cli configs'), "should have npm config output");
        assert(tr.succeeded, 'should have succeeded');
        assert(tr.invokedToolCount == 1, 'should have run npm');
        assert.equal(tr.errorIssues.length, 0, "should have no errors");

        done();
    });
});