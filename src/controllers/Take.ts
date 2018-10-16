/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>

class Take implements IController {
    private template =
        `
        <div class="content">
            <div class="row">
                <div id="editor" class="col-xs-12 col-md-8">
                </div>
                <div class="col-xs-12 col-md-4">
                    <div id="last-posts" class="row"></div>
                </div>
            </div>
        </div>
        `;

    private postTemplate =
        `
        <div class="col-xs-6 col-sm-4 col-md-6">
            <a href="#/post?id={postId}" class="post-card-image" style="background-image: url(./usr/{fileName})"></a>
        </div>
        `;

    private notConnectedTemplate =
        `
        <div class="content">
            <div class="center-xs">
                <h1>You are not connected, please login to take pictures!</h1>
                <a href="#/login">Go to login</a>
            </div>
        </div>
        `;

    private webcam: Webcam;

    constructor(private httpRequestFactory: HttpRequestFactory) { }

    activate(router: Router, container: HTMLElement) {
        container.innerHTML = this.template;

        let apiMe = new ApiMe(this.httpRequestFactory);
        apiMe.get().then((user) => {
            if (user.content.result !== 'not_connected') {
                this.webcam = new Webcam(container.querySelector('#editor'), this.httpRequestFactory);
                this.webcam.showInputMode();

                this.webcam.setUploadListener(() => {
                    this.loadLastPosts(container, user.content.id);
                });
                this.loadLastPosts(container, user.content.id);
            } else {
                container.innerHTML = this.notConnectedTemplate;
            }
        });
    }
    
    loadLastPosts(container: HTMLElement, userId: number) {
        let apiUser = new ApiUser(this.httpRequestFactory);
        apiUser.getPosts(userId, 6, undefined).then((userPosts) => {
            let lastPosts = container.querySelector('#last-posts');
            if (!lastPosts)
                return;
            lastPosts.innerHTML = '';
            userPosts.content.forEach((post) => {
                let postElement = document.createElement('div');
                postElement.innerHTML = this.postTemplate
                    .replace('{postId}', post.id.toString())
                    .replace('{fileName}', post.fileName);
                lastPosts.appendChild(postElement.firstElementChild);
            });
        });
    }

    disable() {
        if (this.webcam)
            this.webcam.stop();
    }
}