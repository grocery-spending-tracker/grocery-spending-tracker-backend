import jwt from 'jsonwebtoken';
import fs from 'fs';

// const JWT_PUBLIC = process.env.JWT_PUBLIC.replace(/\\n/g, '\n') || fs.readFileSync('public_key.pem', 'utf8');
// const JWT_PRIVATE = process.env.JWT_PRIVATE.replace(/\\n/g, '\n') || fs.readFileSync('private_key.pem', 'utf8');

const JWT_PUBLIC = process.env.JWT_PUBLIC ? process.env.JWT_PUBLIC.replace(/\\n/g, '\n') : fs.readFileSync('public_key.pem', 'utf8');
const JWT_PRIVATE = process.env.JWT_PRIVATE ? process.env.JWT_PRIVATE.replace(/\\n/g, '\n') : fs.readFileSync('private_key.pem', 'utf8');

const signOptions = {
    expiresIn: '1h', // Token expires in 1 hour
    algorithm: 'RS256' // Use RSASSA-PKCS1-v1_5
};

const signToken = ((userId) => {
    const token = jwt.sign({ username: userId }, JWT_PRIVATE, signOptions); // Expires in 1 hour
    console.log('Signed token:', token);
    return token;
});

const authenticateRequest = ((req, res) => {
    const authToken = req.headers['auth'];

    if (!authToken) {
        res.status(401).send('No auth token provided');
        return -1;
    }

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

export { authenticateRequest, signToken };