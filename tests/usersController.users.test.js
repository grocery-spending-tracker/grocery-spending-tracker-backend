import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../src/db.js'; // Ensure this path matches the location of your actual db.js
import Auth from '../src/util/authentication.js';
import sandbox from "sinon";
import * as usersController from "../src/controllers/usersController.js";

use(chaiHttp);

/**
 * Tests for FRT-M6
 */
describe('FRT-M6: Test usersController users module (with mocked db calls)', () => {
    let req, res, statusCode, send, json, poolStub, authenticateRequestStub;

    beforeEach(() => {
        statusCode = 200;
        send = sandbox.spy();
        json = sandbox.spy();
        res = { send, status: sandbox.stub().returns({ json, send }), json };

        poolStub = sandbox.stub(pool, 'query');
        authenticateRequestStub = sandbox.stub(Auth, 'authenticateRequest').resolves(123);
    });

    afterEach(() => {
        sandbox.restore();
    });

    /**
     * Tests for FRT-M6-1
     */
    describe( 'FRT-M6-1: Test createNewUser()', () => {

        /**
         * FRT-M6-1a
         * Initial State: no user created
         * Input: a valid user body
         * Output: user_id of the created user
         * Derivation: a user wants to create an account for the first time
         */
        it('FRT-M6-1a: should respond with user_id for valid userData body', async () => {
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
            expect(json.calledWith(sandbox.match({ users: 123 }))).to.be.true;
        });

        /**
         * FRT-M6-1b
         * Initial State: no user created
         * Input: a user body that throws a db error
         * Output: 500 Database Error
         * Derivation: a user should not be able to create an account with invalid information.
         */
        it('FRT-M6-1b: should handle server errors gracefully', async () => {
            const error = new Error('Mock');
            const mockUserData = {
                first_name:"Jim",
                last_name:"Chung",
                email:"test@example.com",
                password:"password"
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = { body: mockUserData };

            await usersController.createNewUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M6-2
     * todo: make test for invalid auth
     */
    describe( 'FRT-M6-2: Test getUser()', () => {

        /**
         * FRT-M6-2a
         * Initial State: calling user exists in db
         * Input: request to function with valid JWT token in header
         * Output: valid user body json corresponding to user_id embedded in JWT
         * Derivation: a user should be able to get their account information from the db
         */
        it('FRT-M6-2a: should respond with userData for valid user_id', async () => {
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" }
            };
            const mockUserDataResponse = {
                first_name:"Jim",
                last_name:"Chung",
                email:"test@example.com",
                password:"password"
            };
            const mockDbResponse = {
                rows: [mockUserDataResponse]
            };

            poolStub.resolves(mockDbResponse);
            req = mockUserData;

            await usersController.getUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
        });

        /**
         * FRT-M6-2b
         * Initial State: calling user does not exist in db
         * Input: request to function with JWT token in header
         * Output: 404 No user found
         * Derivation: client should be notified if the account does not exist
         */
        it('FRT-M6-2b: should respond with error 404 when no user exists', async () => {
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" }
            };
            const mockDbResponse = {
                rows: []
            };

            poolStub.resolves(mockDbResponse);
            req = mockUserData;

            await usersController.getUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(send.calledWith(sandbox.match(/^No user found with userId:/))).to.be.true;
        });

        /**
         * FRT-M6-2c
         * Initial State: N/A
         * Input: a user body that throws a db error
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M6-2c: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" }
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = mockUserData;

            await usersController.getUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M6-3
     */
    describe( 'FRT-M6-3: Test updateUser()', () => {

        /**
         * FRT-M6-3a
         * Initial State: calling user exists in db
         * Input: request body with user body that includes fields to update and JWT token in header
         * Output: valid user body json corresponding to JWT with updated user fields
         * Derivation: a user should be able to update their account information on the db
         */
        it('FRT-M6-3a: should respond with userData for valid updated userData', async () => {
            req = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{
                    "home_base": {
                        "longitude": 47.712888,
                        "latitude": -75.006000
                    }
                }
            };
            const mockUserDataResponse = {
                first_name:"Jim",
                last_name:"Chung",
                email:"test@example.com",
                password:"password",
            };
            const mockDbResponse = {
                rows: [mockUserDataResponse]
            };

            poolStub.resolves(mockDbResponse);

            await usersController.updateUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
        });

        /**
         * FRT-M6-3b
         * Initial State: N/A
         * Input: a user body that throws a db error
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M6-3b: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = mockUserData;

            await usersController.updateUser(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M6-4
     */
    describe( 'FRT-M6-4: Test deleteUser()', () => {

        /**
         * FRT-M6-4a
         * Initial State: calling user exists in db
         * Input: JWT token in header
         * Output: valid user body json corresponding to user_id in JWT
         * Derivation: a user should be able to delete their account information on the db
         */
        it('FRT-M6-4a: should respond with userData for valid deleted userId', async () => {
            req = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" }
            };
            const mockUserDataResponse = {
                first_name:"Jim",
                last_name:"Chung",
                email:"test@example.com",
                password:"password",
            };
            const mockDbResponse = {
                rows: [mockUserDataResponse]
            };

            poolStub.resolves(mockDbResponse);

            await usersController.deleteUserById(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
        });

        /**
         * FRT-M6-4b
         * Initial State: calling user does not exist in db
         * Input: JWT token in header
         * Output: 404 No user found
         * Derivation: cannot delete a user that does nto exist
         */
        it('FRT-M6-4b: should respond with error 404 when no user exists', async () => {
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" }
            };
            const mockDbResponse = {
                rows: []
            };

            poolStub.resolves(mockDbResponse);
            req = mockUserData;

            await usersController.deleteUserById(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^No user found with userId:/))).to.be.true;
        });

        /**
         * FRT-M6-4c
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M6-4c: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = mockUserData;

            await usersController.deleteUserById(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });
});
