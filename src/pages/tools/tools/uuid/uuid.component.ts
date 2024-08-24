import {Component, ElementRef, OnInit} from '@angular/core';

@Component({
    selector: 'app-uuid',
    standalone: true,
    imports: [],
    templateUrl: './uuid.component.html',
    styleUrl: './uuid.component.less'
})
export class UuidComponent implements OnInit {

    protected stack: string[] = [];

    public ngOnInit(): void {
        const ids = localStorage.getItem('uuids')
        if (ids !== null) {
            this.stack = JSON.parse(ids)
        }

        while(this.stack.length < 5) {
            this.stack.unshift(this.generateUUID());
        }
        localStorage.setItem('uuids', JSON.stringify(this.stack))
    }

    protected push(): void {
        this.stack.unshift(this.generateUUID());

        while (this.stack.length > 5) {
            this.stack.splice(this.stack.length - 1, 1)
        }

        localStorage.setItem('uuids', JSON.stringify(this.stack))
    }

    protected generateUUID(): string {
        try {
            return crypto.randomUUID();
        } catch (e) {
            return "10000000-1000-4000-8000-100000000000".replace(
                /[018]/g,
                (c: any) =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    }

    protected copyUuid(uuid: HTMLInputElement): void {
        uuid.select()
        uuid.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(uuid.value)
    }
}
