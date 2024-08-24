import {
    AfterViewInit,
    Component,
    computed,
    ElementRef,
    HostListener,
    Inject,
    Signal,
    signal,
    ViewChild,
    WritableSignal
} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {GcmEncryptionModule} from "../modules/gcm-encryption/gcm-encryption.module";
import {GcmEncryptionService} from "../modules/gcm-encryption/services/gcm-encryption.service";
import {NavigationComponent} from "./navigation/navigation.component";
import {WINDOW} from "@src/window";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, GcmEncryptionModule, RouterLink, NavigationComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.less'
})
export class AppComponent implements AfterViewInit {
    @ViewChild('header')
    protected readonly header!: ElementRef;

    @ViewChild('footer')
    protected readonly footer!: ElementRef;

    protected mainMinHeight: Signal<number>;

    protected readonly headerHeight: WritableSignal<number> = signal<number>(50);
    protected readonly footerHeight: WritableSignal<number> = signal<number>(50);
    protected readonly windowHeight: WritableSignal<number> = signal<number>(50);

    public constructor(
        @Inject(WINDOW) private window: Window
    ) {
        this.mainMinHeight = computed<number>(() => {
            const windowHeight = this.windowHeight();
            const headerHeight = this.headerHeight();
            const footerHeight = this.footerHeight();
            return windowHeight-headerHeight-footerHeight;
        })
    }

    public ngAfterViewInit(): void {
        this.setHeights(null);
    }

    @HostListener('window:resize', ['$event'])
    public setHeights(event: any) {
        this.windowHeight.set(this.window.innerHeight)
        this.footerHeight.set(this.footer.nativeElement.offsetHeight)
        this.headerHeight.set(this.header.nativeElement.offsetHeight)
    }
}
