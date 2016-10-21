import path = require('path');
import tl = require('vsts-task-lib/task');

tl.setResourcePath(path.join( __dirname, 'task.json'));

var npm = tl.tool(tl.which('npm', true));

var cwd = tl.getPathInput('cwd', true, false);
tl.mkdirP(cwd);
tl.cd(cwd);

var command = tl.getInput('command', true);
if (command.indexOf(' ') >= 0) {
	tl.setResult(tl.TaskResult.Failed, tl.loc("InvalidCommand"));
}
var args = tl.getInput('arguments', false);

npm.arg(command).line(args)
.exec()
.then(function(code) {
	tl.setResult(code, tl.loc('NpmReturnCode', code));
})
.fail(function(err) {
	tl.debug('taskRunner fail');
	tl.setResult(tl.TaskResult.Failed, tl.loc('NpmFailed', err.message));
})