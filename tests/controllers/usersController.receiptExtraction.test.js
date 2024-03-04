import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../../src/db.js';
import Auth from '../../src/util/authentication.js';
import Classification from "grocery-spending-tracker-classification/src/main.js";

import sandbox from "sinon";
import * as usersController from "../../src/controllers/usersController.js";

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
     * Tests for FRT-M3-25
     */
    describe( 'FRT-M3-25: Test addTrip()', () => {

        /**
         * FRT-M3-1a
         * Initial State: no trips set to user
         * Input: a json trip in body and JWT token in header
         * Output: the trip_id for the created trip; items are processed into classified items
         * Derivation: user should be able to set a trip and add it and all its items to the db
         */
        it('FRT-M3-25a: should respond with a the trip_id for the created trip', async () => {
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

            const wantedCalls = poolStub.getCalls().filter(
                (call) => call.args.length === 2
            );

            expect(wantedCalls.length === 9).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockUserDataResponseTrip))).to.be.true;
        });

        /**
         * FRT-M3-25b
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M3-25b: should handle server errors gracefully', async () => {
            const error = new Error('Mock error for test');
            const mockUserData = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };

            poolStub.rejects(error); // Simulate an error during database query
            req = mockUserData;

            await usersController.addTrip(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M3-26
     */
    describe( 'FRT-M3-26: Test getTrips()', () => {

        /**
         * FRT-M3-26a
         * Initial State: trips mapped to user
         * Input: JWT token in header
         * Output: a list of all the users trips
         * Derivation: user should be able to get all of their previous trips
         */
        it('FRT-M3-26a: should respond with a list of the trips mapped to a user', async () => {
            req = {
                params:{ userId:123 },
                headers:{ auth:"mockToken" },
                body:{}
            };
            const mockEndpointResponse = [
                {
                    "trip_id": 45,
                    "user_id": 11,
                    "date_time": "2022-01-09T15:28:57.000Z",
                    "location": "FORTINOS (1579 Main Street West)",
                    "subtotal": "22.73",
                    "total": "22.73",
                    "trip_desc": "",
                    "items": [
                        {
                            "item_id": 86,
                            "trip_id": 45,
                            "item_desc": "LEAN GRND BEEF",
                            "price": "8.99",
                            "taxed": false,
                            "item_key": "2003040"
                        }
                    ]
                },
                {
                    "trip_id": 8,
                    "user_id": 11,
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "subtotal": "34.77",
                    "total": "39.99",
                    "trip_desc": "baar and lotte run",
                    "items": [
                        {
                            "item_id": 13,
                            "trip_id": 8,
                            "item_desc": "TESvwEVwT",
                            "price": "24.99",
                            "taxed": true,
                            "item_key": null
                        },
                        {
                            "item_id": 14,
                            "trip_id": 8,
                            "item_desc": "TESTwevwE2",
                            "price": "9.78",
                            "taxed": true,
                            "item_key": null
                        }
                    ]
                }
            ];

            const mockTripDataResponse = [
                {
                    "trip_id": 45,
                    "user_id": 11,
                    "date_time": "2022-01-09T15:28:57.000Z",
                    "location": "FORTINOS (1579 Main Street West)",
                    "subtotal": "22.73",
                    "total": "22.73",
                    "trip_desc": "",
                },
                {
                    "trip_id": 8,
                    "user_id": 11,
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "subtotal": "34.77",
                    "total": "39.99",
                    "trip_desc": "baar and lotte run",
                }
            ];

            const itemsFirst = [
                {
                    "item_id": 86,
                    "trip_id": 45,
                    "item_desc": "LEAN GRND BEEF",
                    "price": "8.99",
                    "taxed": false,
                    "item_key": "2003040"
                }
            ];

            const itemsSecond = [
                {
                    "item_id": 13,
                    "trip_id": 8,
                    "item_desc": "TESvwEVwT",
                    "price": "24.99",
                    "taxed": true,
                    "item_key": null
                },
                {
                    "item_id": 14,
                    "trip_id": 8,
                    "item_desc": "TESTwevwE2",
                    "price": "9.78",
                    "taxed": true,
                    "item_key": null
                }
            ];


            const queryTrip = 'SELECT * FROM trips WHERE user_id = $1 ORDER BY date_time, trip_id';
            const itemsQuery = `SELECT * FROM items WHERE trip_id = $1;`;

            poolStub.withArgs(queryTrip, sandbox.match.any).resolves({rows: mockTripDataResponse});
            poolStub.withArgs(itemsQuery, sandbox.match([mockTripDataResponse[0]["trip_id"]])).resolves({rows: itemsFirst});
            poolStub.withArgs(itemsQuery, sandbox.match([mockTripDataResponse[1]["trip_id"]])).resolves({rows: itemsSecond});

            await usersController.getTrips(req, res);

            const wantedCalls = poolStub.getCalls().filter(
                (call) => call.args.length === 2
            );

            expect(wantedCalls.length === 3).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockEndpointResponse))).to.be.true;
        });

        /**
         * FRT-M3-26b
         * Initial State: N/A
         * Input: N/A
         * Output: 500 Database Error
         * Derivation: N/A
         */
        it('FRT-M3-26b: should handle server errors gracefully', async () => {
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
});
