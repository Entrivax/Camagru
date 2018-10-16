/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>

class AccountValidated implements IController {
    private template =
        `
        <div class="content">
            <div class="center-xs">
                <h1>Your account is now validated!</h1>
                <div>You can now login with your account.</div>
                <a href="#/login">Go to login</a>
            </div>
        </div>
        `;

    constructor() { }

    activate(router: Router, container: HTMLElement) {
        container.innerHTML = this.template;
    }

    disable() { }
}