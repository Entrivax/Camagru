/// <reference path="../Router.ts"/>
/// <reference path="../api/ApiComment.ts"/>
/// <reference path="../api/ApiLike.ts"/>
/// <reference path="../api/ApiPost.ts"/>
/// <reference path="./IController.ts"/>

class Post implements IController {
    private template =
        `
        <div class="content">
            <div id="userPostContainer">
                <div class="row">
                    <div class="col-xs-12 col-sm-6">
                        <div class="post-image">
                            <img src="./usr/{fileName}">
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-6">
                        <div class="post-info">
                            <div>
                                <a class="user-link" href="#/user?id={userId}">{username}</a>
                                <span class="remove-button-right"><i class="fas fa-times"></i></span>
                            </div>
                            <div id="comments">
                            </div>
                            <div>
                                <span id="like-button" class="{hasLiked}"><i class="fa fa-heart"></i><i class="far fa-heart"></i></span>
                                <span id="likes-count">{likes}</span>
                            </div>
                            <div>
                                <form class="add-comment-container">
                                    <input disabled placeholder="Add comment..." maxlength="512">
                                    <button disabled type="submit">Send</button>
                                </form>
                                <div class="date">{elapsedTime} ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;

    private commentTemplate =
        `
        <div class="comment">
            <a class="user-link" href="#/user?id={userId}">{username}</a> {comment}
        </div>
        `;

    private notFoundTemplate =
        `
        <div class="content">
            <h1 class="center-xs">Post not found!</h1>
        </div>
        `;
    
    private removeModalTemplate =
        `
        <div class="modal-content">
            <div class="modal-body">
                Are you sure to delete this post?
            </div>
            <div class="modal-footer">
                <button id="confirm-button">Yes</button>
                <button id="cancel-button">No</button>
            </div>
        </div>
        `;

    constructor(private stringHelpers: StringHelpers, private httpRequestFactory: HttpRequestFactory, private modalService: ModalService) { }

    private requestToken: any;

    activate(router: Router, container: HTMLElement) {
        if (router.params.id === undefined || (<string>router.params.id).trim() === '') {
            window.location.hash = '/';
            return;
        }

        container.innerHTML = '';

        let apiPost = new ApiPost(this.httpRequestFactory);
        let apiLike = new ApiLike(this.httpRequestFactory);
        let apiComment = new ApiComment(this.httpRequestFactory);
        this.load(router, container, apiPost, apiLike, apiComment);
    }

    private load(router: Router, container: HTMLElement, apiPost: ApiPost, apiLike: ApiLike, apiComment: ApiComment) {
        let requestToken = {};
        this.requestToken = requestToken;
        apiPost.get(router.params.id).then((post) => {
            if (requestToken !== this.requestToken) {
                return;
            }
            container.innerHTML = this.template
                .replace('{username}', this.stringHelpers.escapeHtml(post.content.username))
                .replace('{userId}', post.content.userId.toString())
                .replace('{fileName}', post.content.fileName)
                .replace('{elapsedTime}', this.stringHelpers.getTimeDiff(this.stringHelpers.parseMySqlDate(post.content.date), new Date()))
                .replace('{hasLiked}', post.content.hasLiked ? 'checked' : '')
                .replace('{likes}', post.content.likes.toString());
            let removeButton = container.querySelector('.remove-button-right');
            if (!post.content.isOwnPost) {
                removeButton.remove();
            } else {
                removeButton.addEventListener('click', () => {
                    let requestToken = {};
                    this.requestToken = requestToken;
                    this.modalService.show((container, close, dismiss) => { this.removeModalController(container, close, dismiss); } ).then(() => {
                        apiPost.remove(router.params.id).then(() => {
                            if (requestToken !== this.requestToken) {
                                return;
                            }
                            window.location.hash = '/user?id=' + post.content.userId.toString();
                        });
                    });
                });
            }
            container.querySelector('#comments').innerHTML = this.getHtmlFromComments(post.content.comments);
            let likeButton = container.querySelector('#like-button');
            let likesCount = <HTMLSpanElement>container.querySelector('#likes-count');
            if (post.content.hasLiked != null) {
                container.querySelector('.add-comment-container input').removeAttribute('disabled');
                container.querySelector('.add-comment-container button').removeAttribute('disabled');
                likeButton.addEventListener('click', () => {
                    let requestToken = {};
                    this.requestToken = requestToken;
                    if (likeButton.classList.contains('checked')) {
                        likeButton.classList.remove('checked');
                        apiLike.unlike(router.params.id).then((result) => {
                            likesCount.innerText = result.content.likes.toString();
                            }, () => {
                                if (requestToken !== this.requestToken) {
                                    return;
                                }
                                likeButton.classList.add('checked');
                            });
                    } else {
                        likeButton.classList.add('checked');
                        apiLike.like(router.params.id).then((result) => {
                                likesCount.innerText = result.content.likes.toString();
                            }, () => {
                            if (requestToken !== this.requestToken) {
                                return;
                            }
                            likeButton.classList.remove('checked');
                        });
                    }
                });
            }
            let commentForm = (<HTMLFormElement>container.querySelector(".add-comment-container"));
            commentForm.addEventListener('submit', (ev) => {
                ev.preventDefault();
                let input = (<HTMLInputElement>commentForm.querySelector('input'));
                let comment = input.value.trim();
                if (comment.length > 0) {
                    let requestToken = {};
                    this.requestToken = requestToken;
                    apiComment.postComment(router.params.id, comment).then(() => {
                        if (requestToken !== this.requestToken) {
                            return;
                        }
                        input.value = '';
                        this.load(router, container, apiPost, apiLike, apiComment);
                    });
                }
            });
        }, (error: ApiUserResponse) => {
            if (error.status === 404) {
                container.innerHTML = this.notFoundTemplate;
            } else {
                window.location.hash = '/';
            }
        })
    }

    private removeModalController(container: HTMLElement, close: (arg: any) => void, dismiss: (arg: any) => void) {
        container.innerHTML = this.removeModalTemplate;
        container.querySelector('#confirm-button').addEventListener('click', () => { close(undefined); });
        container.querySelector('#cancel-button').addEventListener('click', () => { dismiss(undefined); });
    }

    getHtmlFromComments(comments: {username: string, userId: number, comment: string, date: string}[]): any {
        let html = '';
        comments.forEach((comment) => {
            html += this.commentTemplate
                .replace('{username}', comment.username)
                .replace('{userId}', comment.userId.toString())
                .replace('{comment}', this.stringHelpers.escapeHtml(comment.comment));
        });
        return html;
    }

    disable() {
        this.requestToken = null;
    }
}