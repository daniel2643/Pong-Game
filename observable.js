"use strict";
/**
 * A simple Observer implementation used by Observable.
 * Observers are instantiated by an Observable subscribe call.
 * A chain of observers is created as each Observable subscribes to its upstream
 * predecessor.  Each Observer is connected to its downstream neighbour via the
 * destination property.
 */
class SafeObserver {
    constructor(destination) {
        // constructor enforces that we are always subscribed to destination
        this.isUnsubscribed = false;
        this.destination = destination;
        if (destination.unsub) {
            this.unsub = destination.unsub;
        }
    }
    /**
     * Notifications stream through the Observer chain via successive next calls.
     * @param value notification payload
     */
    next(value) {
        if (!this.isUnsubscribed) {
            this.destination.next(value);
        }
    }
    /**
     * terminates the stream.
     */
    complete() {
        if (!this.isUnsubscribed) {
            this.destination.complete();
            this.unsubscribe();
        }
    }
    /**
     * clean up at completion
     */
    unsubscribe() {
        if (!this.isUnsubscribed) {
            this.isUnsubscribed = true;
            if (this.unsub)
                this.unsub();
        }
    }
}
/**
 * Implementation of a simple Observable stream, to present a basic
 * Functional Reactive Programming interface.
 * Course notes:
 * https://docs.google.com/document/d/1V6maVGJX0J4ySdbkzVtIogC5pX3dh5fxKpBAsDIf4FU/edit#bookmark=id.1bu517452per
 */
class Observable {
    /**
     * @param _subscribe subscription function applied to the associated Observer (Observer is created by Observable constructor)
     */
    constructor(_subscribe) {
        this._subscribe = _subscribe;
    }
    /**
     * Subscribes an observer to this observable
     * @param next action to perform on Observer firing
     * @param complete action to perform when Observer is completed
     * @return the unsubscribe function
     */
    subscribe(next, complete) {
        const safeObserver = new SafeObserver({
            next: next,
            complete: complete ? complete : () => console.log('complete')
        });
        safeObserver.unsub = this._subscribe(safeObserver);
        return safeObserver.unsubscribe.bind(safeObserver);
    }
    /**
     * create an Observable from a DOM Event
     * @param el HTML Element
     * @param name of event to observe
     * @return Observable with payload of Event objects
     */
    static fromEvent(el, name) {
        return new Observable((observer) => {
            const listener = ((e) => observer.next(e));
            el.addEventListener(name, listener);
            return () => el.removeEventListener(name, listener);
        });
    }
    /**
     * create an Observable sequence from an Array
     * @param arr array of elements to be passed through Observable
     * @return Observable of the array elements
     */
    static fromArray(arr) {
        return new Observable((observer) => {
            arr.forEach(el => observer.next(el));
            observer.complete();
            return () => { };
        });
    }
    /**
     * The observable notifies repeatedly with the specified delay
     * @param milliseconds interval between observable notifications
     * @return Observable payload is total elapsed time
     */
    static interval(milliseconds) {
        return new Observable(observer => {
            let elapsed = 0;
            const handle = setInterval(() => observer.next(elapsed += milliseconds), milliseconds);
            return () => clearInterval(handle);
        });
    }
    /**
     * create a new observable that observes this observable and applies the transform function on next
     * @param transform function applied to each input from the upstream Observable
     * @return Observable of the result of transform
     */
    map(transform) {
        return new Observable(observer => this.subscribe(e => observer.next(transform(e)), () => observer.complete()));
    }
    /** basically a ``tap'' function applies f to the input and passes that input (unchanged) downstream
     * @param f function applied to each input
     * @return Observable of the unchanged input
     */
    forEach(f) {
        return new Observable(observer => this.subscribe(e => {
            f(e);
            return observer.next(e);
        }, () => observer.complete()));
    }
    /**
     * create a new observable that observes this observable but only conditionally notifies next
     * @param condition filter predicate
     * @return child Observable of only notifications that satisfy the condition
     */
    filter(condition) {
        // Your code here ...
        return new Observable(observer => this.subscribe(e => {
            if (condition(e))
                observer.next(e);
        }, () => observer.complete()));
    }
    /**
     * creates a child Observable that is detached when the given Observable fires
     * @param o Observable whose notification will complete this Observable
     * @return child Observable of notifications up until o fires
     */
    takeUntil(o) {
        return new Observable(observer => {
            const oUnsub = o.subscribe(_ => {
                observer.complete();
                oUnsub();
            });
            return this.subscribe(e => observer.next(e), () => {
                observer.complete();
                oUnsub();
            });
        });
    }
    /**
     * every time this Observable is notified, create an Observable using the specified stream creator
     * output is "flattened" into the original stream
     * @param streamCreator function to create the incoming Observable stream
     * @return single ``flattened'' stream from all the created observables
     */
    flatMap(streamCreator) {
        return new Observable((observer) => {
            return this.subscribe(t => streamCreator(t).subscribe(o => observer.next(o)), () => observer.complete());
        });
    }
    /**
     * Similar to Fold or Reduce, but notifies with cumulative result of every input.
     * http://reactivex.io/documentation/operators/scan.html
     * @param initialVal starting value for accumulation
     * @param param binary accumulator function
     * @return Observable stream of V accumulated using the specified fun
     */
    scan(initialVal, fun) {
        return new Observable((observer) => {
            let accumulator = initialVal;
            return this.subscribe(v => {
                accumulator = fun(accumulator, v);
                observer.next(accumulator);
            }, () => observer.complete());
        });
    }
}
//# sourceMappingURL=observable.js.map