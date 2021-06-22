import { Client, forge, directory } from "acme-client";
import Fastify from "fastify";
import { outputFileSync, unlinkSync } from "fs-extra";
import path from "path";
import fastifyStatic from "fastify-static";

const log = console.log;

const getCert = async (email: string, domain: string[]) => {
  const app = Fastify();

  app.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
  });

  await app.listen(8080, "0.0.0.0");

  const client = new Client({
    directoryUrl: directory.letsencrypt.production,
    accountKey: await forge.createPrivateKey(),
  });

  const [key, csr] = await forge.createCsr({
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
        const filePath = path.join(
          __dirname,
          "public",
          ".well-known",
          "acme-challenge",
          challenge.token
        );
        const fileContents = keyAuthorization;

        log(
          `Creating challenge response for ${authz.identifier.value} at path: ${filePath}`
        );

        log(`Would write "${fileContents}" to path "${filePath}"`);
        outputFileSync(filePath, fileContents);
      }
    },
    challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
      log("Triggered challengeRemoveFn()");

      if (challenge.type === "http-01") {
        const filePath = path.join(
          __dirname,
          "public",
          ".well-known",
          "acme-challenge",
          challenge.token
        );

        log(
          `Removing challenge response for ${authz.identifier.value} at path: ${filePath}`
        );

        log(`Would remove file on path "${filePath}"`);
        unlinkSync(filePath);
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

export { getCert };
//init();
