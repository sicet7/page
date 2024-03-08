import {Component, Inject} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {GcmEncryptionModule} from "../modules/gcm-encryption/gcm-encryption.module";
import {GcmEncryptionService} from "../modules/gcm-encryption/services/gcm-encryption.service";
import {NavigationComponent} from "./navigation/navigation.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, GcmEncryptionModule, RouterLink, NavigationComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.less'
})
export class AppComponent {
    title = 'sicet7';

    constructor(@Inject(GcmEncryptionService) private service: GcmEncryptionService) {
        this.service.encrypt("test", "test123").then((res) => {
            console.log(res)
        }).catch((err) => {
            console.error(err)
        })
    }
}
