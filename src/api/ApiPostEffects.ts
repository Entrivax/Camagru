/// <reference path="./HttpRequest.ts"/>

class ApiPostEffects {
    constructor(private requestFactory: HttpRequestFactory) { }

    get() : Promise<ApiPostEffectsResponse> {
        let promise = new Promise<ApiPostEffectsResponse>((resolve, reject) => {
            this.requestFactory.createRequest('images/config.php').get({ }, resolve, reject);
        });
        return promise;
    }
}

class ApiPostEffectsResponse {
    content: {
        images: {
            file: string
        }[]
    };
    status: number;
}