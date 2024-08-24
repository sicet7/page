import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from "@angular/common/http";
import {GcmEncryptionService} from "./services/gcm-encryption.service";

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule
    ],
    providers: [GcmEncryptionService]
})
export class GcmEncryptionModule {
}
