import pool from '../db.js';
import Auth from '../util/authentication.js';

/**
 * Take body containing email and password and returns JWT token
 * @param req http_req
 * @param res http_res
 * @returns {Promise<string>} jwt token
 */
const login = async (req, res) => {
    try {
        const userData = req.body;

        console.log("received get request for token on user: " + userData.email);

        const query = "SELECT user_id, email FROM users WHERE email = $1 AND password = $2";
        const values = [userData.email, userData.password];

        const result = await pool.query(query, values); // Modified to use async/await

        if (result.rows.length === 0) { // Check if the user was found
            res.status(500).send('Incorrect credentials for user: ' + userData.email);
            return;
        }

        console.log(result.rows[0]["user_id"]);
        const user_id = result.rows[0]["user_id"];
        const email = result.rows[0]["email"];

        let token = await Auth.signToken(user_id);

        res.status(200).json({ user_id, email, token });
    } catch (e) {
        console.error(e);
        res.status(500).send('Server error');
    }
};

export {
    login
};
