/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>

class ManageTokens implements IController {
    private template =
        `
        <div class="content">
            <div class="center-xs">
                <div id="tokens"></div>
            </div>
        </div>
        `;

    private tokenTemplate =
        `
        <div class="token row" style="margin-bottom: 10px;">
            <div class="userAgent col-xs-6"></div>
            <div class="ip col-xs-3"></div>
            <div class="date col-xs-3"></div>
        </div>
        `;

    constructor(private stringHelpers: StringHelpers, private httpRequestFactory: HttpRequestFactory) { }

    activate(router: Router, container: HTMLElement) {
        container.innerHTML = this.template;
        let tokensContainer = container.querySelector('#tokens');
        let apiToken = new ApiToken(this.httpRequestFactory);
        apiToken.get().then(response => {
            response.content.tokens.forEach(token => {
                let tokenContainer = document.createElement('div');
                tokenContainer.innerHTML = this.tokenTemplate;
                (<HTMLDivElement>tokenContainer.querySelector('.userAgent')).innerText = token.userAgent;
                (<HTMLDivElement>tokenContainer.querySelector('.ip')).innerText = token.ip;
                let date = this.stringHelpers.parseMySqlDate(token.creationDate);
                (<HTMLDivElement>tokenContainer.querySelector('.date')).innerText = date.toLocaleString();
                tokensContainer.appendChild(tokenContainer.firstElementChild);
            });
        });
    }

    disable() { }
}