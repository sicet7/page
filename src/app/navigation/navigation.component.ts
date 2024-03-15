import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-navigation',
  standalone: true,
    imports: [
        RouterLink,
        NgClass
    ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.less'
})
export class NavigationComponent {
    protected open: boolean = false;
}
