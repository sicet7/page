import {Inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

type CryptoFunction = (data: string, password: string) => Promise<string>;

@Injectable()
export class GcmEncryptionService {
    private suite: { encrypt: CryptoFunction, decrypt: CryptoFunction }|null = null;
    private loading: boolean = false;

    public constructor(@Inject(HttpClient) private http: HttpClient) {
    }

    /**
     * @param data {string}
     * @param password {string}
     */
    public async decrypt(data: string, password: string): Promise<string> {
        if (this.suite === null && !this.loading) {
            this.loading = true;
            this.suite = await this.load();
            this.loading = false;
        }
        if (typeof this.suite?.decrypt !== 'function') {
            throw new Error('Load failed')
        }
        return await this.suite.decrypt(data, password);
    }

    /**
     * @param data {string}
     * @param password {string}
     */
    public async encrypt(data: string, password: string): Promise<string> {
        if (this.suite === null && !this.loading) {
            this.loading = true;
            this.suite = await this.load();
            this.loading = false;
        }
        if (typeof this.suite?.encrypt !== 'function') {
            throw new Error('Load failed')
        }
        return await this.suite.encrypt(data, password);
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
}
