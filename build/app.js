"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cert_1 = require("./cert");
(async () => {
    const cert = await cert_1.getCert("chayoot789@hotmail.com", ["atomza.com"]);
    console.log(cert);
})();
