/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>

class ApiSettings {
    constructor(private requestFactory: HttpRequestFactory) { }

    setMail(newEmail: string, password: string) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/set-email.php').post({ }, {
                newEmail: newEmail,
                password: password,
            }, resolve, reject, undefined);
        });
        return promise;
    }

    setPassword(oldPassword: string, newPassword: string) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/set-password.php').post({ }, {
                newPassword: newPassword,
                password: oldPassword,
            }, resolve, reject, undefined);
        });
        return promise;
    }

    setUsername(username: string, password: string) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/set-username.php').post({ }, {
                username: username,
                password: password,
            }, resolve, reject, undefined);
        });
        return promise;
    }

    setMailNotification(receiveNotification: boolean) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/set-mail-comment-notification.php').post({ }, {
                sendMailOnComment: receiveNotification,
            }, resolve, reject, undefined);
        });
        return promise;
    }
}