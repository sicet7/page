import {Component, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs";


@Component({
    template: ''
})
export abstract class SubscriptionHandler implements OnDestroy {

    private _subscriptions: Subscription[] = [];

    public handleUnsubscription(...sub: (Subscription|null|undefined)[]): void
    {
        this._subscriptions.push(
            ...(sub.filter(v => v !== null && typeof v !== 'undefined') as Subscription[])
        );
    }

    public ngOnDestroy(): void
    {
        for(const sub of this._subscriptions) {
            sub.unsubscribe();
        }
        this._subscriptions = [];
    }
}
