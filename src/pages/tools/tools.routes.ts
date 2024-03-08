import {Routes} from "@angular/router";
import {ToolsComponent} from "./tools.component";

export const routes: Routes = [
    {
        path: '',
        component: ToolsComponent,
        children: [
            // {
            //     path: 'rules',
            //     loadChildren: () => import('@pages/tools/tools.module').then(m => m.JmRulesModule)
            // },
            // {
            //     path: '**',
            //     pathMatch: "full",
            //     redirectTo: ''
            // }
        ]
    },
];
