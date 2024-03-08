import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {ToolsComponent} from "./tools.component";
import {routes} from "./tools.routes";


@NgModule({
    declarations: [
        ToolsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ]
})
export class ToolsModule {
}
