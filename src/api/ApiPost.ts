/// <reference path="./HttpRequest.ts"/>

class ApiPost {
    constructor(private requestFactory: HttpRequestFactory) { }

    /**
     * Get information about a post
     * @param id The id of the post
     */
    get(id: number) : Promise<ApiPostResponse> {
        let promise = new Promise<ApiPostResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/get-post.php').get({ id: id }, resolve, reject);
        });
        return promise;
    }

    /**
     * Post an image
     * @param imageData The base64 image data
     * @param effects The list of effects to apply
     */
    post(imageData: string, effects: ImageEffect[], progress: (ev: ProgressEvent) => void) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            let formData = new FormData();
            var binary = atob(imageData);
            var array = [];
            for(var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            formData.set('imageData', new Blob([new Uint8Array(array)], {type: 'image/png'}));
            let serverEffects = [];
            for (let effect of effects) {
                serverEffects.push({
                    id: effect.effectId,
                    x: effect.x,
                    y: effect.y,
                    width: effect.width,
                    height: effect.height,
                });
            }
            formData.set('args', JSON.stringify({ effects: serverEffects }));
            this.requestFactory.createRequest('api/post-upload.php').postFormData({ }, formData, resolve, reject, progress);
        });
        return promise;
    }

    /**
     * Remove a post
     * @param id The id of the post
     */
    remove(id: number) : Promise<ApiClassicResponse> {
        let promise = new Promise<ApiClassicResponse>((resolve, reject) => {
            this.requestFactory.createRequest('api/delete-post.php').delete({ id: id }, resolve, reject);
        });
        return promise;
    }
}

class ApiPostResponse {
    content: {
        id: number,
        username: string,
        userId: number,
        fileName: string,
        result: string,
        date: string,
        likes: number,
        hasLiked?: boolean,
        isOwnPost: boolean,
        comments: {
            username: string,
            userId: number,
            comment: string,
            date: string,
        }[],
    };
    status: number;
}