/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiLogin.ts"/>
/// <reference path="../api/ApiMe.ts"/>

class Navbar {
    private template = 
    `
    <div class="navbar">
        <a href="#">
            Camagru
        </a>
    </div>
    `;

    private loggedTemplate =
    `
    <div class="dropdown">
        <a href="#/user?id={userId}">{username}</a>
        <div>
            <a href="#/take">Take a picture</a>
            <a href="#/settings">Settings</a>
            <a id="logout-button">Logout</a>
        </div>
    </div>
    `;

    private notLoggedTemplate =
    `
    <a href="#/login">Login/Sign up</a>
    `;

    private element: HTMLElement;
    private apiMe: ApiMe;

    constructor(private stringHelpers: StringHelpers, private httpRequestFactory: HttpRequestFactory) { }

    activate(element: HTMLElement) {
        this.apiMe = new ApiMe(this.httpRequestFactory);
        this.element = element;
        this.element.innerHTML = this.template;
        this.apiMe.get().then((user) => {
            if (user.content.result === 'not_connected') {
                this.logout(true);
            } else {
                this.login({
                    content: {
                        id: user.content.id,
                        username: user.content.username,
                        email: null,
                        result: null,
                        session_token: null
                    },
                    status: user.status
                }, true);
            }
        });
    }

    login(user: ApiLoginResponse, isInit?: boolean) {
        this.element.innerHTML = this.template;
        let e = document.createElement('div');
        e.innerHTML = this.loggedTemplate
            .replace('{userId}', user.content.id.toString())
            .replace('{username}', this.stringHelpers.escapeHtml(user.content.username));
        e.querySelector('#logout-button').addEventListener('click', () => {
            new ApiLogin(this.httpRequestFactory).logout().then(() => {
                window.location.hash = '/';
                this.logout();
            });
        });
        this.element.querySelector('.navbar').appendChild(e.firstElementChild);
        if (!isInit)
            document.dispatchEvent(new Event('loginStateChanged'));
    }

    refreshUsername() {
        this.apiMe.get().then((user) => {
            if (user.content.result === 'not_connected') {
                this.logout(true);
            } else {
                this.login({
                    content: {
                        id: user.content.id,
                        username: user.content.username,
                        email: null,
                        result: null,
                        session_token: null
                    },
                    status: user.status
                }, true);
            }
        });
    }

    logout(isInit?: boolean) {
        this.element.innerHTML = this.template;
        let e = document.createElement('div');
        e.innerHTML = this.notLoggedTemplate;
        this.element.querySelector('.navbar').appendChild(e.firstElementChild);
        if (!isInit)
            document.dispatchEvent(new Event('loginStateChanged'));
    }
}