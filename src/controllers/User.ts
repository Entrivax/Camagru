/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>

class User implements IController {
    private template =
        `
        <div class="content">
            <div id="userProfileContainer">
                <h1>{username}</h1>
                <div><strong>{postCount}</strong> posts</div>
            </div>
            <div id="userPostsContainer" class="row"></div>
            <div class="row">
                <div class="col-xs-12 center-xs">
                    <button id="load-more">Load more</button>
                </div>
            </div>
        </div>
        `;

    private notFoundTemplate =
        `
        <div class="content">
            <h1 class="center-xs">User not found!</h1>
        </div>
        `;
        
    private postTemplate =
        `
        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <div class="post-card">
                <a href="#/post?id={postId}" class="post-card-image" style="background-image: url(./usr/{fileName})"></a>
            </div>
        </div>
        `;

    private loadMoreButton: HTMLButtonElement;

    constructor(private httpRequestFactory: HttpRequestFactory) { }

    activate(router: Router, container: HTMLElement) {
        if (router.params.id === undefined || (<string>router.params.id).trim() === '') {
            window.location.hash = '/';
            return;
        }

        container.innerHTML = '';

        let apiUser = new ApiUser(this.httpRequestFactory);
        apiUser.get(router.params.id).then((user) => {
            container.innerHTML = this.template
                .replace('{username}', user.content.username)
                .replace('{postCount}', user.content.postCount.toString());
            let postsContainer = container.querySelector('#userPostsContainer');
            this.loadMoreButton = container.querySelector('#load-more');
            this.loadMoreButton.disabled = true;
            user.content.posts.forEach((post) => {
                let element = document.createElement('div');
                element.innerHTML = this.postTemplate
                    .replace('{fileName}', post.fileName)
                    .replace('{postId}', post.id.toString());
                postsContainer.appendChild(element.firstElementChild);
            });
            if (user.content.posts.length > 0) {
                this.loadMoreButton.disabled = false;
                let lastId = user.content.posts[user.content.posts.length - 1].id;

                let loadNext = () => {
                    this.loadMoreButton.disabled = true;
                    let apiUser = new ApiUser(this.httpRequestFactory);
                    let postCountToLoad = 10;
                    apiUser.getPosts(router.params.id, postCountToLoad, lastId).then((userPosts) => {
                        this.loadMoreButton.disabled = false;
                        userPosts.content.forEach((post) => {
                            let element = document.createElement('div');
                            element.innerHTML = this.postTemplate
                                .replace('{fileName}', post.fileName)
                                .replace('{postId}', post.id.toString());
                            postsContainer.appendChild(element.firstElementChild);
                        });
                        if (userPosts.content.length > 0) {
                            lastId = userPosts.content[userPosts.content.length - 1].id;
                        }
                        if (userPosts.content.length < postCountToLoad) {
                            this.loadMoreButton.remove();
                        }
                    }, () => {
                        this.loadMoreButton.disabled = false;
                    });
                };
        
                this.loadMoreButton.addEventListener('click', () => { this.loadMoreButton.disabled || loadNext(); });
            } else {
                this.loadMoreButton.remove();
            }
        }, (error: ApiUserResponse) => {
            if (error.status === 404) {
                container.innerHTML = this.notFoundTemplate;
            } else {
                window.location.hash = '/';
            }
        });
    }

    disable() {
    }
}