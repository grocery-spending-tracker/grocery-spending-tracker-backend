import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../src/db.js'; // Ensure this path matches the location of your actual db.js
import Auth from '../src/util/authentication.js';
import sandbox from "sinon";

import * as authController from "../src/controllers/recommendationController.js"; // Ensure this path matches your actual signToken function

use(chaiHttp);

describe('Test /auth/ controller', () => {

    describe( 'Test login()', () => {

        let req, res, statusCode, send, json, poolStub, signTokenStub;

        beforeEach(() => {
            statusCode = 200; // Default status code for successful responses
            send = sandbox.spy();
            json = sandbox.spy();
            res = { send, status: sandbox.stub().returns({ json, send }), json };

            // Replace your actual implementations with stubs
            poolStub = sandbox.stub(pool, 'query');
            signTokenStub = sandbox.stub(Auth, 'signToken').resolves('mockToken');
        });

        afterEach(() => {
            sandbox.restore(); // Restore original functionality after each test
        });

        it('should respond with user data and a token for valid credentials', async () => {
            const mockUserData = { email: 'test@example.com', password: 'password' };
            const mockDbResponse = {
                rows: [{ user_id: '123', email: 'test@example.com' }]
            };

            // Setup stub to mimic database response
            poolStub.resolves(mockDbResponse);
            req = { body: mockUserData };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(signTokenStub.calledWith("123")).to.be.true;
            expect(json.calledWith(sandbox.match({ user_id: '123', email: 'test@example.com', token: 'mockToken' }))).to.be.true;
        });

        it('should respond with 500 and an error message for invalid credentials', async () => {
            const mockUserData = { email: 'wrong@example.com', password: 'password' };
            const mockDbResponse = { rows: [] }; // No user found

            poolStub.resolves(mockDbResponse);
            req = { body: mockUserData };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith('Incorrect credentials for user: wrong@example.com')).to.be.true;
        });

        it('should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');

            poolStub.rejects(error); // Simulate an error during database query
            req = { body: { email: 'test@example.com', password: 'password' } };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith('Server error')).to.be.true;
        });

    });
});
