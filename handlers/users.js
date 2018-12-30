const validate = require("../helpers/validate");
const _data    = require("../helpers/data");
const helpers  = require("../helpers/helpers");
const config   = require("../config");

const USER_DB = config.USER_DB;
let users     = {};

// Req param: email, tokenId
users.get = async function(bytes) {
    let obj   = JSON.parse(bytes.payload);
    let email = validate.parameter(obj.email, "string");
    let token = validate.parameter(bytes.headers.token, "string");

    if (!email && !token) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        if (!await validate.token(token, email)) {
            return {status: 400, payload: "Invalid token"};
        }

        let user = await _data.read(USER_DB, email);
        delete user.password;
        return {status: 200, payload: user};

    } catch (err) {
        return {status: 400, payload: err};
    }
};

// Req param: name, email, address, password
users.post = async function(data) {
    // console.log("Received payload: ", data.payload);

    let user = JSON.parse(data.payload);

    let record = {
        name: validate.parameter(user.name, "string"),
        email: validate.parameter(user.email, "string"),
        address: validate.parameter(user.address, "string"),
        password: validate.parameter(user.password, "string")
    }

    if (!(record.name && record.email && record.address && record.password)) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        record.password = helpers.hash(record.password);

        await _data.create(USER_DB, record.email, record);

        delete record.password;
        return {status: 200, payload: record};

    } catch (err) {
        console.log("!!!! failed with ", err);
        return {status: 400, payload: err};
    }
};

users.put = async function(data) {
    let user  = JSON.parse(data.payload);
    let token = validate.parameter(data.headers.token, "string");

    let update = {
        name: validate.parameter(user.name, "string"),
        email: validate.parameter(user.email, "string"),
        address: validate.parameter(user.address, "string"),
        password: validate.parameter(user.password, "string")
    }

    if (!(update.email && token) && !(update.name || update.address || update.password)) {
        return {status: 400, payload: "Incorect parameters"};
    }

    try {
        if (!await validate.token(token, update.email)) {
            return {status: 400, payload: "Invalid token"};
        }

        let user = await _data.read(USER_DB, update.email);

        if (update.name) {
            user.name = update.name;
        }

        if (update.address) {
            user.address = update.address;
        }

        if (update.password) {
            user.password = helpers.hash(update.password);
        }

        await _data.update(USER_DB, update.email, user);

        delete user.password;
        return {status: 200, payload: user};

    } catch (err) {
        console.log("!!!! failed with ", err);
        return {status: 400, payload: err};
    }
};

// Req param: email, tokenId
users.delete = async function(bytes) {
    let obj   = JSON.parse(bytes.payload);
    let email = validate.parameter(obj.email, "string");
    let token = validate.parameter(bytes.headers.token, "string");

    if (!email && !token) {
        return {status: 400, payload: "Incorect parameters"};
    }
    try {
        if (!await validate.token(token, email)) {
            return {status: 400, payload: "Invalid token"};
        }

        let user = await _data.delete(USER_DB, email);
        return {status: 200, payload: user};

    } catch (err) {
        return {status: 400, payload: err};
    }
};

module.exports = users;