import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path: 'tools',
        loadChildren: () => import('@pages/tools/tools.module').then(m => m.ToolsModule)
    }
];
