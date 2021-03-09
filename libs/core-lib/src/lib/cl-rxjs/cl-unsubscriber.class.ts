import {Subscription} from 'rxjs';

/**
 * Class to handle multiple subscription and be able to unsubscribe
 */
export class ClSubscriptionHandler {

  subscriptions: Subscription[];

  constructor(subscription?: Subscription);
  constructor(subscription?: Subscription[]);
  constructor(...subscription: Subscription[]);
  constructor(...subscription: any) {
    this.subscriptions = [];
    this.add(subscription);
  }


  public add(subscription: Subscription): void;
  public add(subscription: Subscription[]): void;
  public add(...subscription: Subscription[]): void;
  public add(...subscription: any): void {
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
  }
}
