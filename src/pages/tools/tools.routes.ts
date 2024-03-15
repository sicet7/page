import {Routes} from "@angular/router";
import {ToolsComponent} from "./tools.component";
import {ListComponent} from "@pages/tools/list/list.component";
import {UuidComponent} from "@pages/tools/tools/uuid/uuid.component";

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
                path: 'uuid',
                loadComponent: () => import('@pages/tools/tools/uuid/uuid.component')
                    .then(x => x.UuidComponent),
            }
        ]
    },
];
