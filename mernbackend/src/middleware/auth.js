const jwt = require('jsonwebtoken');
// const Register = require('./register');

const auth = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new Error('No token provided');
        }
        const decoded = jwt.verify(token, 'mynameishuzaifaasifiamdoingcoding');
        const user = await Register.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = auth;