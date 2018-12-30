const validate = require("../helpers/validate");
const _data    = require("../helpers/data");
const helpers  = require("../helpers/helpers");
const config   = require("../config");

const TOKEN_DB = config.TOKEN_DB;
const USER_DB  = config.USER_DB;

let tokens = {};

// Req param: token id
tokens.get = async function(data) {
    let payload = JSON.parse(data.payload);

    let record = {
        id: validate.parameter(payload.id, "string"),
    }

    if (!record.id) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        let token = await _data.read(TOKEN_DB, record.id);

        return {status: 200, payload: token};

    } catch (err) {
        console.log("!!!! failed with ", err);
        return {status: 400, payload: err};
    }
};

// Creates new token, makes user with email logged in
// Req param: email, password
tokens.post = async function(data) {
    let payload = JSON.parse(data.payload);

    let record = {
        password: validate.parameter(payload.password, "string"),
        email: validate.parameter(payload.email, "string"),
    }

    if (!(record.email && record.password)) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        let user = await _data.read(USER_DB, record.email);

        let hashed = helpers.hash(record.password);

        if (hashed !== user.password) {
            return {status: 400, payload: "Invalid login"};
        }

        let token = {
            id: helpers.createRandomString(20),
            expires: Date.now() + 1000 * 60 * 60,
            email: record.email
        };


        await _data.create(TOKEN_DB, token.id, token);

        delete token.password;

        return {status: 200, payload: token};

    } catch (err) {
        console.log("!!!! failed with ", err);
        return {status: 400, payload: err};
    }
};

// Gives posibility to extend login session time
// Req params: token ID, extend
tokens.put = async function(data) {
    let payload = JSON.parse(data.payload);

    let record = {
        extend: validate.parameter(payload.extend, "boolean"),
        id: validate.parameter(payload.id, "string"),
    }

    if (!(record.id && record.extend)) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        let token = await _data.read(TOKEN_DB, record.id);

        if (token.expires > Date.now()) {
            token.expires = Date.now() * 1000 * 60 * 60;

            await _data.update(TOKEN_DB, record.id, token);
            return {status: 200, payload: token};
        } else {
            return {status: 400, payload: "Token expired"};
        }
    } catch (err) {
        console.log("!!!! failed with ", err);
        return {status: 400, payload: err};
    }
};

// Removes token - logs out user
// Req param: tokenId
tokens.delete = async function(bytes) {
    let obj = JSON.parse(bytes.payload);
    let id  = validate.parameter(obj.id, "string");

    if (!id) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        await _data.delete(TOKEN_DB, id);
        return {status: 200, payload: {}};

    } catch (err) {
        return {status: 400, payload: err};
    }
};

module.exports = tokens;