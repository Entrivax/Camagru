/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiLastUploads.ts"/>
/// <reference path="../StringHelpers.ts"/>

class Home implements IController {
    private template =
        `
        <div class="content">
            <div id="homeContainer" class="row"></div>
            <div class="row">
                <div class="col-xs-12 center-xs">
                    <button id="load-more">Load more</button>
                </div>
            </div>
        </div>
        `;

    private postTemplate =
        `
        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <div class="post-card">
                <div class="post-card-header">
                    <a class="user-link" href="#/user?id={userId}">{username}</a>
                </div>
                <a href="#/post?id={postId}" class="post-card-image" style="background-image: url(./usr/{fileName})"></a>
                <div class="post-card-info">
                    <div class="date">
                        {elapsedTime} ago
                    </div>
                </div>
            </div>
        </div>
        `;
    private container: HTMLElement;
    private loadMoreButton: HTMLButtonElement;
    private lastId: number;
    private apiLastUploads: ApiLastUploads;
    private requestToken: any;

    constructor(private stringHelpers: StringHelpers, private httpRequestFactory: HttpRequestFactory) { }

    activate(router: Router, container: HTMLElement) {
        container.innerHTML = this.template;
        this.container = container.querySelector('#homeContainer');
        this.loadMoreButton = container.querySelector('#load-more');
        this.lastId = undefined;
        this.apiLastUploads = new ApiLastUploads(this.httpRequestFactory);
        this.loadNext();
        this.loadMoreButton.disabled = true;
        this.loadMoreButton.addEventListener('click', () => { this.loadMoreButton.disabled || this.loadNext(); });
    }

    loadNext() {
        let requestToken = {};
        this.requestToken = requestToken;
        this.loadMoreButton.disabled = true;
        let count = 10;
        this.apiLastUploads.get(this.lastId, count).then((result) => {
            if (this.requestToken != requestToken) {
                return;
            }
            var now = new Date();
            result.content.forEach((post) => {
                let element = document.createElement('div');
                element.innerHTML = this.postTemplate
                    .replace('{fileName}', post.fileName)
                    .replace('{userId}', post.userId.toString())
                    .replace('{username}', this.stringHelpers.escapeHtml(post.username))
                    .replace('{postId}', post.id.toString())
                    .replace('{elapsedTime}', this.stringHelpers.getTimeDiff(this.stringHelpers.parseMySqlDate(post.date), now));
                this.container.appendChild(element.firstElementChild);
            });
            if (result.content.length > 0) {
                this.loadMoreButton.disabled = false;
                this.lastId = result.content[result.content.length - 1].id;
            }
            if (result.content.length < count) {
                this.loadMoreButton.remove();
                this.loadMoreButton = null;
            }
        }, () => {
            this.loadMoreButton.disabled = false;
        });
    }

    disable() {
        this.requestToken = null;
    }
}