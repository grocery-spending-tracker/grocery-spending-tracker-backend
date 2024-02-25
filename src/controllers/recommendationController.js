import pool from '../db.js';
import Auth from "../util/authentication.js";


const getRecommendations = async (req, res) => {
    try {
        const callingUser = await Auth.authenticateRequest(req, res);
        if (callingUser < 0) return;

        console.log("received request for get recommendation from ", callingUser);

        // call singleRecommendation

        console.log("not implemented yet :(");
        res.status(200).json({"message":"not implemented yet :("});

        // let recommendation = {};
        //
        // console.log('Query result:', recommendation);
        // res.status(200).json(recommendation);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).send('Database Error ' + err);
    }
};

export {
    getRecommendations
};