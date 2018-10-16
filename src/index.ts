/// <reference path="./StringHelpers.ts"/>
/// <reference path="./Router.ts"/>
/// <reference path="./controllers/IController.ts"/>
/// <reference path="./controllers/Home.ts"/>
/// <reference path="./controllers/Navbar.ts"/>
/// <reference path="./controllers/Post.ts"/>
/// <reference path="./controllers/User.ts"/>
/// <reference path="./api/HttpInterceptor.ts"/>
/// <reference path="./api/HttpRequestFactory.ts"/>

document.addEventListener('DOMContentLoaded', () => {
    let bodyTemplate =
        `
        <div id="navbar"></div>
        <div id="page-content"></div>
        <div id="modal-container"></div>
        <div id="footer">
            lpilotto - 2018
        </div>
        `;
    document.body.innerHTML = bodyTemplate;
    let container = document.querySelector('#page-content');
    let modalContainer = <HTMLElement>document.querySelector("#modal-container");

    let modalService = new ModalService(modalContainer);
    let stringHelpers = new StringHelpers();
    let httpRequestFactory = new HttpRequestFactory();
    let navbar = new Navbar(stringHelpers, httpRequestFactory);
    let accountCreatedController = new AccountCreated();
    let accountValidatedController = new AccountValidated();
    let invalidTokenController = new InvalidToken();
    let homeController = new Home(stringHelpers, httpRequestFactory);
    let loginController = new Login(navbar, httpRequestFactory);
    let postController = new Post(stringHelpers, httpRequestFactory, modalService);
    let settingsController = new Settings(navbar, httpRequestFactory);
    let manageTokensController = new ManageTokens(stringHelpers, httpRequestFactory);
    let userController = new User(httpRequestFactory);
    let takeController = new Take(httpRequestFactory);
    let currentController;
    let router = new Router(stringHelpers, [
        { route: /^[\/]?$/, factory: () => { switchController(homeController); } },
        { route: /^[\/]?accountCreated$/, factory: () => { switchController(accountCreatedController); } },
        { route: /^[\/]?accountValidated$/, factory: () => { switchController(accountValidatedController); } },
        { route: /^[\/]?invalidToken$/, factory: () => { switchController(invalidTokenController); } },
        { route: /^[\/]?login$/, factory: () => { switchController(loginController); } },
        { route: /^[\/]?settings$/, factory: () => { switchController(settingsController); } },
        { route: /^[\/]?post$/, factory: () => { switchController(postController); } },
        { route: /^[\/]?user$/, factory: () => { switchController(userController); } },
        { route: /^[\/]?take$/, factory: () => { switchController(takeController); } },
        { route: /^[\/]?manageTokens$/, factory: () => { switchController(manageTokensController); } },
    ]);

    let authInterceptor = new HttpInterceptor();
    authInterceptor.onRequest = (url: string, queryParams: any, xhr: XMLHttpRequest) => {
        if (localStorage.getItem('auth')) {
            xhr.setRequestHeader('Authentication', localStorage.getItem('auth'));
        }
    };
    authInterceptor.onResponseError = (url: string, response: HttpResponse) => {
        if (response.status === 401) {
            localStorage.removeItem('auth');
            navbar.logout();
        }
    };
    httpRequestFactory.registerInterceptor(authInterceptor);

    window.addEventListener('hashchange', () => { router.onHashChange(); }, false);
    document.addEventListener('loginStateChanged', () => {
        switchController(currentController);
    });

    navbar.activate(document.querySelector('#navbar'));
    router.onHashChange();
    
    function switchController(controller: IController) {
        if (currentController) {
            currentController.disable();
        }
        currentController = controller;
        currentController.activate(router, container);
    }
}, false);