/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiLogin.ts"/>
/// <reference path="../StringHelpers.ts"/>

class Login implements IController {
    private template =
        `
        <div class="content">
            <div class="row center-xs">
                <div class="col-xs-12 col-sm-8 col-md-6 col-lg-5">
                    <form id="login" class="mini-container">
                        <h1>Login</h1>
                        <div id="invalid-user-password" class="error-message form-element" style="display:none;">Wrong username or password!</div>
                        <div id="email-validation" class="error-message form-element" style="display:none;">You need to validate your account by clicking the link in the mail sent to you e-mail address!</div>
                        <input class="form-element" id="username" type="text" placeholder="Username">
                        <input class="form-element" id="password" type="password" placeholder="Password">
                        <button class="form-element" type="submit">Login</button>
                    </form>
                    <form id="signup" class="mini-container">
                        <h1>Sign up</h1>
                        <input class="form-element" id="susername" type="text" placeholder="Username">
                        <div id="username-used" class="error-message form-element" style="display:none;">Username already used!</div>
                        <input class="form-element" id="semail" type="email" placeholder="E-mail">
                        <div id="email-used" class="error-message form-element" style="display:none;">E-mail already used!</div>
                        <input class="form-element" id="scemail" type="email" placeholder="Confirm e-mail">
                        <div id="email-matching" class="error-message form-element" style="display:none;">E-mail doesn't match!</div>
                        <input class="form-element" id="spassword" type="password" placeholder="Password">
                        <div id="password-security" class="error-message form-element" style="display:none;">Your password must include a lowercase and uppercase character, a number and contains at least 8 characters!</div>
                        <input class="form-element" id="scpassword" type="password" placeholder="Confirm password">
                        <div id="password-matching" class="error-message form-element" style="display:none;">Password doesn't match!</div>
                        <button class="form-element" type="submit">Sign up</button>
                    </form>
                </div>
            </div>
        </div>
        `;

    constructor(private navbar: Navbar, private httpRequestFactory: HttpRequestFactory) { }

    private requestToken: any;

    activate(router: Router, container: HTMLElement) {
        if (localStorage.getItem('auth')) {
            window.location.hash = '/settings';
            return;
        }
        container.innerHTML = this.template;
        let apiLogin = new ApiLogin(this.httpRequestFactory);
        let apiRegister = new ApiRegister(this.httpRequestFactory);
        let loginForm = <HTMLFormElement>container.querySelector('#login');
        let self = this;
        loginForm.addEventListener('submit', (ev) => {
            let errorInvalidUsernamePassword = <HTMLElement>loginForm.querySelector('#invalid-user-password');
            let errorMailValidation = <HTMLElement>loginForm.querySelector('#email-validation');
            errorInvalidUsernamePassword.style.display = errorMailValidation.style.display = 'none';
            let requestToken = {};
            this.requestToken = requestToken;
            apiLogin.login((<HTMLInputElement>loginForm.querySelector('#username')).value, (<HTMLInputElement>loginForm.querySelector('#password')).value).then(
                (user) => {
                    if (requestToken !== this.requestToken) {
                        return;
                    }
                    if (user.content.result === undefined) {
                        localStorage.setItem('auth', user.content.session_token);
                        self.navbar.login(user);
                        window.location.hash = '/';
                    } else {
                        switch(user.content.result) {
                            case 'need_validation':
                                errorMailValidation.style.display = 'block';
                                break;
                            case 'invalid_info':
                                errorInvalidUsernamePassword.style.display = 'block';
                                break;
                        }
                    }
                }
            );
            ev.preventDefault();
        });

        let signUpForm = <HTMLFormElement>container.querySelector('#signup');
        signUpForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            let inputUsername = <HTMLInputElement>signUpForm.querySelector('#susername');
            let inputEmail = <HTMLInputElement>signUpForm.querySelector('#semail');
            let inputEmailConfirm = <HTMLInputElement>signUpForm.querySelector('#scemail');
            let inputPassword = <HTMLInputElement>signUpForm.querySelector('#spassword');
            let inputPasswordConfirm = <HTMLInputElement>signUpForm.querySelector('#scpassword');

            let errorUsernameUsed = <HTMLElement>signUpForm.querySelector('#username-used');
            let errorEmailUsed = <HTMLElement>signUpForm.querySelector('#email-used');
            let errorEmailMatching = <HTMLElement>signUpForm.querySelector('#email-matching');
            let errorPasswordSecurity = <HTMLElement>signUpForm.querySelector('#password-security');
            let errorPasswordMatching = <HTMLElement>signUpForm.querySelector('#password-matching');
            
            let hasError = false;
            errorUsernameUsed.style.display = errorEmailUsed.style.display = errorEmailMatching.style.display = errorPasswordSecurity.style.display = errorPasswordMatching.style.display = 'none';

            if (inputEmail.value !== inputEmailConfirm.value) {
                hasError = true;
                errorEmailMatching.style.display = 'block';
            }

            if (inputPassword.value !== inputPasswordConfirm.value) {
                hasError = true;
                errorPasswordMatching.style.display = 'block';
            }

            let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
            if (!passwordRegex.test(inputPassword.value)) {
                hasError = true;
                errorPasswordSecurity.style.display = 'block';
            }

            if (hasError) return;

            let requestToken = {};
            this.requestToken = requestToken;
            apiRegister.register(inputUsername.value, inputEmail.value, inputPassword.value).then((reponse) => {
                if (requestToken !== this.requestToken) {
                    return;
                }
                switch (reponse.content.result) {
                    case 'username_taken':
                        errorUsernameUsed.style.display = 'block';
                        break;
                    case 'email_taken':
                        errorEmailUsed.style.display = 'block';
                        break;
                    case 'ok':
                        window.location.hash = '/accountCreated';
                        break;
                }
            })
        });
    }

    disable() {
        this.requestToken = null;
    }
}