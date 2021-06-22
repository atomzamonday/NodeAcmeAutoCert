/// <reference types="node" />
declare const getCert: (email: string, domain: string[]) => Promise<{
    csr: Buffer;
    key: Buffer;
    cert: string;
}>;
export { getCert };
