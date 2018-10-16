/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>

class ApiLike {
    constructor(private requestFactory: HttpRequestFactory) { }

    like(postId: number) : Promise<ApiLikeResponse> {
        let promise = new Promise<ApiLikeResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/like.php').post({ }, {
                id: postId,
            }, resolve, reject, undefined);
        });
        return promise;
    }

    unlike(postId: number) : Promise<ApiLikeResponse> {
        let promise = new Promise<ApiLikeResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/unlike.php').post({ }, {
                id: postId,
            }, resolve, reject, undefined);
        });
        return promise;
    }
}

class ApiLikeResponse {
    content: {
        result: string,
        likes: number
    };
    status: number;
}