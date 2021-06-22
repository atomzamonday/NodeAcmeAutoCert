"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCert = void 0;
const acme_client_1 = require("acme-client");
const fastify_1 = __importDefault(require("fastify"));
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const fastify_static_1 = __importDefault(require("fastify-static"));
const log = console.log;
const getCert = async (email, domain) => {
    const app = fastify_1.default();
    app.register(fastify_static_1.default, {
        root: path_1.default.join(__dirname, "public"),
    });
    await app.listen(80, "0.0.0.0");
    const client = new acme_client_1.Client({
        directoryUrl: acme_client_1.directory.letsencrypt.production,
        accountKey: await acme_client_1.forge.createPrivateKey(),
    });
    const [key, csr] = await acme_client_1.forge.createCsr({
        commonName: domain[0],
        altNames: domain.length > 1 ? domain.slice(1) : [],
    });
    const cert = await client.auto({
        csr,
        challengePriority: ["http-01"],
        email,
        skipChallengeVerification: true,
        termsOfServiceAgreed: true,
        challengeCreateFn: async (authz, challenge, keyAuthorization) => {
            log("Triggered challengeCreateFn()");
            if (challenge.type === "http-01") {
                const filePath = path_1.default.join(__dirname, "public", ".well-known", "acme-challenge", challenge.token);
                const fileContents = keyAuthorization;
                log(`Creating challenge response for ${authz.identifier.value} at path: ${filePath}`);
                log(`Would write "${fileContents}" to path "${filePath}"`);
                fs_extra_1.outputFileSync(filePath, fileContents);
            }
        },
        challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
            log("Triggered challengeRemoveFn()");
            if (challenge.type === "http-01") {
                const filePath = path_1.default.join(__dirname, "public", ".well-known", "acme-challenge", challenge.token);
                log(`Removing challenge response for ${authz.identifier.value} at path: ${filePath}`);
                log(`Would remove file on path "${filePath}"`);
                fs_extra_1.unlinkSync(filePath);
            }
        },
    });
    app.close();
    console.log(`CSR:\n${csr.toString()}`);
    console.log(`Private key:\n${key.toString()}`);
    console.log(`Certificate:\n${cert.toString()}`);
    return {
        csr,
        key,
        cert,
    };
};
exports.getCert = getCert;
//init();
