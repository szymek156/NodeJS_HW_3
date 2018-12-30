const config        = require("../config");
const http          = require("http");
const StringDecoder = require("string_decoder").StringDecoder;
const path          = require("path");
const fs            = require("fs");

class Common {
    static async syncRequest(requestDetails, payload) {
        return new Promise((resolve) => {
            let req = http.request(requestDetails, function(res) {
                let decoder = new StringDecoder("utf-8");
                let buffer  = "";

                res.on("data", function(chunk) {
                    buffer += decoder.write(chunk);
                });
                res.on("end", function() {
                    buffer += decoder.end();
                    resolve({res: res, payload: buffer});
                });
            });

            req.on("error", (e) => {
                console.error(`!!!!!!!!!!!!!! problem with request: ${e.message}`);
            });

            if (payload) {
                req.write(payload);
            }
            req.end();
        });
    };

    static async createUser(user) {
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "POST",
            path: "/users",
            port: config.port
        };


        return await Common.syncRequest(requestDetails, JSON.stringify(user));
    };

    static async getUser(email, token) {
        let getData = JSON.stringify(email);

        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "GET",
            path: "/users",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    };

    static async deleteUser(email, token) {
        let getData = JSON.stringify(email);

        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "DELETE",
            path: "/users",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    };

    static async updateUser(user, token) {
        let strUser = JSON.stringify(user);

        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "PUT",
            path: "/users",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(strUser),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, strUser);
    };

    static async createToken(token) {
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "POST",
            path: "/tokens",
            port: config.port
        };


        return await Common.syncRequest(requestDetails, JSON.stringify(token));
    };

    static async getToken(email) {
        let getData = JSON.stringify(email);

        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "GET",
            path: "/tokens",
            port: config.port,
            headers:
                {"Content-Type": "application/json", "Content-Length": Buffer.byteLength(getData)}
        };

        return await Common.syncRequest(requestDetails, getData);
    };

    static async deleteToken(email) {
        let getData = JSON.stringify(email);


        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "DELETE",
            path: "/tokens",
            port: config.port,
            headers:
                {"Content-Type": "application/json", "Content-Length": Buffer.byteLength(getData)}
        };

        return await Common.syncRequest(requestDetails, getData);
    };

    static async updateToken(token) {
        let strToken = JSON.stringify(token);

        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "PUT",
            path: "/tokens",
            port: config.port,
            headers:
                {"Content-Type": "application/json", "Content-Length": Buffer.byteLength(strToken)}
        };

        return await Common.syncRequest(requestDetails, strToken);
    };

    static async getMenu(email, token) {
        let getData = JSON.stringify(email);

        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "GET",
            path: "/menu",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    };


    static async createCart(email, token) {
        let getData        = JSON.stringify(email);
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "POST",
            path: "/cart",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, JSON.stringify(email));
    };

    static async updateCart(obj, token) {
        let getData        = JSON.stringify(obj);
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "PUT",
            path: "/cart",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    };

    static async getCart(obj, token) {
        let getData        = JSON.stringify(obj);
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "GET",
            path: "/cart",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    };

    static async deleteCart(obj, token) {
        let getData        = JSON.stringify(obj);
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "DELETE",
            path: "/cart",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    }

    static async postCart(obj, token) {
        let getData        = JSON.stringify(obj);
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "POST",
            path: "/checkout",
            port: config.port,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(getData),
                "token": token.id
            }
        };

        return await Common.syncRequest(requestDetails, getData);
    }

    static cleanDB(dbName) {
        let dir   = path.join(config.DB_ROOT, dbName)
        let files = fs.readdirSync(dir);

        for (const file of files) {
            fs.unlinkSync(path.join(dir, file));
        }
    };
}

module.exports = Common;