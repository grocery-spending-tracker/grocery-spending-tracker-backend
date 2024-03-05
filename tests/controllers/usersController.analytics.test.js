import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../../src/db.js';
import Auth from '../../src/util/authentication.js';
import sandbox from "sinon";
import * as usersController from "../../src/controllers/usersController.js";

use(chaiHttp);

/**
 * Tests for FRT-M5
 */
describe('FRT-M5: Test usersController analytics module (with mocked db calls)', () => {
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
     * Tests for FRT-M5-6
     */
    describe( 'FRT-M5-6: Test setGoal()', () => {

        /**
         * FRT-M5-6a
         * Initial State: no goals mapped to user
         * Input: a json goal in body and JWT token in header
         * Output: the goal_id for the created goal
         * Derivation: user should be able to set a goal and add it to the db
         */
        it('FRT-M5-6a: should respond with a the goal_id for the created goal', async () => {
            req = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{
                    start_date: "2023-01-21",
                    end_date: "2024-01-21",
                    budget: 1099.00,
                    goal_name: "testgoal",
                    periodic:true,
                    goal_desc:"testing goals"
                }
            };
            const mockUserDataResponse = {goal_id: 11};
            const mockDbResponse = {
                rows: [mockUserDataResponse]
            };

            poolStub.resolves(mockDbResponse);

            await usersController.setGoal(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
        });

        /**
         * FRT-M5-6b
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M5-6b: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = mockUserData;

            await usersController.setGoal(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M5-7
     */
    describe( 'FRT-M5-7: Test getGoals()', () => {

        /**
         * FRT-M5-7a
         * Initial State: goals mapped to user
         * Input: JWT token in header
         * Output: a list of all the users goals
         * Derivation: user should be able to get all of their goals
         */
        it('FRT-M5-7a: should respond with a list of the goals mapped to a user', async () => {
            req = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };
            const mockUserDataResponse = [
                {
                    "goal_id": 7,
                    "user_id": 11,
                    "start_date": "2023-01-21T05:00:00.000Z",
                    "end_date": "2024-01-21T05:00:00.000Z",
                    "budget": "1099.00",
                    "category": null,
                    "goal_name": "Goal",
                    "goal_desc": "no description",
                    "periodic": false
                },
                {
                    "goal_id": 10,
                    "user_id": 11,
                    "start_date": "2023-01-21T05:00:00.000Z",
                    "end_date": "2024-01-21T05:00:00.000Z",
                    "budget": "1099.00",
                    "category": null,
                    "goal_name": "gasoiol",
                    "goal_desc": "destudbiuwdybclewuic",
                    "periodic": true
                },
                {
                    "goal_id": 11,
                    "user_id": 11,
                    "start_date": "2023-01-21T05:00:00.000Z",
                    "end_date": "2024-01-21T05:00:00.000Z",
                    "budget": "1099.00",
                    "category": null,
                    "goal_name": "gasoiol",
                    "goal_desc": "destudbiuwdybclewuic",
                    "periodic": true
                }
            ];
            const mockDbResponse = {
                rows: mockUserDataResponse
            };

            poolStub.resolves(mockDbResponse);

            await usersController.getGoals(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
        });

        /**
         * FRT-M5-7b
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M5-7b: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = mockUserData;

            await usersController.getGoals(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M5-8
     */
    describe( 'FRT-M5-8: Test deleteGoal()', () => {

        /**
         * FRT-M5-8a
         * Initial State: goals are mapped to user
         * Input: a goal_id to be deleted in the request params
         * Output: the body of the goal that was deleted
         * Derivation: user should be able to delete a goal of theirs
         */
        it('FRT-M5-8a: should respond with a the goal_id for the created goal', async () => {
            req = {
                params:{ userId:123, goal_id:1 },
                headers:{ auth:"mockToken" },
                body:{}
            };
            const mockUserDataResponse = {
                goal_id: 11,
                user_id: 11,
                start_date: "2023-01-21T05:00:00.000Z",
                end_date: "2024-01-21T05:00:00.000Z",
                budget: "1099.00",
                category: null,
                goal_name: "testgoal",
                goal_desc: "deleted goal :(",
                periodic: true
            };
            const mockDbResponse = {
                rows: [mockUserDataResponse]
            };

            poolStub.resolves(mockDbResponse);

            await usersController.deleteGoal(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
        });

        /**
         * FRT-M5-8b
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M5-8b: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };

            poolStub.rejects(error);
            req = mockUserData;

            await usersController.setGoal(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

});
