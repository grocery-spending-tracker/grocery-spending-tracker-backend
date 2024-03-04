import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../../src/db.js';
import Auth from '../../src/util/authentication.js';
import sandbox from "sinon";

import * as authController from "../../src/controllers/authController.js";

use(chaiHttp);

/**
 * Tests for FRT-M7
 */
describe('FRT-M7: Test authController Authentication module', () => {

    /**
     * Tests for FRT-M7-1
     */
    describe( 'FRT-M7-1: Test login()', () => {

        let req, res, statusCode, send, json, poolStub, signTokenStub;

        beforeEach(() => {
            statusCode = 200;
            send = sandbox.spy();
            json = sandbox.spy();
            res = { send, status: sandbox.stub().returns({ json, send }), json };

            poolStub = sandbox.stub(pool, 'query');
            signTokenStub = sandbox.stub(Auth, 'signToken').resolves('mockToken');
        });

        afterEach(() => {
            sandbox.restore();
        });

        /**
         * FRT-M7-1a
         * Initial State: calling user exists in db
         * Input: valid user email and password
         * Output: json object with user_id and JWT token
         * Derivation: user should be able to receive a JWT token when logging in with their credentials
         */
        it('FRT-M7-1a: should respond with user data and a token for valid credentials', async () => {
            const mockUserData = { email: 'test@example.com', password: 'password' };
            const mockDbResponse = {
                rows: [{ user_id: '123', email: 'test@example.com' }]
            };

            poolStub.resolves(mockDbResponse);
            req = { body: mockUserData };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(signTokenStub.calledWith("123")).to.be.true;
            expect(json.calledWith(sandbox.match({ user_id: '123', email: 'test@example.com', token: 'mockToken' }))).to.be.true;
        });

        /**
         * FRT-M7-1b
         * Initial State: calling user exists in db
         * Input: invalid user email and password
         * Output: 500 Incorrect credentials
         * Derivation: user should not receive a JWT token when logging in with the wrong credentials
         */
        it('FRT-M7-1b: should respond with 500 and an error message for invalid credentials', async () => {
            const mockUserData = { email: 'wrong@example.com', password: 'password' };
            const mockDbResponse = { rows: [] }; // No user found

            poolStub.resolves(mockDbResponse);
            req = { body: mockUserData };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith('Incorrect credentials for user: wrong@example.com')).to.be.true;
        });

        /**
         * FRT-M7-1c
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M7-1c: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');

            poolStub.rejects(error);
            req = { body: { email: 'test@example.com', password: 'password' } };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith('Server error')).to.be.true;
        });

    });
});
