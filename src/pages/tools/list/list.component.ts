import {Component} from '@angular/core';
import {ListItemComponent} from "@pages/tools/list/list-item/list-item.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import { faGear } from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";

type ToolItem = {
    title: string;
    description: string;
    link: string;
    icon: IconDefinition;
};

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        ListItemComponent,
        FaIconComponent
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.less'
})
export class ListComponent {
    protected readonly items: ToolItem[] = [
        {
            title: 'UUID',
            description: 'Generates UUID\'s',
            link: '/tools/uuid',
            icon: faGear,
        }
    ];
}
