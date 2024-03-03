import {expect, use} from 'chai';
import chaiHttp from 'chai-http';
import pool from '../src/db.js'; // Ensure this path matches the location of your actual db.js
import Auth from '../src/util/authentication.js';
import sandbox from "sinon";
import * as usersController from "../src/controllers/usersController.js";
import {updateUser} from "../src/controllers/usersController.js";

use(chaiHttp);

describe('Test usersController (with mocked db calls)', () => {
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

    // describe( 'Test setGoal()', () => {
    //
    //     it('should respond with a list of goals for valid userData', async () => {
    //         req = {
    //             params:{ userId:123 },
    //             headers:{ auth:"mockToken" },
    //             body:{}
    //         };
    //         const mockUserDataResponse = [
    //             {
    //
    //             },
    //         ];
    //         const mockDbResponse = {
    //             rows: [mockUserDataResponse]
    //         };
    //
    //         poolStub.resolves(mockDbResponse);
    //
    //         await usersController.updateUser(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(authenticateRequestStub.calledWith(req, res)).to.be.true;
    //         expect(json.calledWith(sandbox.match(mockUserDataResponse))).to.be.true;
    //     });
    //
    //     it('should handle server errors gracefully', async () => {
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
    //         await usersController.updateUser(req, res);
    //
    //         expect(poolStub.calledOnce).to.be.true;
    //         expect(res.status.calledWith(500)).to.be.true;
    //         expect(send.calledWith(sandbox.match(/^Database Error/))).to.be.true;
    //     });
    // });

});
