import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../../src/db.js';
import Auth from '../../src/util/authentication.js';

import sandbox from "sinon";
import * as recommendationController from "../../src/controllers/recommendationController.js";

use(chaiHttp);

const fqItemsQuery = `
            SELECT 
                ci.item_key,
                MIN(ci.item_name) AS item_name, -- Assuming item_name doesn't vary for the same item_key, or it's acceptable to select any.
                MIN(ci.price) AS price, -- Selects the minimum price for each unique item_key.
                MIN(ci.image_url) AS image_url, -- Assuming one image_url per item_key, or it's acceptable to select any.
                MIN(t.location) AS location, -- Arbitrarily selects a location; adjust as needed.
                MAX(t.date_time) AS date_time, -- Selects the latest date_time for each item_key.
                COUNT(*) AS frequency
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id
            WHERE t.user_id = $1
            GROUP BY ci.item_key
            ORDER BY frequency DESC, MIN(ci.price) ASC
            LIMIT 10;
        `;

const popularQuery = `
            SELECT ci.item_key, ci.item_name, ci.image_url, t.location, t.date_time, count(*) AS frequency
            FROM classifiedItems ci
            JOIN trips t ON ci.trip_id = t.trip_id 
            GROUP BY ci.item_key, ci.item_name, ci.price, ci.image_url, t.location, t.date_time
            ORDER BY frequency DESC, ci.price ASC
            LIMIT 10;
        `;

const lowestPriceQuery = `
            WITH lowest_prices AS (
                SELECT item_key, MIN(price) AS lowest_price
                FROM classifiedItems
                GROUP BY item_key
            )
            SELECT DISTINCT fi.item_key, fi.item_name, fi.price, fi.image_url, t.location, t.date_time, lp.lowest_price, count(*) AS frequency
            FROM (
                SELECT classifiedItems.*, ROW_NUMBER() OVER (PARTITION BY classifiedItems.item_key ORDER BY classifiedItems.price DESC) AS row_num
                FROM classifiedItems
                JOIN trips t ON classifiedItems.trip_id = t.trip_id
                WHERE t.user_id = $1
            ) AS fi
            JOIN lowest_prices lp ON fi.item_key = lp.item_key
            JOIN trips t ON fi.trip_id = t.trip_id
            WHERE fi.row_num = 1 AND fi.price > lp.lowest_price
            GROUP BY fi.item_key, fi.item_name, fi.price, fi.image_url, t.location, t.date_time, lp.lowest_price
            ORDER BY frequency DESC, lp.lowest_price ASC
            LIMIT 10;
        `;

/**
 * Tests for FRT-M8
 */
