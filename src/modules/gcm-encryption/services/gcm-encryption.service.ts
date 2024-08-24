import {Inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WINDOW} from "@src/window";

type CryptoFunction = (data: string, password: string) => Promise<string>;

@Injectable()
export class GcmEncryptionService {
    private suite: { encrypt: CryptoFunction, decrypt: CryptoFunction }|null = null;
    private loading: boolean = false;

    public constructor(
        @Inject(WINDOW) private readonly window: Window,
        @Inject(HttpClient) private http: HttpClient
    ) {
    }

    /**
     * @param data {string}
     * @param password {string}
     * @param useBrowser {boolean}
     */
    public async decrypt(data: string, password: string, useBrowser: boolean = false): Promise<string> {
        if (useBrowser) {
            return await this.browserCryptDecrypt(data, password)
        }
        if (this.suite === null && !this.loading) {
            this.loading = true;
            this.suite = await this.load();
            this.loading = false;
        }
        if (typeof this.suite?.decrypt !== 'function') {
            throw new Error('Load failed')
        }
        return this.suite!.decrypt(this.fixPadding(this.toUrlSafe(data)), password);
    }

    /**
     * @param data {string}
     * @param password {string}
     * @param useBrowser {boolean}
     */
    public async encrypt(data: string, password: string, useBrowser: boolean = false): Promise<string> {
        if (useBrowser) {
            return await this.browserCryptoEncrypt(data, password)
        }
        if (this.suite === null && !this.loading) {
            this.loading = true;
            this.suite = await this.load();
            this.loading = false;
        }
        if (typeof this.suite?.encrypt !== 'function') {
            throw new Error('Load failed')
        }
        return this.toUrlSafe(await this.suite!.encrypt(data, password));
    }

    /**
     * @return {Promise<{ encrypt: CryptoFunction, decrypt: CryptoFunction }>}
     * @private
     */
    private load(): Promise<{ encrypt: CryptoFunction, decrypt: CryptoFunction }> {
        return new Promise<{encrypt: CryptoFunction; decrypt: CryptoFunction}>((resolve, reject) => {
            // @ts-ignore
            const go = new Go();
            this.http
                .get(
                    'assets/wasm/gcm-encryption.wasm',
                    {
                        responseType: "arraybuffer",
                    }
                ).subscribe((value: ArrayBuffer) => {
                    WebAssembly.instantiate(
                        value,
                        go.importObject
                    ).then((res) => {
                        go.run(res.instance);

                        // Resolve into a object with exported functions mounted.
                        resolve({
                            // @ts-ignore "GoGCMEncrypt" is what is exported from "encryption.wasm"
                            encrypt: GoGCMEncrypt as CryptoFunction,
                            // @ts-ignore "GoGCMDecrypt" is what is exported from "encryption.wasm"
                            decrypt: GoGCMDecrypt as CryptoFunction,
                        });
                    })
            })
        })
    }

    private async browserCryptoEncrypt(input: string, password: string): Promise<string> {
        const encoder = new TextEncoder;

        const saltLength = 16;
        const ivLength = 12;

        const data = encoder.encode(input);
        const salt = this.window.crypto.getRandomValues(new Uint8Array(saltLength));
        const iv = this.window.crypto.getRandomValues(new Uint8Array(ivLength));
        const derivedKey = await this.browserCryptoDeriveKey(salt, password)
        const params = {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
        }
        const encryptedBytes = await this.window.crypto.subtle.encrypt(params, derivedKey, data);
        const combinedSet = new Uint8Array(saltLength + ivLength + encryptedBytes.byteLength)
        combinedSet.set(salt)
        combinedSet.set(iv, saltLength)
        combinedSet.set(new Uint8Array(encryptedBytes), saltLength+ivLength)
        return this.toUrlSafe(this.window.btoa(String.fromCharCode(...combinedSet)))
    }

    private async browserCryptDecrypt(input: string, password: string): Promise<string> {
        const decoder = new TextDecoder;

        const dataArray = new Uint8Array(
            atob(this.fromUrlSafe(input))
                .split('')
                .map((char) => char.charCodeAt(0))
        );

        const salt = dataArray.slice(0, 16);
        const iv = dataArray.slice(16, 28);
        const ciphertextArray = dataArray.slice(28);

        const derivedKey = await this.browserCryptoDeriveKey(salt, password)
        const params = {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128,
        }
        const decryptedData = await this.window.crypto.subtle.decrypt(
            params,
            derivedKey,
            ciphertextArray
        )

        return decoder.decode(decryptedData)
    }

    private async browserCryptoDeriveKey(salt: ArrayBuffer|Uint8Array, password: string): Promise<CryptoKey> {
        const encoder = new TextEncoder;
        const key = encoder.encode(password)
        const passwordKey = await this.window.crypto.subtle.importKey(
            'raw',
            key,
            { name: 'PBKDF2' },
            false,
            ["deriveBits"]
        );
        const derivedBits = await this.window.crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                hash: 'SHA-256',
                salt: salt,
                iterations: 10000
            },
            passwordKey,
            256
        );
        return await this.window.crypto.subtle.importKey(
            'raw',
            derivedBits,
            { name: 'AES-GCM' },
            false,
            ["encrypt", "decrypt"]
        );
    }

    private toUrlSafe(b64: string): string
    {
        return b64.replaceAll('=', '')
            .replaceAll('+', '-')
            .replaceAll('/', '_')
    }

    private fromUrlSafe(b64: string): string
    {
        return this.fixPadding(b64)
            .replaceAll('-', '+')
            .replaceAll('_', '/')
    }

    private fixPadding(b64: string): string {
        const rem = b64.length % 4
        if (rem > 0) {
            b64 = `${b64}${'='.repeat(4 - rem)}`
        }
        return b64;
    }
}
