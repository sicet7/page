import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass} from "@angular/common";
import {Mode} from './mode.enum';
import {SubscriptionHandler} from "@src/abstracts/subscription-handler";
import {GcmEncryptionService} from "@src/modules/gcm-encryption/services/gcm-encryption.service";
import {WINDOW} from "@src/window";
import {getAllFormErrors} from "@src/helpers/form.helpers";
import {Algo, shaHash} from "@src/helpers/window.helpers";

@Component({
    selector: 'app-gcm-encrypt',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './gcm-encrypt.component.html',
    styleUrl: './gcm-encrypt.component.less'
})
export class GcmEncryptComponent extends SubscriptionHandler implements OnInit {
    private readonly _key: string = 'gcm-password';
    protected form: FormGroup = new FormGroup({
        password: new FormControl('', {
            validators: [
                Validators.required,
                Validators.minLength(6),
            ],
        }),
        mode: new FormControl(Mode.Encrypt),
        wasm: new FormControl(false),
        input: new FormControl('', {
            validators: [
                Validators.required,
                Validators.minLength(1),
            ]
        }),
        currentInput: new FormControl(''),
        output: new FormControl('', {
            validators: [
                Validators.required,
                Validators.minLength(1),
            ]
        }),
    });
    protected currentMode: Mode = Mode.Encrypt;
    protected readonly Mode = Mode;

    public constructor(
        @Inject(WINDOW) private readonly window: Window,
        @Inject(GcmEncryptionService) protected readonly service: GcmEncryptionService
    ) {
        super();
    }

    public ngOnInit(): void {
        const item = localStorage.getItem(this._key)
        if (item !== null) {
            this.setPassword(item)
        } else {
            this.setPassword(this.getRandomPassword())
        }
        this.handleUnsubscription(
            this.form.valueChanges.subscribe(this.changeDetection.bind(this)),
        )
    }

    protected async changeDetection(e: any): Promise<void> {
        const mode = e.mode;

        localStorage.setItem(this._key, e.password);

        const input = await shaHash(
            Algo.SHA256,
            this.window,
            `${e.wasm ? 1 : 0}-${mode}-${e.password}-${e.input}`
        )

        //To update UI.
        this.currentMode = mode;

        const errors = getAllFormErrors(this.form);
        const isReady = errors.filter(v => v.controlName !== 'currentInput' && v.controlName !== 'output').length === 0;

        if (isReady && e.currentInput === input) {
            return;
        }

        if (!isReady && (e.currentInput !== '' || e.output !== '')) {
            this.form.patchValue({
                currentInput: '',
                output: '',
            })
            return;
        }

        if (isReady) {
            try {
                const output = (
                    mode === Mode.Encrypt ?
                        await this.service.encrypt(e.input, e.password, !e.wasm) :
                        await this.service.decrypt(e.input, e.password, !e.wasm)
                )

                this.form.patchValue({
                    currentInput: input,
                    output: output
                })

            } catch (e) {
                this.form.patchValue({
                    currentInput: input,
                    output: ''
                })
            }
        }
    }

    public async digestMessage(message: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await this.window.crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""); // convert bytes to hex string
    }

    protected setRandomPassword(): void {
        this.setPassword(this.getRandomPassword())
    }

    protected setMode(newMode: Mode): void {
        this.form.patchValue({
            mode: newMode
        })
    }

    private setPassword(value: string): void {
        this.form.patchValue({
            password: value
        });
    }

    private getRandomPassword(): string {
        return Array.from(window.crypto.getRandomValues(new Uint8Array(Math.ceil(32 / 2))))
            .map(dec => dec.toString(16).padStart(2, "0")).join("").substring(0, 32)
    }
}
