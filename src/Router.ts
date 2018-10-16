/// <reference path="./StringHelpers.ts"/>

class Router {
    route: string;
    params: any;

    constructor(private stringHelpers: StringHelpers, private routes: { factory: () => void, route: string|RegExp }[]) { }

    onHashChange() {
        let parts = this.stringHelpers.trimStart('#', location.hash).split('?', 2);
        this.route = parts[0] || '';
        this.params = { };
        if (parts.length == 2) {
            let vars = parts[1].split('&');
            for (let i = 0; i < vars.length; i++) {
                let keyValue = vars[i].split('=');
                this.params[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1] || '');
            }
        }

        for (let i = 0; i < this.routes.length; i++) {
            if (typeof(this.routes[i].route) === 'string') {
                if (this.routes[i].route === this.route) {
                    this.routes[i].factory();
                    break;
                }
            } else {
                if ((<RegExp>this.routes[i].route).test(this.route)) {
                    this.routes[i].factory();
                    break;
                }
            }
        }
    }
}