import { expect } from "chai";
import { describe, it } from 'mocha';
import * as sinon from 'sinon';
import { BridgeClient } from "../../clients/BridgeClient";
import { CommandRunner } from '../../clients/CommandRunner';
import { ResourceType } from "../../connect/ResourceType";
import { loggerStub } from '../CommonTestObjects';

describe('BridgeClient Tests', () => {
    it('connectAsync should work with multiple containers', async () => {
        loggerStub.trace.reset();
        loggerStub.trace.onCall(0).returns();
        const commandRunnerStub = sinon.createStubInstance(CommandRunner);
        commandRunnerStub.runAsync.resolves("");
        const bridgeClient = new BridgeClient("", "", commandRunnerStub, "", loggerStub);
        await bridgeClient.connectAsync("test", "testKubeConfigPath", "testResource", ResourceType.Service, [3001], 4001,
            "testEnvFilePath", "testScriptPath", "testParentPrcId", null, "testIsolateAs", "testContainer", "testNamespace", false, null);
        expect(commandRunnerStub.runAsync.calledOnce).to.be.true;
        expect(commandRunnerStub.runAsync.getCall(0).args[1].length).not.to.equal(0);
        const args = commandRunnerStub.runAsync.getCall(0).args[1];
        expect(args.indexOf("--container")).not.to.equal(-1);
        expect(args.indexOf("testContainer")).not.to.equal(-1);
    });
});