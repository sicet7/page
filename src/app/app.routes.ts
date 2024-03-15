import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path: 'tools',
        loadChildren: () => import('@pages/tools/tools.module').then(m => m.ToolsModule)
    },
    {
        path: '**',
        component: PageNotFoundComponent,
    }
];