describe('FRT-M8: Test recommendationController recommendation module (with mocked db calls)', () => {
    let req, res, statusCode, send, json, poolStub, authenticateRequestStub, processItemStub;

    beforeEach(() => {
        statusCode = 200;
        send = sandbox.spy();
        json = sandbox.spy();
        res = {send, status: sandbox.stub().returns({json, send}), json};

        const classifyItemResp = [{
            price: 100.00,
            list_price: 50.00,
            brand: "testbrand",
            name: "testname",
            product_number: "testnumber",
            image_url: "testurl"
        }];

        poolStub = sandbox.stub(pool, 'query');
        authenticateRequestStub = sandbox.stub(Auth, 'authenticateRequest').resolves(123);
    });

    afterEach(() => {
        sandbox.restore();
    });

    /**
     * Tests for FRT-M8-1
     */
    describe('FRT-M8-1: Test getRecommendations()', () => {

        /**
         * FRT-M8-1a
         * Initial State: existing trips set to user
         * Input: JWT token in header
         * Output: a list of most frequently purchased items by calling user
         * Derivation: user should be able to request a list of their frequently bought items
         */
        it('FRT-M8-1a: should respond with a list of the user\'s frequently bought items', async () => {
            req = {
                params: {userId: 123},
                headers: {auth: "mockToken"},
                body: {}
            };

            const mockFqItemsResponse = [
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01.png",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "frequency": "12"
                },
                {
                    "item_key": "2003040",
                    "item_name": "Lean Ground Beef",
                    "image_url": "https://assets.shop.loblaws.ca/products/20797930/b1/en/front/20797930_front_a01.png",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "frequency": "6"
                },
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01_@2.png",
                    "location": "FORTINOS (1579 Main Street West)",
                    "date_time": "2024-01-09T15:28:57.000Z",
                    "frequency": "5"
                },
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms dummy",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01_@2.png",
                    "location": "FORTINOS (1579 Main Street West)",
                    "date_time": "2024-01-09T15:28:57.000Z",
                    "frequency": "1"
                }
            ];

            poolStub.withArgs(fqItemsQuery, sandbox.match.any).resolves({rows: mockFqItemsResponse});

            await recommendationController.getRecommendations(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockFqItemsResponse.slice(0, 3)))).to.be.true;
        });

        /**
         * FRT-M8-1b
         * Initial State: no trips set to user
         * Input: JWT token in header
         * Output: a list of most frequently purchased items by every user
         * Derivation: user with no trips in the db should receive a list of items most frequently bought by all users
         */
        it('FRT-M8-1b: should respond with a list of most frequently purchased items by every user', async () => {
            req = {
                params: {userId: 123},
                headers: {auth: "mockToken"},
                body: {}
            };

            const mockPopularItemsResponse = [
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01.png",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "frequency": "12"
                },
                {
                    "item_key": "2003040",
                    "item_name": "Lean Ground Beef",
                    "image_url": "https://assets.shop.loblaws.ca/products/20797930/b1/en/front/20797930_front_a01.png",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "frequency": "6"
                },
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01_@2.png",
                    "location": "FORTINOS (1579 Main Street West)",
                    "date_time": "2024-01-09T15:28:57.000Z",
                    "frequency": "5"
                },
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms dummy",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01_@2.png",
                    "location": "FORTINOS (1579 Main Street West)",
                    "date_time": "2024-01-09T15:28:57.000Z",
                    "frequency": "1"
                }
            ];

            poolStub.withArgs(fqItemsQuery, sandbox.match.any).resolves({rows: []});
            poolStub.withArgs(popularQuery).resolves({rows: mockPopularItemsResponse});

            await recommendationController.getRecommendations(req, res);

            const wantedCalls = poolStub.getCalls();

            expect(wantedCalls.length === 2).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockPopularItemsResponse.slice(0, 3)))).to.be.true;
        });
    });

    /**
     * Tests for FRT-M8-2
     */
    describe('FRT-M8-2: Test getRecommendationsLowestAvailable()', () => {

        /**
         * FRT-M8-2a
         * Initial State: existing trips set to user
         * Input: JWT token in header
         * Output: a list of frequently purchased items by calling user that have lower prices elsewhere
         * Derivation: user should be able to request a list of items that have better prices they what they
         *  bought for
         */
        it('FRT-M8-1a: should respond with a list of the users frequently bought items', async () => {
            req = {
                params: {userId: 123},
                headers: {auth: "mockToken"},
                body: {}
            };

            const mockFqItemsResponse = [
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01.png",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "frequency": "12"
                },
                {
                    "item_key": "2003040",
                    "item_name": "Lean Ground Beef",
                    "image_url": "https://assets.shop.loblaws.ca/products/20797930/b1/en/front/20797930_front_a01.png",
                    "location": "1579 Main St W, Hamilton, ON L8S 1E6",
                    "date_time": "2024-01-01T19:30:00.000Z",
                    "frequency": "6"
                },
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01_@2.png",
                    "location": "FORTINOS (1579 Main Street West)",
                    "date_time": "2024-01-09T15:28:57.000Z",
                    "frequency": "5"
                },
                {
                    "item_key": "06038318640",
                    "item_name": "Organics Whole Cremini Mushrooms dummy",
                    "image_url": "https://assets.shop.loblaws.ca/products/21021565/b1/en/front/21021565_front_a01_@2.png",
                    "location": "FORTINOS (1579 Main Street West)",
                    "date_time": "2024-01-09T15:28:57.000Z",
                    "frequency": "1"
                }
            ];

            poolStub.withArgs(lowestPriceQuery, sandbox.match.any).resolves({rows: mockFqItemsResponse});

            await recommendationController.getRecommendationsLowestAvailable(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match(mockFqItemsResponse.slice(0, 3)))).to.be.true;
        });

        /**
         * FRT-M8-2b
         * Initial State: no trips set to user
         * Input: JWT token in header
         * Output: an empty list
         * Derivation: user with no trips in the db should not have any frequently bought items
         */
        it('FRT-M8-2b: should respond with an empty list', async () => {
            req = {
                params: {userId: 123},
                headers: {auth: "mockToken"},
                body: {}
            };

            poolStub.withArgs(lowestPriceQuery, sandbox.match.any).resolves({rows: []});

            await recommendationController.getRecommendationsLowestAvailable(req, res);

            expect(poolStub.calledOnce).to.be.true;
            expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
            expect(json.calledWith(sandbox.match([]))).to.be.true;
        });

    });

});