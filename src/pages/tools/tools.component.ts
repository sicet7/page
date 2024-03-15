import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrl: './tools.component.less'
})
export class ToolsComponent {
    constructor(protected router: Router) {
    }
}
