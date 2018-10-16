/// <reference path="./HttpRequest.ts"/>

class ApiLastUploads {
    constructor(private requestFactory: HttpRequestFactory) { }

    get(lastId: number, count: number) : Promise<ApiLastUploadsResponse> {
        let promise = new Promise<ApiLastUploadsResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/get-last-uploads.php').get({ lastId: lastId, count: count }, resolve, reject);
        });
        return promise;
    }
}

class ApiLastUploadsResponse {
    content: {
        id: number,
        userId: number,
        fileName: string,
        date: string,
        username: string,
    }[];
    status: number;
}