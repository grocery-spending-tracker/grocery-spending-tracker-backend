/** 
 * Created by Awesometic
 * references: https://github.com/rzcoder/node-rsa
 * RSA encryption example for Node.js with node-rsa. It's encrpyt returns Base64 encoded cipher, also decrypt for Base64 encoded cipher. RSA public key be returned in PKCS8 format.
 * License for node-rsa
 Copyright (c) 2014  rzcoder<br/>

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var NodeRSA = require('node-rsa');

var key = new NodeRSA( { b: 2048 } );

// usage in code: (nodeRsa is a variable of this)
// nodeRsa.encrypt(plainData) or nodeRsa.encrypt(plainData, rsaPublicKey)
var encrypt = function() {
    switch (arguments.length) {
        case 1:
            return key.encrypt(arguments[0], 'base64');

        case 2:
            tempKey = new NodeRSA();
            tempKey.importKey(arguments[1], 'pkcs8-public-pem');

            return tempKey.encrypt(arguments[0], 'base64');

        default:
            return null;
    }
};

var decrypt = function(cipherText) {
    return key.decrypt(cipherText, 'utf8');
};

var getKeyPair = function() {
    return key;
};

var getPublicKey = function() {
    return key.exportKey('pkcs8-public-pem');
};

module.exports = NodeRSA;

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.getKeyPair = getKeyPair;
module.exports.getPublicKey = getPublicKey;