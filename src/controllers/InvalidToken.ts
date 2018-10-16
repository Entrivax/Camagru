/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>

class InvalidToken implements IController {
    private template =
        `
        <div class="content">
            <div class="center-xs">
                <h1>This activation link is invalid or has already been used!</h1>
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