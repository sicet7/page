import {Component, Input} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-list-item',
  standalone: true,
    imports: [
        RouterLink
    ],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.less'
})
export class ListItemComponent {
    @Input() public link: string = '';
    @Input() public title: string = '';
    @Input() public description: string = '';
}
