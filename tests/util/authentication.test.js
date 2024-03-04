import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import jwt from 'jsonwebtoken';
import Auth from '../../src/util/authentication.js';
import sandbox from "sinon";

use(chaiHttp);

/**
 * Tests for FRT-M7
 */
describe('FRT-M7: Test util authentication module', () => {
    let verifyStub, signStub, send, json, res, req;

    beforeEach(() => {
        send = sandbox.spy();
        json = sandbox.spy();
        res = { send, status: sandbox.stub().returns({ json, send }), json };

        verifyStub = sandbox.stub(jwt, 'verify');
        verifyStub.withArgs("mockValidToken", sandbox.match.any, sandbox.match({ algorithm: ['RS256'] })).returns({username:123});

        signStub = sandbox.stub(jwt, 'sign');
    });

    afterEach(() => {
        sandbox.restore(); // Restore original functionality after each test
    });

    /**
     * Tests for FRT-M7-2
     */
    describe( 'FRT-M7-2: Test authenticateRequest()', () => {

        /**
         * FRT-M7-2a
         * Initial State: public key is held in server
         * Input: valid JWT token that is no expired
         * Output: user_id embedded in the JWT token
         * Derivation: server should be able to extract the user_id of the user from the JWT token provided in
         *  the request
         */
        it('FRT-M7-2a: should respond with user_id from valid JWT token', async () => {
            req = { headers: { auth: "mockValidToken" } };

            verifyStub.withArgs("mockValidToken", sandbox.match.any, sandbox.match({ algorithm: ['RS256'] })).returns({username:123});

            const result = await Auth.authenticateRequest(req, res);

            expect(verifyStub.calledOnce).to.be.true;
            expect(result === 123).to.be.true;
        });

        /**
         * FRT-M7-2b
         * Initial State: public key is held in server
         * Input: JWT token that is not valid
         * Output: 401 Unauthorized
         * Derivation: server should be not able to extract the user_id of the user from an invalid JWT token
         */
        it('FRT-M7-2b: should respond with -1 from invalid JWT token', async () => {
            req = { headers: { auth: "mockInvalidToken" } };

            const result = await Auth.authenticateRequest(req, res);

            expect(verifyStub.calledOnce).to.be.true;
            expect(result === -1).to.be.true;
            expect(res.status.calledWith(401)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Unauthorized/))).to.be.true;
        });

        /**
         * FRT-M7-2c
         * Initial State: public key is held in server
         * Input: n/a
         * Output: 401 Unauthorized
         * Derivation: server should be not able to extract the user_id if there is no JWT token
         */
        it('FRT-M7-2c: should respond with -1 from no JWT token', async () => {
            req = { headers: {} };

            const result = await Auth.authenticateRequest(req, res);

            expect(verifyStub.calledOnce).to.be.false;
            expect(result === -1).to.be.true;
            expect(res.status.calledWith(401)).to.be.true;
            expect(send.calledWith(sandbox.match(/^No auth token provided/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M7-3
     */
    describe( 'FRT-M7-3: Test signToken()', () => {

        /**
         * FRT-M7-3a
         * Initial State: private key is held in server
         * Input: user_id of user requesting token
         * Output: valid JWT token with embedded user_id
         * Derivation: server should be able to sign a JWT token with a given user_id
         */
        it('FRT-M7-3a: should respond with JWT token from user_id', async () => {
            signStub.returns("validJWTToken");

            const result = await Auth.signToken(123);

            expect(signStub.calledOnce).to.be.true;
            expect(result === "validJWTToken").to.be.true;
        });

    });
});
