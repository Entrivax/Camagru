/// <reference path="./HttpRequest.ts"/>

class ApiToken {
    constructor(private requestFactory: HttpRequestFactory) { }

    get() : Promise<ApiTokensResponse> {
        let promise = new Promise<ApiTokensResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/get-tokens.php').get({ }, resolve, reject);
        });
        return promise;
    }
}

class ApiTokensResponse {
    content: {
        tokens: {
            token: string,
            creationDate: string,
            expire: string,
            userAgent: string,
            ip: string,
        }[]
    };
    status: number;
}