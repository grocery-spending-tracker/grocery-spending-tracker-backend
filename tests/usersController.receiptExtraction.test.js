import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../src/db.js'; // Ensure this path matches the location of your actual db.js
import Auth from '../src/util/authentication.js';
import Classification from "../src/grocery-spending-tracker-classification/src/main.js";

import sandbox from "sinon";
import * as usersController from "../src/controllers/usersController.js";
import {updateUser} from "../src/controllers/usersController.js";

use(chaiHttp);

/**
 * Tests for FRT-M3
 */
describe('FRT-M3: Test usersController receipt extraction module (with mocked db calls)', () => {
    let req, res, statusCode, send, json, poolStub, authenticateRequestStub, processItemStub;

    beforeEach(() => {
        statusCode = 200;
        send = sandbox.spy();
        json = sandbox.spy();
        res = { send, status: sandbox.stub().returns({ json, send }), json };

        const classifyItemResp = [{
            price: 100.00,
            list_price: 50.00,
            brand: "testbrand",
            name: "testname",
            product_number: "testnumber",
            image_url:"testurl"
        }];

        poolStub = sandbox.stub(pool, 'query');
        processItemStub = sandbox.stub(Classification, 'processItem').resolves(classifyItemResp);
        authenticateRequestStub = sandbox.stub(Auth, 'authenticateRequest').resolves(123);
    });

    afterEach(() => {
        sandbox.restore();
    });

    /**
     * Tests for FRT-M3-1
     */
    describe( 'FRT-M3-1: Test addTrip()', () => {

        /**
         * FRT-M3-1a
         * Initial State: no trips set to user
         * Input: a json trip in body and JWT token in header
         * Output: the trip_id for the created trip; items are processed into classified items
         * Derivation: user should be able to set a trip and add it and all its items to the db
         */
        it('FRT-M3-1a: should respond with a the trip_id for the created trip', async () => {
            req = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{
                    "date_time": "2024-01-09 10:28:57",
                    "location": "FORTINOS (1579 Main Street West)",
                    "items": [
                        {
                            "item_key": "06038318916",
                            "item_desc": "PC ITAL SAUS",
                            "price": 4.29,
                            "taxed": false
                        },
                        {
                            "item_key": "08390000636",
                            "item_desc": "NESTEA ICED TEA",
                            "price": 3.79,
                            "taxed": false
                        },
                        {
                            "item_key": "06905212968",
                            "item_desc": "PBRY PPOP PEPPRN",
                            "price": 7.99,
                            "taxed": false
                        },
                        {
                            "item_key": "06038318640",
                            "item_desc": "PCO CREMINI 227",
                            "price": 1.99,
                            "taxed": false
                        }
                    ],
                    "subtotal": 22.73,
                    "total": 22.73,
                    "trip_desc": ""
                }
            };

            const mockUserDataResponseTrip = {trip_id: 47};
            const mockUserDataResponseItem = {item_id: 47};
            const mockUserDataResponseIClass = {classified_item_id: 47};

            const queryTrips = 'INSERT INTO trips (user_id, date_time, location, subtotal, total, trip_desc) VALUES ($1, $2, $3, $4, $5, $6) RETURNING trip_id';
            const item_query = 'INSERT INTO items (trip_id, item_desc, item_key, price, taxed) VALUES ($1, $2, $3, $4, $5) RETURNING item_id';
            const class_query = 'INSERT INTO classifiedItems (trip_id, item_key, item_desc, price, listed_price, item_brand, item_name, item_product_number, image_url, taxed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING classified_item_id';

            poolStub.withArgs(queryTrips, sandbox.match.any).resolves({rows: [mockUserDataResponseTrip]});
            poolStub.withArgs(item_query, sandbox.match.any).resolves({rows: [mockUserDataResponseItem]});
            poolStub.withArgs(class_query, sandbox.match.any).resolves({rows: [mockUserDataResponseIClass]});

            await usersController.addTrip(req, res);

            // expect(poolStub.calledOnce).to.be.true;
            // expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;



            const wantedCalls = poolStub.getCalls().filter(
                (call) => call.args.length === 2
            );

            expect(wantedCalls.length === 9).to.be.true;
        });
    //
    //     /**
    //      * FRT-M5-1b
    //      * Initial State: N/A
    //      * Input: N/A
    //      * Output: 500 Database Error
    //      * Derivation: N/A
    //      */
    //     it('FRT-M5-1b: should handle server errors gracefully', async () => {
    //         const error = new Error('Mock error for test');
    //         const mockUserData = {
    //             params:{ userId:123 },
    //             headers:{ auth:"mockToken" },
    //             body:{}
    //         };
    //
    //         poolStub.rejects(error); // Simulate an error during database query
    //         req = mockUserData;
    //
    //         await usersController.setGoal(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(res.status.calledWith(500)).to.be.true;
    //         expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
    //     });
    // });
    //
    // /**
    //  * Tests for FRT-M5-2
    //  */
    // describe( 'FRT-M5-2: Test getGoals()', () => {
    //
    //     /**
    //      * FRT-M5-2a
    //      * Initial State: goals mapped to user
    //      * Input: JWT token in header
    //      * Output: a list of all the users goals
    //      * Derivation: user should be able to get all of their goals
    //      */
    //     it('FRT-M5-2a: should respond with a list of the goals mapped to a user', async () => {
    //         req = {
    //             params:{ userId:123 },
    //             headers:{ auth:"mockToken" },
    //             body:{}
    //         };
    //         const mockUserDataResponse = [
    //             {
    //                 "goal_id": 7,
    //                 "user_id": 11,
    //                 "start_date": "2023-01-21T05:00:00.000Z",
    //                 "end_date": "2024-01-21T05:00:00.000Z",
    //                 "budget": "1099.00",
    //                 "category": null,
    //                 "goal_name": "Goal",
    //                 "goal_desc": "no description",
    //                 "periodic": false
    //             },
    //             {
    //                 "goal_id": 10,
    //                 "user_id": 11,
    //                 "start_date": "2023-01-21T05:00:00.000Z",
    //                 "end_date": "2024-01-21T05:00:00.000Z",
    //                 "budget": "1099.00",
    //                 "category": null,
    //                 "goal_name": "gasoiol",
    //                 "goal_desc": "destudbiuwdybclewuic",
    //                 "periodic": true
    //             },
    //             {
    //                 "goal_id": 11,
    //                 "user_id": 11,
    //                 "start_date": "2023-01-21T05:00:00.000Z",
    //                 "end_date": "2024-01-21T05:00:00.000Z",
    //                 "budget": "1099.00",
    //                 "category": null,
    //                 "goal_name": "gasoiol",
    //                 "goal_desc": "destudbiuwdybclewuic",
    //                 "periodic": true
    //             }
    //         ];
    //         const mockDbResponse = {
    //             rows: mockUserDataResponse
    //         };
    //
    //         poolStub.resolves(mockDbResponse);
    //
    //         await usersController.getGoals(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
    //         expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
    //     });
    //
    //     /**
    //      * FRT-M5-2b
    //      * Initial State: N/A
    //      * Input: N/A
    //      * Output: 500 Database Error
    //      * Derivation: N/A
    //      */
    //     it('FRT-M5-2b: should handle server errors gracefully', async () => {
    //         const error = new Error('Mock error for test');
    //         const mockUserData = {
    //             params:{ userId:123 },
    //             headers:{ auth:"mockToken" },
    //             body:{}
    //         };
    //
    //         poolStub.rejects(error); // Simulate an error during database query
    //         req = mockUserData;
    //
    //         await usersController.getGoals(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(res.status.calledWith(500)).to.be.true;
    //         expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
    //     });
    // });
    //
    // /**
    //  * Tests for FRT-M5-3
    //  */
    // describe( 'FRT-M5-3: Test deleteGoal()', () => {
    //
    //     /**
    //      * FRT-M5-3a
    //      * Initial State: goals are mapped to user
    //      * Input: a goal_id to be deleted in the request params
    //      * Output: the body of the goal that was deleted
    //      * Derivation: user should be able to delete a goal of theirs
    //      */
    //     it('FRT-M5-1a: should respond with a the goal_id for the created goal', async () => {
    //         req = {
    //             params:{ userId:123, goal_id:1 },
    //             headers:{ auth:"mockToken" },
    //             body:{}
    //         };
    //         const mockUserDataResponse = {
    //             goal_id: 11,
    //             user_id: 11,
    //             start_date: "2023-01-21T05:00:00.000Z",
    //             end_date: "2024-01-21T05:00:00.000Z",
    //             budget: "1099.00",
    //             category: null,
    //             goal_name: "testgoal",
    //             goal_desc: "deleted goal :(",
    //             periodic: true
    //         };
    //         const mockDbResponse = {
    //             rows: [mockUserDataResponse]
    //         };
    //
    //         poolStub.resolves(mockDbResponse);
    //
    //         await usersController.deleteGoal(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
    //         expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
    //     });
    //
    //     /**
    //      * FRT-M5-1b
    //      * Initial State: N/A
    //      * Input: N/A
    //      * Output: 500 Database Error
    //      * Derivation: N/A
    //      */
    //     it('FRT-M5-1b: should handle server errors gracefully', async () => {
    //         const error = new Error('Mock error for test');
    //         const mockUserData = {
    //             params:{ userId:123 },
    //             headers:{ auth:"mockToken" },
    //             body:{}
    //         };
    //
    //         poolStub.rejects(error); // Simulate an error during database query
    //         req = mockUserData;
    //
    //         await usersController.setGoal(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(res.status.calledWith(500)).to.be.true;
    //         expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
    //     });
    });

});
