/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiMe.ts"/>
/// <reference path="../api/ApiLogin.ts"/>
/// <reference path="../StringHelpers.ts"/>

class Settings implements IController {
    private template =
        `
        <div class="content">
            <div class="mini-container center-xs">
                <h1>Profile</h1>
                <div class="separator"></div>
                <div class="setting-parameter">
                    <div>
                        Your username:
                    </div>
                    <div id="your-username"></div>
                </div>
                <div class="setting-parameter">
                    <div>
                        Your e-mail:
                    </div>
                    <div id="your-email"></div>
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="receive-mail"> Receive mail when someone post a comment on my publication
                    </label>
                </div>
                
                <h1>Change username</h1>
                <div class="separator"></div>
                <form id="username-change-form">
                    <input required class="form-element" id="username" type="text" placeholder="Your new username">
                    <div id="username-taken" class="error-message form-element" style="display:none;">Username already taken!</div>
                    <div id="username-invalid" class="error-message form-element" style="display:none;">The username must be at least 3 characters long and not include more than 24 characters!</div>
                    <input required class="form-element" id="u-password" type="password" placeholder="Password">
                    <div id="username-change-password-incorrect" class="error-message form-element" style="display:none;">Password is incorrect!</div>
                    <button class="form-element" type="submit" id="confirm-username-change">Save</button>
                    <div id="username-changed" class="form-element" style="display: none;">Username successfully changed!</div>
                </form>

                <h1>Change e-mail</h1>
                <div class="separator"></div>
                <form id="email-change-form">
                    <input required class="form-element" id="email" type="email" placeholder="Your new e-mail">
                    <div id="email-used" class="error-message form-element" style="display:none;">E-mail already used!</div>
                    <div id="email-format" class="error-message form-element" style="display: none;">Incorrect format of e-mail!</div>
                    <input required class="form-element" id="password" type="password" placeholder="Password">
                    <div id="email-change-password-incorrect" class="error-message form-element" style="display:none;">Password is incorrect!</div>
                    <button class="form-element" type="submit" id="confirm-email-change">Save</button>
                    <div id="email-changed" class="form-element" style="display: none;">E-mail successfully changed!</div>
                </form>

                <h1>Change password</h1>
                <div class="separator"></div>
                <form id="password-change-form">
                    <input required class="form-element" id="new-password" type="password" placeholder="New password">
                    <div id="password-security" class="error-message form-element" style="display:none;">Your password must include a lowercase and uppercase character, a number and contains at least 8 characters!</div>
                    <input required class="form-element" id="new-password-repeat" type="password" placeholder="Confirm new password">
                    <div id="password-matching" class="error-message form-element" style="display:none;">Password doesn't match!</div>
                    <input required class="form-element" id="old-password" type="password" placeholder="Old password">
                    <div id="password-change-password-incorrect" class="error-message form-element" style="display:none;">Password is incorrect!</div>
                    <div id="password-changed" class="form-element" style="display: none;">Password successfully changed!</div>
                    <button class="form-element" type="submit" id="confirm-password-change">Save</button>
                </form>
            </div>
        </div>
        `;

    constructor(private navbar: Navbar, private httpRequestFactory: HttpRequestFactory) { }

