import jwt from 'jsonwebtoken';
import fs from 'fs';

let JWT_PUBLIC;
let JWT_PRIVATE;

try{
    JWT_PUBLIC = process.env.JWT_PUBLIC ? process.env.JWT_PUBLIC.replace(/\\n/g, '\n') : fs.readFileSync('public_key.pem', 'utf8');
    JWT_PRIVATE = process.env.JWT_PRIVATE ? process.env.JWT_PRIVATE.replace(/\\n/g, '\n') : fs.readFileSync('private_key.pem', 'utf8');
}catch(e){
    console.log("WARNING: no RSA keys found!");
}


const signOptions = {
    expiresIn: '1h', // Token expires in 1 hour
    algorithm: 'RS256' // Use RSASSA-PKCS1-v1_5
};

/**
 * Take user_id and return JWT Token
 * @param number userId
 * @returns {string} token
 */
let signToken = ((userId) => {
    const token = jwt.sign({ username: userId }, JWT_PRIVATE, signOptions); // Expires in 1 hour
    console.log('Signed token:', token);
    return token;
});

/**
 * Take request and return user_id embedded in the Auth Token
 * @param req http_req
 * @param res http_res
 * @returns {number} user_id in token or -1 if token is invalid
 */
let authenticateRequest = ((req, res) => {

    // check if there is a token in the req header, if not return -1
    const authToken = req.headers['auth'];
    if (!authToken) {
        res.status(401).send('No auth token provided');
        return -1;
    }

    // if auth token returns -1 for user_id, send 401 response
    const user_id = validateToken(authToken);
    if(user_id < 0){
        console.log("Request Unauthorized: invalid token");
        res.status(401).send("Unauthorized");
        return -1;
    }

    console.log("Authenticated 🔐 " + user_id);
    return user_id;
});

function validateToken(token){
    
    try {
        const jt = jwt.verify(token, JWT_PUBLIC, { algorithm: ['RS256'] });
        return jt.username;
    } catch (error) {
    console.log("Token Validation Error: " + error);
        return -1;
    }
}

export default {signToken,authenticateRequest};