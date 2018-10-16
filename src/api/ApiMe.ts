/// <reference path="./HttpRequest.ts"/>

class ApiMe {
    constructor(private requestFactory: HttpRequestFactory) { }

    get() : Promise<ApiMeResponse> {
        let promise = new Promise<ApiMeResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/me.php').get({ }, resolve, reject);
        });
        return promise;
    }
}

class ApiMeResponse {
    content: {
        id: number,
        username: string,
        email: string,
        sendMailOnComment: number,
        result: string,
    };
    status: number;
}