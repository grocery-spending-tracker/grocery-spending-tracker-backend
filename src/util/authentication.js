const jwt = require('jsonwebtoken');

const JWT_PUBLIC = process.env.JWT_PUBLIC.replace(/\\n/g, '\n') || fs.readFileSync('public_key.pem', 'utf8');

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

    console.log("Authenticated 🔐");
    return user_id;
});

function validateToken(token){
    // console.log(header);
    
     try {
          const jt = jwt.verify(token, JWT_PUBLIC, { algorithm: ['RS256'] });
          console.log(jt);
          return jt.username;
     } catch (error) {
        console.log("Token Validation Error: " + error);
          return -1;
     }
}

module.exports = {
     authenticateRequest
}