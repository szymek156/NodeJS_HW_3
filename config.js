const path = require("path");

let environments = {
    _common: {USER_DB: "users", TOKEN_DB: "tokens", MENU_DB: "menu", CART_DB: "carts"},

    production:
        {port: 3000, DB_ROOT: path.join(__dirname, "./.data"), hashingSecret: "this is secret"},

    development: {
        port: 3000,
        DB_ROOT: path.join(__dirname, "./.data_test"),
        hashingSecret: "this is development secret",
        developmentEnv: true,
        sandboxDomain: "sandboxa54fd0f0c6e24f6bb1a68f05cc647193.mailgun.org",
        mailgunApiKey: "23604d0babe3660974dd15090d733e8c-b3780ee5-3dd0f9ab"
    }
};

Object.setPrototypeOf(environments.production, environments._common);
Object.setPrototypeOf(environments.development, environments._common);

let currentEnv = process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "";

let selectedEnv = currentEnv in environments ? environments[currentEnv] : environments.development;

module.exports = selectedEnv;