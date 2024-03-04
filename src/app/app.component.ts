import {Component, Inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {EncryptionService} from "@services/encryption.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'sicet7';
  constructor(@Inject(EncryptionService) private service: EncryptionService) {
      this.service.encrypt("test", "test123").then((res) => {
          console.log(res)
      }).catch((err) => {
          console.error(err)
      })
  }
}
