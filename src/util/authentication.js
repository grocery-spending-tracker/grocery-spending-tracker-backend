

const validateToken = ((token) => {
     try {
          const jt = await jwt.verify(token, 'key');

          //do something
     } catch (error) {
          res.status(401).send("Unauthorized");
     }
});

module.exports.validateToken = validateToken;