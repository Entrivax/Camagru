/// <reference path="./HttpRequest.ts"/>

class ApiUser {
    constructor(private requestFactory: HttpRequestFactory) { }

    get(id: number) : Promise<ApiUserResponse> {
        let promise = new Promise<ApiUserResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/get-user.php').get({ id: id }, resolve, reject);
        });
        return promise;
    }

    getPosts(userId: number, count: number, lastId: number) : Promise<ApiUserPostsResponse> {
        let promise = new Promise<ApiUserPostsResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/get-user-images.php').get({ userId: userId, count: count, lastId: lastId }, resolve, reject);
        });
        return promise;
    }
}

class ApiUserPostsResponse {
    content: {
        id: number,
        userId: number,
        fileName: string,
        date: string,
    }[];
    status: number;
}

class ApiUserResponse {
    content: {
        id: number,
        username: string,
        posts: { id: number, fileName: string }[],
        postCount: number,
        result: string,
    };
    status: number;
}