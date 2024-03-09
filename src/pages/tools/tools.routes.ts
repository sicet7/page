import {Routes} from "@angular/router";
import {ToolsComponent} from "./tools.component";
import {ListComponent} from "@pages/tools/list/list.component";

export const routes: Routes = [
    {
        path: '',
        component: ToolsComponent,
        children: [
            {
                path: '',
                component: ListComponent,
            },
            {
                path: 'encryption',
                loadComponent: () => import('@pages/tools/tools/encryption/encryption.component')
                    .then(x => x.EncryptionComponent),
            }
        ]
    },
];
