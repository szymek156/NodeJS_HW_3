
const assert   = require("assert");
const TestBase = require("./test_base");
const Common   = require("./common");

class TestToken extends TestBase {
    tearDown() {
        Common.cleanDB("users");
        Common.cleanDB("tokens");
    }

    async testTokenCanBeCreatedAndFetched() {
        let user = {
            name: "Simon",
            email: "Simon@theClouds.com",
            address: "5th Ave str",
            password: "StrongPassword"
        };

        let {res, payload} = await Common.createUser(user);

        assert(res.statusCode == 200);

        let {res: tokenRes, payload: tokenPayload} =
            await Common.createToken({email: user.email, password: user.password});

        let token = JSON.parse(tokenPayload);

        assert(tokenRes.statusCode == 200);
        assert(token.id !== undefined);

        let {res: tokenResGet, payload: tokenPayloadGet} = await Common.getToken({id: token.id});

        assert(tokenResGet.statusCode === 200);
        assert(tokenPayload === tokenPayloadGet);
    }

    async testTokenCantBeCreatedOnWrongCredentials() {
        let user = {
            name: "Simon",
            email: "Simon@theClouds.com",
            address: "5th Ave str",
            password: "StrongPassword"
        };

        let {res, payload} = await Common.createUser(user);

        assert(res.statusCode == 200);

        let {res: tokenRes, payload: tokenPayload} =
            await Common.createToken({email: user.email, password: "wrong pass"});

        assert(tokenRes.statusCode == 400);

        let {res: tokenResEmail, payload: tokenPayloadEmail} =
            await Common.createToken({email: "wrong@email", password: user.password});

        assert(tokenResEmail.statusCode == 400);
    }

    async testTokenCantBeCreatedWithoutUser() {
        let user = {
            name: "Simon",
            email: "NonExisting@theClouds.com",
            address: "5th Ave str",
            password: "StrongPassword"
        };

        let {res: tokenRes, payload: tokenPayload} =
            await Common.createToken({email: user.email, password: user.password});

        assert(tokenRes.statusCode == 400);
    }

    async testTokenCanBeExtended() {
        let user = {
            name: "Simon",
            email: "Simon@theClouds.com",
            address: "5th Ave str",
            password: "StrongPassword"
        };

        let {res, payload} = await Common.createUser(user);

        assert(res.statusCode == 200);

        let {res: tokenRes, payload: tokenPayload} =
            await Common.createToken({email: user.email, password: user.password});

        assert(tokenRes.statusCode == 200);

        let token = JSON.parse(tokenPayload);

        let {res: tokenResPut, payload: tokenPayloadPut} =
            await Common.updateToken({id: token.id, extend: true});

        assert(tokenResPut.statusCode == 200);
    }

    async testTokenCanBeDeleted() {
        let user = {
            name: "Simon",
            email: "Simon@theClouds.com",
            address: "5th Ave str",
            password: "StrongPassword"
        };

        let {res, payload} = await Common.createUser(user);

        assert(res.statusCode == 200);

        let {res: tokenRes, payload: tokenPayload} =
            await Common.createToken({email: user.email, password: user.password});

        assert(tokenRes.statusCode == 200);

        let token = JSON.parse(tokenPayload);

        let {res: tokenResDelete, payload: tokenPayloadDelete} =
            await Common.deleteToken({id: token.id});

        assert(tokenResDelete.statusCode == 200);
    }
}

module.exports = TestToken;