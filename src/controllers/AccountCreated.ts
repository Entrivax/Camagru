/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>

class AccountCreated implements IController {
    private template =
        `
        <div class="content">
            <div class="center-xs">
                <h1>Your account is now created!</h1>
                <div>Please check your email to validate your account.</div>
                <a href="#/">Go to home</a>
            </div>
        </div>
        `;

    constructor() { }

    activate(router: Router, container: HTMLElement) {
        container.innerHTML = this.template;
    }

    disable() { }
}