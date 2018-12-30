
const http     = require("http");
const config   = require("../config");
const assert   = require("assert");
const TestBase = require("./test_base");
const Common   = require("./common");

class TestServer extends TestBase {
    async testServerIsUpAndRunning() {
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "GET",
            path: "/echo",
            port: config.port
        };

        let {res, payload} = await Common.syncRequest(requestDetails);

        assert(res.statusCode === 200);
    }

    async testServerReturns404OnUnkownEndpoint() {
        let requestDetails = {
            protocol: "http:",
            hostname: "localhost",
            method: "GET",
            path: "/unknownEndpoint",
            port: config.port
        };

        let {res, payload} = await Common.syncRequest(requestDetails);

        assert(res.statusCode === 404);
    }
}

module.exports = TestServer;
