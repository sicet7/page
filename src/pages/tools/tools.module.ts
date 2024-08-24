import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {ToolsComponent} from "./tools.component";
import {routes} from "./tools.routes";
import {GcmEncryptionService} from "@src/modules/gcm-encryption/services/gcm-encryption.service";
import {GcmEncryptionModule} from "@src/modules/gcm-encryption/gcm-encryption.module";


@NgModule({
    declarations: [
        ToolsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        GcmEncryptionModule,
    ]
})
export class ToolsModule {
}
