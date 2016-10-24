import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');

export class NpmMockHelper {
    static NpmCmdPath = "C:\\Program Files (x86)\\nodejs\\npm";

    public answers: ma.TaskLibAnswers = {};
    
    constructor(
        private tmr: tmrm.TaskMockRunner,
        public command: string,
        public args: string) { 
        process.env['AGENT_HOMEDIRECTORY'] = "c:\\agent\\home\\directory";
        process.env['BUILD_SOURCESDIRECTORY'] = "c:\\agent\\home\\directory\\sources";
        process.env['ENDPOINT_AUTH_SYSTEMVSSCONNECTION'] = "{\"parameters\":{\"AccessToken\":\"token\"},\"scheme\":\"OAuth\"}";
        process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = "https://example.visualstudio.com/defaultcollection";
        process.env['SYSTEM_DEFAULTWORKINGDIRECTORY'] = "c:\\agent\\home\\directory";
        process.env['SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'] = "https://example.visualstudio.com/defaultcollection";

        tmr.setInput('cwd', 'fake/wd');
        tmr.setInput('command', command);
        tmr.setInput('arguments', args);

        this.setDefaultAnswers();
    }

    public run(result:ma.TaskLibAnswerExecResult) {
        this.setExecResponse(result);
        this.tmr.setAnswers(this.answers);
        this.tmr.run();
    }
   
    private setExecResponse(result:ma.TaskLibAnswerExecResult) {
        if (!this.answers.exec) {
            this.answers.exec = {};
        }
        this.answers.exec[NpmMockHelper.NpmCmdPath + " " + this.command + " " + this.args] = result;
    }

    private setDefaultAnswers() {
        this.setToolPath(this.answers, "npm", NpmMockHelper.NpmCmdPath);
    }

    private setToolPath(answers: ma.TaskLibAnswers, tool: string, path: string) {
        if (!answers.which) {
            answers.which = {};
        }
        answers.which[tool] = path;
        if (!answers.checkPath) {
            answers.checkPath = {};
        }
        answers.checkPath[path] = true;
    }
}