import {Inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

type HashFunction = (password: string, cost: number) => Promise<string>;
type HashVerifyFunction = (hash: string, password: string) => Promise<boolean>;

@Injectable({
    providedIn: 'root'
})
export class BcryptService {

    private suite: { hash: HashFunction, verify: HashVerifyFunction }|null = null;
    private loading: boolean = false;

    public constructor(
        @Inject(HttpClient) private http: HttpClient
    ) {
    }

    public async hash(password: string, cost: number): Promise<string> {
        if (this.suite === null && !this.loading) {
            this.loading = true;
            this.suite = await this.load();
            this.loading = false;
        }
        if (typeof this.suite?.hash !== 'function') {
            throw new Error('Load failed')
        }
        return this.suite!.hash(password, cost);
    }

    public async verify(hash: string, password: string): Promise<boolean> {
        if (this.suite === null && !this.loading) {
            this.loading = true;
            this.suite = await this.load();
            this.loading = false;
        }
        if (typeof this.suite?.verify !== 'function') {
            throw new Error('Load failed')
        }
        return this.suite!.verify(hash, password)
    }

    /**
     * @return {Promise<{ hash: HashFunction, verify: HashVerifyFunction }>}
     * @private
     */
    private load(): Promise<{ hash: HashFunction, verify: HashVerifyFunction }> {
        return new Promise<{ hash: HashFunction, verify: HashVerifyFunction }>((resolve, reject) => {
            // @ts-ignore
            const go = new Go();
            this.http
                .get(
                    'assets/wasm/bcrypt.wasm',
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
                        // @ts-ignore "GoBcryptHash" is what is exported from "bcrypt.wasm"
                        hash: GoBcryptHash as HashFunction,
                        // @ts-ignore "GoBcryptHashVerify" is what is exported from "bcrypt.wasm"
                        verify: GoBcryptHashVerify as HashVerifyFunction,
                    });
                })
            })
        })
    }
}
