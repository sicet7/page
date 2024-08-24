export const shaHash = async (algo: Algo, window: Window, message: string) => {
    let a: string;
    switch (algo) {
        case Algo.SHA1:
            a = 'SHA-1';
            break;
        case Algo.SHA384:
            a = 'SHA-384';
            break;
        case Algo.SHA512:
            a = 'SHA-512';
            break;
        default:
            a = 'SHA-256'
            break;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest(a, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
};

export enum Algo {
    SHA1,
    SHA256,
    SHA384,
    SHA512
}
