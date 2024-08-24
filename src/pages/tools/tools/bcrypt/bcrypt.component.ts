import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Mode} from "@pages/tools/tools/bcrypt/mode.enum";
import {SubscriptionHandler} from "@src/abstracts/subscription-handler";
import {NgClass} from "@angular/common";
import {Algo, shaHash} from "@src/helpers/window.helpers";
import {WINDOW} from "@src/window";
import {getAllFormErrors} from "@src/helpers/form.helpers";
import {BcryptService} from "@src/modules/bcrypt/services/bcrypt.service";
import {BcryptModule} from "@src/modules/bcrypt/bcrypt.module";

@Component({
    selector: 'app-bcrypt',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        BcryptModule
    ],
    templateUrl: './bcrypt.component.html',
    styleUrl: './bcrypt.component.less'
})
export class BcryptComponent extends SubscriptionHandler implements OnInit {
    private readonly _key: string = 'bcrypt-password';
    protected form: FormGroup = new FormGroup({
        cost: new FormControl(10, {
            validators: [
                Validators.min(6),
                Validators.max(15),
            ]
        }),
        password: new FormControl('',{
            validators: [
                Validators.required
            ]
        }),
        hash: new FormControl('', ),
        currentInput: new FormControl(''),
        mode: new FormControl(Mode.Hash),
    });
    protected output: FormControl = new FormControl<string>('', {
        validators: [
            Validators.required
        ]
    });
    protected Mode = Mode;
    protected currentMode: Mode = Mode.Hash;

    public constructor(
        @Inject(WINDOW) private readonly window: Window,
        @Inject(BcryptService) private readonly service: BcryptService,
    ) {
        super();
    }

    public ngOnInit(): void {
        const item = localStorage.getItem(this._key)
        this.handleUnsubscription(
            this.form.valueChanges.subscribe(this.changeDetection.bind(this))
        )
        if (item !== null) {
            this.form.patchValue({
                password: item
            })
        }
    }

    public async changeDetection(e: any): Promise<void> {
        this.currentMode = e.mode;

        const errors = getAllFormErrors(this.form);
        if (errors.length > 0) {
            this.output.patchValue('');
            if (e.currentInput !== '') {
                this.form.patchValue({
                    currentInput: '',
                })
            }
            return;
        }

        localStorage.setItem(this._key, e.password);
    }

    protected async execute(): Promise<void> {

        const errors = getAllFormErrors(this.form);
        const e = this.form.getRawValue();

        const input = await shaHash(
            Algo.SHA256,
            this.window,
            `${this.currentMode}-${e.password}-${e.mode === Mode.Hash ? e.cost : e.hash}`
        )

        localStorage.setItem(this._key, e.password);

        if (errors.length <= 0 && e.currentInput === input) {
            return;
        }

        try {
            const output = this.currentMode === Mode.Hash ?
                await this.service.hash(e.password, e.cost) :
                await this.service.verify(e.hash, e.password)

            this.form.patchValue({
                currentInput: input,
            })

            this.output.patchValue(output);

        } catch (e) {
            this.form.patchValue({
                currentInput: input,
            })

            this.output.patchValue('');
        }
    }

    protected setMode(newMode: Mode): void {
        this.form.patchValue({
            mode: newMode
        })
    }
}