    activate(router: Router, container: HTMLElement) {
        container.innerHTML = this.template;
        let apiSettings = new ApiSettings(this.httpRequestFactory);
        this.loadUserInfos(container);

        (<HTMLInputElement>container.querySelector('#receive-mail'))
            .addEventListener('change', (event) => {
                apiSettings.setMailNotification((<HTMLInputElement>event.target).checked)
                    .then(() => {
                        this.loadUserInfos(container);
                    }, () => {
                        this.loadUserInfos(container);
                    });
            });

        let changingUsername = false;
        container.querySelector('#username-change-form')
            .addEventListener('submit', (event) => {
                event.preventDefault();

                if (changingUsername) {
                    return;
                }

                let usernameInput = <HTMLInputElement>container.querySelector('#username');
                let passwordInput = <HTMLInputElement>container.querySelector('#u-password');

                let usernameTakenError = <HTMLDivElement>container.querySelector('#username-taken');
                let usernameInvalidError = <HTMLDivElement>container.querySelector('#username-invalid');
                let passwordError = <HTMLDivElement>container.querySelector('#username-change-password-incorrect');
                let usernameChangedMessage = <HTMLDivElement>container.querySelector('#username-changed');

                usernameTakenError.style.display = 'none';
                usernameInvalidError.style.display = 'none';
                passwordError.style.display = 'none';
                usernameChangedMessage.style.display = 'none';

                if (usernameInput.value == null || usernameInput.value.length < 3 || usernameInput.value.length > 24) {
                    usernameInvalidError.style.display = 'block';
                    return;
                }
                
                changingUsername = true;

                apiSettings.setUsername(usernameInput.value, passwordInput.value).then(() => {
                    changingUsername = false;
                    usernameInput.value = '';
                    passwordInput.value = '';
                    usernameChangedMessage.style.display = 'block';
                    this.loadUserInfos(container);
                    this.navbar.refreshUsername();
                }, (response: ApiClassicResponse) => {
                    changingUsername = false;
                    switch (response.content.result) {
                        case 'invalid_password':
                            passwordError.style.display = 'block';
                            break;

                        case 'invalid_username':
                            usernameInvalidError.style.display = 'block';
                            break;

                        case 'username_taken':
                            usernameTakenError.style.display = 'block';
                            break;
                    }
                });
            });

        let changingMail = false;
        container.querySelector('#email-change-form')
            .addEventListener('submit', (event) => {
                event.preventDefault();

                if (changingMail) {
                    return;
                }

                let emailInput = <HTMLInputElement>container.querySelector('#email');
                let passwordInput = <HTMLInputElement>container.querySelector('#password');

                let emailFormatError = <HTMLDivElement>container.querySelector('#email-format');
                let emailTakenError = <HTMLDivElement>container.querySelector('#email-used');
                let passwordError = <HTMLDivElement>container.querySelector('#email-change-password-incorrect');
                let emailChangedMessage = <HTMLDivElement>container.querySelector('#email-changed');

                emailFormatError.style.display = 'none';
                emailTakenError.style.display = 'none';
                passwordError.style.display = 'none';
                emailChangedMessage.style.display = 'none';
                
                changingMail = true;

                apiSettings.setMail(emailInput.value, passwordInput.value).then(() => {
                    changingMail = false;
                    emailInput.value = '';
                    passwordInput.value = '';
                    emailChangedMessage.style.display = 'block';
                    this.loadUserInfos(container);
                }, (response: ApiClassicResponse) => {
                    changingMail = false;
                    switch (response.content.result) {
                        case 'invalid_email':
                            emailFormatError.style.display = 'block';
                            break;

                        case 'invalid_password':
                            passwordError.style.display = 'block';
                            break;

                        case 'email_taken':
                            emailTakenError.style.display = 'block';
                            break;
                    }
                });
            });
            
        let changingPassword = false;
        container.querySelector('#password-change-form')
            .addEventListener('submit', (event) => {
                event.preventDefault();

                if (changingPassword) {
                    return;
                }

                let newPasswordInput = <HTMLInputElement>container.querySelector('#new-password');
                let newPasswordRepeatInput = <HTMLInputElement>container.querySelector('#new-password-repeat');
                let oldPasswordInput = <HTMLInputElement>container.querySelector('#old-password');

                let passwordSecurityError = <HTMLDivElement>container.querySelector('#password-security');
                let passwordMatchingError = <HTMLDivElement>container.querySelector('#password-matching');
                let passwordError = <HTMLDivElement>container.querySelector('#password-change-password-incorrect');
                let passwordChangedMessage = <HTMLDivElement>container.querySelector('#password-changed');

                passwordSecurityError.style.display = 'none';
                passwordMatchingError.style.display = 'none';
                passwordError.style.display = 'none';
                passwordChangedMessage.style.display = 'none';

                let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
                if (!passwordRegex.test(newPasswordInput.value)) {
                    passwordSecurityError.style.display = 'block';
                    return;
                }

                if (newPasswordInput.value !== newPasswordRepeatInput.value) {
                    passwordMatchingError.style.display = 'block';
                    return;
                }

                changingPassword = true;

                apiSettings.setPassword(oldPasswordInput.value, newPasswordInput.value).then(() => {
                    changingPassword = false;
                    newPasswordInput.value = '';
                    newPasswordRepeatInput.value = '';
                    oldPasswordInput.value = '';
                    passwordChangedMessage.style.display = 'block';
                    this.loadUserInfos(container);
                }, (response: ApiClassicResponse) => {
                    changingPassword = false;
                    switch (response.content.result) {
                        case 'insecure_new_password':
                            passwordSecurityError.style.display = 'block';
                            break;

                        case 'invalid_password':
                            passwordError.style.display = 'block';
                            break;
                    }
                });
            });
    }

    private loadUserInfos(container: HTMLElement) {
        let apiMe = new ApiMe(this.httpRequestFactory);
        apiMe.get().then((me) => {
            if (me.content.result === 'not_connected') {
                localStorage.removeItem('auth');
                window.location.hash = '/login';
            } else {
                container.querySelector('#your-username').innerHTML = me.content.username;
                container.querySelector('#your-email').innerHTML = me.content.email;
                (<HTMLInputElement>container.querySelector('#receive-mail')).checked = me.content.sendMailOnComment == 1
            }
        });
    }

    disable() { }
}