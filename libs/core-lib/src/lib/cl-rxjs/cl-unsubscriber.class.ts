import {Subscription} from 'rxjs';

/**
 * Class to handle multiple subscription and be able to unsubscribe
 */
export class ClSubscriptionHandler {

  private subscriptions: Subscription[];

  constructor(subscription?: Subscription | Subscription[]) {
    this.subscriptions = [];

    if (subscription) {
      this.add(subscription);
    }
  }

  public add(subscription: Subscription | Subscription[]): void {
    if (subscription == null) {
      return;
    }
    if (subscription instanceof Subscription) {
      this.subscriptions = [subscription];
    } else if (subscription instanceof Array) {
      this.subscriptions = subscription;
    } else {
      console.error('Wrong parameters');
    }
  }

  public unsubscribe(): void {
    for (const subscription of this.subscriptions) {
      subscription?.unsubscribe();
    }
    this.subscriptions = [];
  }

}
