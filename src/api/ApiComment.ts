/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>

class ApiComment {
    constructor(private requestFactory: HttpRequestFactory) { }

    postComment(postId: number, comment: string) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/post-comment.php').post({ }, {
                id: postId,
                comment: comment
            }, resolve, reject, undefined);
        });
        return promise;
    }
}