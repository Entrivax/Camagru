/// <reference path="./HttpRequest.ts"/>

class ApiLogin {
    constructor(private requestFactory: HttpRequestFactory) { }
    login(username: string, password: string) : Promise<ApiLoginResponse> {
        let request = this.requestFactory.createRequest('api/login.php');
        let promise = new Promise<ApiLoginResponse>((resolve, reject) => {
            request.post({ }, { username: username, password: password }, resolve, reject, undefined);
        });
        return promise;
    }

    logout() : Promise<ApiClassicResponse> {
        let request = this.requestFactory.createRequest('api/logout.php');
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            request.get({ }, resolve, reject);
        });
        return promise;
    }
}

class ApiLoginResponse {
    content: {
        id: number,
        username: string,
        email: string,
        result: string,
        session_token: string,
    };
    status: number;
}