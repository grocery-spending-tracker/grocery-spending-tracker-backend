import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../src/db.js'; // Ensure this path matches the location of your actual db.js
import Auth from '../src/util/authentication.js';
import sandbox from "sinon";
import * as usersController from "../src/controllers/usersController.js";
import * as authController from "../src/controllers/authController.js";

use(chaiHttp);

describe('Test /users/ controller', () => {
    let req, res, statusCode, send, json, poolStub, authenticateRequestStub;

    beforeEach(() => {
        statusCode = 200; // Default status code for successful responses
        send = sandbox.spy();
        json = sandbox.spy();
        res = { send, status: sandbox.stub().returns({ json, send }), json };

        // Replace your actual implementations with stubs
        poolStub = sandbox.stub(pool, 'query');
        authenticateRequestStub = sandbox.stub(Auth, 'authenticateRequest').resolves(123);
    });

    afterEach(() => {
        sandbox.restore(); // Restore original functionality after each test
    });

    describe( 'Test createNewUser()', () => {

        it('should respond with user_id for valid userData body', async () => {
            const mockUserData = {
                first_name:"Jim",
                last_name:"Chung",
                email:"test@example.com",
                password:"password"
            };
            const mockDbResponse = {
                rows: [{users:123}]
            };

            poolStub.resolves(mockDbResponse);
            req = { body: mockUserData };

            await usersController.createNewUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            // expect(authenticateRequestStub.calledWith("123")).to.be.true;
            expect(json.calledWith(sandbox.match({ users: 123 }))).to.be.true;
        });

        it('should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                first_name:"Jim",
                last_name:"Chung",
                email:"test@example.com",
                password:"password"
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = { body: mockUserData };

            await authController.login(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith('Server error')).to.be.true;
        });
    });
});
