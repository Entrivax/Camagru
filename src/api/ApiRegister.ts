/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>

class ApiRegister {
    constructor(private requestFactory: HttpRequestFactory) { }

    register(username: string, email: string, password: string) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/register-user.php').post({ }, {
                username: username,
                email: email,
                password: password
            }, resolve, reject, undefined);
        });
        return promise;
    }
}