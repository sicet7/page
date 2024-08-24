import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from "@angular/common/http";
import {BcryptService} from "@src/modules/bcrypt/services/bcrypt.service";

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule
    ],
    providers: [ BcryptService ]
})
export class BcryptModule {
}
