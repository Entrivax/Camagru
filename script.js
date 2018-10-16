class StringHelpers {
    trimStart(character, string) {
        var startIndex = 0;
        while (string[startIndex] === character) {
            startIndex++;
        }
        return string.substr(startIndex);
    }
    parseMySqlDate(date) {
        let split = date.split(/[- :]/);
        return new Date(Date.UTC(+split[0], +split[1] - 1, +split[2], +split[3] || 0, +split[4] || 0, +split[5] || 0));
    }
    getTimeDiff(from, to) {
        let elapsed = (to.getTime() - from.getTime()) / 1000;
        let years = elapsed / 31557600;
        if (years >= 1) {
            return Math.trunc(years) + ' year' + (years >= 2 ? 's' : '');
        }
        let months = elapsed / 2629800;
        if (months >= 1) {
            return Math.trunc(months) + ' month' + (months >= 2 ? 's' : '');
        }
        let days = elapsed / 86400;
        if (days >= 1) {
            return Math.trunc(days) + ' day' + (days >= 2 ? 's' : '');
        }
        let hours = elapsed / 3600;
        if (hours >= 1) {
            return Math.trunc(hours) + ' hour' + (hours >= 2 ? 's' : '');
        }
        let minutes = elapsed / 60;
        if (minutes >= 1) {
            return Math.trunc(minutes) + ' minute' + (minutes >= 2 ? 's' : '');
        }
        let seconds = elapsed;
        return Math.trunc(seconds) + ' second' + (seconds >= 2 ? 's' : '');
    }
    escapeHtml(html) {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
/// <reference path="./StringHelpers.ts"/>
class Router {
    constructor(stringHelpers, routes) {
        this.stringHelpers = stringHelpers;
        this.routes = routes;
    }
    onHashChange() {
        let parts = this.stringHelpers.trimStart('#', location.hash).split('?', 2);
        this.route = parts[0] || '';
        this.params = {};
        if (parts.length == 2) {
            let vars = parts[1].split('&');
            for (let i = 0; i < vars.length; i++) {
                let keyValue = vars[i].split('=');
                this.params[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1] || '');
            }
        }
        for (let i = 0; i < this.routes.length; i++) {
            if (typeof (this.routes[i].route) === 'string') {
                if (this.routes[i].route === this.route) {
                    this.routes[i].factory();
                    break;
                }
            }
            else {
                if (this.routes[i].route.test(this.route)) {
                    this.routes[i].factory();
                    break;
                }
            }
        }
    }
}
class TemplateManager {
    setTemplate(element, template) {
        element.innerHTML = template;
    }
}
class HttpRequest {
    constructor(url, interceptors) {
        this.url = url;
        this.interceptors = interceptors;
    }
    delete(queryParams, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4) {
                if (xhr.status < 400) {
                    if (success) {
                        let response = new HttpResponse(JSON.parse(xhr.responseText), xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseSuccess) === 'function') {
                                interceptor.onResponseSuccess(this.url, response, xhr);
                            }
                        });
                        success(response);
                    }
                }
                else {
                    if (error) {
                        let response = new HttpResponse((xhr.responseText || '').length > 0 ? JSON.parse(xhr.responseText) : null, xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseError) === 'function') {
                                interceptor.onResponseError(this.url, response, xhr);
                            }
                        });
                        error(response);
                    }
                }
            }
        });
        let newUrl = this.url;
        if (queryParams) {
            let keys = Object.keys(queryParams);
            let paramsWritten = 0;
            for (let i = 0; i < keys.length; i++) {
                if (queryParams[keys[i]] === undefined) {
                    continue;
                }
                if (paramsWritten == 0) {
                    newUrl += '?';
                }
                else {
                    newUrl += '&';
                }
                newUrl += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(queryParams[keys[i]]);
                paramsWritten++;
            }
        }
        xhr.open('DELETE', newUrl, true);
        this.interceptors.forEach(interceptor => {
            if (typeof (interceptor.onRequest) === 'function') {
                interceptor.onRequest(this.url, queryParams, xhr);
            }
        });
        xhr.send();
    }
    get(queryParams, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4) {
                if (xhr.status < 400) {
                    if (success) {
                        let response = new HttpResponse(JSON.parse(xhr.responseText), xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseSuccess) === 'function') {
                                interceptor.onResponseSuccess(this.url, response, xhr);
                            }
                        });
                        success(response);
                    }
                }
                else {
                    if (error) {
                        let response = new HttpResponse((xhr.responseText || '').length > 0 ? JSON.parse(xhr.responseText) : null, xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseError) === 'function') {
                                interceptor.onResponseError(this.url, response, xhr);
                            }
                        });
                        error(response);
                    }
                }
            }
        });
        let newUrl = this.url;
        if (queryParams) {
            let keys = Object.keys(queryParams);
            let paramsWritten = 0;
            for (let i = 0; i < keys.length; i++) {
                if (queryParams[keys[i]] === undefined) {
                    continue;
                }
                if (paramsWritten == 0) {
                    newUrl += '?';
                }
                else {
                    newUrl += '&';
                }
                newUrl += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(queryParams[keys[i]]);
                paramsWritten++;
            }
        }
        xhr.open('GET', newUrl, true);
        this.interceptors.forEach(interceptor => {
            if (typeof (interceptor.onRequest) === 'function') {
                interceptor.onRequest(this.url, queryParams, xhr);
            }
        });
        xhr.send();
    }
    post(queryParams, body, success, error, progress) {
        var xhr = new XMLHttpRequest();
        if (progress) {
            xhr.upload.addEventListener('progress', (ev) => { progress(ev); });
        }
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4) {
                if (xhr.status < 400) {
                    if (success) {
                        let response = new HttpResponse(JSON.parse(xhr.responseText), xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseSuccess) === 'function') {
                                interceptor.onResponseSuccess(this.url, response, xhr);
                            }
                        });
                        success(response);
                    }
                }
                else {
                    if (error) {
                        let response = new HttpResponse((xhr.responseText || '').length > 0 ? JSON.parse(xhr.responseText) : null, xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseError) === 'function') {
                                interceptor.onResponseError(this.url, response, xhr);
                            }
                        });
                        error(response);
                    }
                }
            }
        });
        let newUrl = this.url;
        if (queryParams) {
            let keys = Object.keys(queryParams);
            let paramsWritten = 0;
            for (let i = 0; i < keys.length; i++) {
                if (queryParams[keys[i]] === undefined) {
                    continue;
                }
                if (paramsWritten == 0) {
                    newUrl += '?';
                }
                else {
                    newUrl += '&';
                }
                newUrl += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(queryParams[keys[i]]);
                paramsWritten++;
            }
        }
        xhr.open('POST', newUrl, true);
        this.interceptors.forEach(interceptor => {
            if (typeof (interceptor.onRequest) === 'function') {
                interceptor.onRequest(this.url, queryParams, xhr);
            }
        });
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(body));
    }
    postFormData(queryParams, body, success, error, progress) {
        var xhr = new XMLHttpRequest();
        if (progress) {
            xhr.upload.addEventListener('progress', (ev) => { progress(ev); });
        }
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4) {
                if (xhr.status < 400) {
                    if (success) {
                        let response = new HttpResponse(JSON.parse(xhr.responseText), xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseSuccess) === 'function') {
                                interceptor.onResponseSuccess(this.url, response, xhr);
                            }
                        });
                        success(response);
                    }
                }
                else {
                    if (error) {
                        let response = new HttpResponse((xhr.responseText || '').length > 0 ? JSON.parse(xhr.responseText) : null, xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseError) === 'function') {
                                interceptor.onResponseError(this.url, response, xhr);
                            }
                        });
                        error(response);
                    }
                }
            }
        });
        let newUrl = this.url;
        if (queryParams) {
            let keys = Object.keys(queryParams);
            let paramsWritten = 0;
            for (let i = 0; i < keys.length; i++) {
                if (queryParams[keys[i]] === undefined) {
                    continue;
                }
                if (paramsWritten == 0) {
                    newUrl += '?';
                }
                else {
                    newUrl += '&';
                }
                newUrl += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(queryParams[keys[i]]);
                paramsWritten++;
            }
        }
        xhr.open('POST', newUrl, true);
        this.interceptors.forEach(interceptor => {
            if (typeof (interceptor.onRequest) === 'function') {
                interceptor.onRequest(this.url, queryParams, xhr);
            }
        });
        xhr.send(body);
    }
    put(queryParams, body, success, error, progress) {
        var xhr = new XMLHttpRequest();
        if (progress) {
            xhr.upload.addEventListener('progress', (ev) => { progress(ev); });
        }
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4) {
                if (xhr.status < 400) {
                    if (success) {
                        let response = new HttpResponse(JSON.parse(xhr.responseText), xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseSuccess) === 'function') {
                                interceptor.onResponseSuccess(this.url, response, xhr);
                            }
                        });
                        success(response);
                    }
                }
                else {
                    if (error) {
                        let response = new HttpResponse((xhr.responseText || '').length > 0 ? JSON.parse(xhr.responseText) : null, xhr.status);
                        this.interceptors.forEach(interceptor => {
                            if (typeof (interceptor.onResponseError) === 'function') {
                                interceptor.onResponseError(this.url, response, xhr);
                            }
                        });
                        error(response);
                    }
                }
            }
        });
        let newUrl = this.url;
        if (queryParams) {
            let keys = Object.keys(queryParams);
            let paramsWritten = 0;
            for (let i = 0; i < keys.length; i++) {
                if (queryParams[keys[i]] === undefined) {
                    continue;
                }
                if (paramsWritten == 0) {
                    newUrl += '?';
                }
                else {
                    newUrl += '&';
                }
                newUrl += encodeURIComponent(keys[i]) + '=' + encodeURIComponent(queryParams[keys[i]]);
                paramsWritten++;
            }
        }
        xhr.open('PUT', newUrl, true);
        this.interceptors.forEach(interceptor => {
            if (typeof (interceptor.onRequest) === 'function') {
                interceptor.onRequest(this.url, queryParams, xhr);
            }
        });
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(body));
    }
}
class HttpResponse {
    constructor(content, status) {
        this.content = content;
        this.status = status;
    }
}
/// <reference path="./HttpRequest.ts"/>
class ApiLastUploads {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    get(lastId, count) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/get-last-uploads.php').get({ lastId: lastId, count: count }, resolve, reject);
        });
        return promise;
    }
}
class ApiLastUploadsResponse {
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiLastUploads.ts"/>
/// <reference path="../StringHelpers.ts"/>
class Home {
    constructor(stringHelpers, httpRequestFactory) {
        this.stringHelpers = stringHelpers;
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
        <div class="content">
            <div id="homeContainer" class="row"></div>
            <div class="row">
                <div class="col-xs-12 center-xs">
                    <button id="load-more">Load more</button>
                </div>
            </div>
        </div>
        `;
        this.postTemplate = `
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
    }
    activate(router, container) {
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
/// <reference path="./HttpRequest.ts"/>
class ApiLogin {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    login(username, password) {
        let request = this.requestFactory.createRequest('api/login.php');
        let promise = new Promise((resolve, reject) => {
            request.post({}, { username: username, password: password }, resolve, reject, undefined);
        });
        return promise;
    }
    logout() {
        let request = this.requestFactory.createRequest('api/logout.php');
        let promise = new Promise((resolve, reject) => {
            request.get({}, resolve, reject);
        });
        return promise;
    }
}
class ApiLoginResponse {
}
/// <reference path="./HttpRequest.ts"/>
class ApiMe {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    get() {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/me.php').get({}, resolve, reject);
        });
        return promise;
    }
}
class ApiMeResponse {
}
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiLogin.ts"/>
/// <reference path="../api/ApiMe.ts"/>
class Navbar {
    constructor(stringHelpers, httpRequestFactory) {
        this.stringHelpers = stringHelpers;
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
    <div class="navbar">
        <a href="#">
            Camagru
        </a>
    </div>
    `;
        this.loggedTemplate = `
    <div class="dropdown">
        <a href="#/user?id={userId}">{username}</a>
        <div>
            <a href="#/take">Take a picture</a>
            <a href="#/settings">Settings</a>
            <a id="logout-button">Logout</a>
        </div>
    </div>
    `;
        this.notLoggedTemplate = `
    <a href="#/login">Login/Sign up</a>
    `;
    }
    activate(element) {
        this.apiMe = new ApiMe(this.httpRequestFactory);
        this.element = element;
        this.element.innerHTML = this.template;
        this.apiMe.get().then((user) => {
            if (user.content.result === 'not_connected') {
                this.logout(true);
            }
            else {
                this.login({
                    content: {
                        id: user.content.id,
                        username: user.content.username,
                        email: null,
                        result: null,
                        session_token: null
                    },
                    status: user.status
                }, true);
            }
        });
    }
    login(user, isInit) {
        this.element.innerHTML = this.template;
        let e = document.createElement('div');
        e.innerHTML = this.loggedTemplate
            .replace('{userId}', user.content.id.toString())
            .replace('{username}', this.stringHelpers.escapeHtml(user.content.username));
        e.querySelector('#logout-button').addEventListener('click', () => {
            new ApiLogin(this.httpRequestFactory).logout().then(() => {
                window.location.hash = '/';
                this.logout();
            });
        });
        this.element.querySelector('.navbar').appendChild(e.firstElementChild);
        if (!isInit)
            document.dispatchEvent(new Event('loginStateChanged'));
    }
    refreshUsername() {
        this.apiMe.get().then((user) => {
            if (user.content.result === 'not_connected') {
                this.logout(true);
            }
            else {
                this.login({
                    content: {
                        id: user.content.id,
                        username: user.content.username,
                        email: null,
                        result: null,
                        session_token: null
                    },
                    status: user.status
                }, true);
            }
        });
    }
    logout(isInit) {
        this.element.innerHTML = this.template;
        let e = document.createElement('div');
        e.innerHTML = this.notLoggedTemplate;
        this.element.querySelector('.navbar').appendChild(e.firstElementChild);
        if (!isInit)
            document.dispatchEvent(new Event('loginStateChanged'));
    }
}
class ApiClassicResponse {
}
/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>
class ApiComment {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    postComment(postId, comment) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/post-comment.php').post({}, {
                id: postId,
                comment: comment
            }, resolve, reject, undefined);
        });
        return promise;
    }
}
/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>
class ApiLike {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    like(postId) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/like.php').post({}, {
                id: postId,
            }, resolve, reject, undefined);
        });
        return promise;
    }
    unlike(postId) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/unlike.php').post({}, {
                id: postId,
            }, resolve, reject, undefined);
        });
        return promise;
    }
}
class ApiLikeResponse {
}
/// <reference path="./HttpRequest.ts"/>
class ApiPost {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    /**
     * Get information about a post
     * @param id The id of the post
     */
    get(id) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/get-post.php').get({ id: id }, resolve, reject);
        });
        return promise;
    }
    /**
     * Post an image
     * @param imageData The base64 image data
     * @param effects The list of effects to apply
     */
    post(imageData, effects, progress) {
        let promise = new Promise((resolve, reject) => {
            let formData = new FormData();
            var binary = atob(imageData);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            formData.set('imageData', new Blob([new Uint8Array(array)], { type: 'image/png' }));
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
            this.requestFactory.createRequest('api/post-upload.php').postFormData({}, formData, resolve, reject, progress);
        });
        return promise;
    }
    /**
     * Remove a post
     * @param id The id of the post
     */
    remove(id) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/delete-post.php').delete({ id: id }, resolve, reject);
        });
        return promise;
    }
}
class ApiPostResponse {
}
/// <reference path="../Router.ts"/>
/// <reference path="../api/ApiComment.ts"/>
/// <reference path="../api/ApiLike.ts"/>
/// <reference path="../api/ApiPost.ts"/>
/// <reference path="./IController.ts"/>
class Post {
    constructor(stringHelpers, httpRequestFactory, modalService) {
        this.stringHelpers = stringHelpers;
        this.httpRequestFactory = httpRequestFactory;
        this.modalService = modalService;
        this.template = `
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
        this.commentTemplate = `
        <div class="comment">
            <a class="user-link" href="#/user?id={userId}">{username}</a> {comment}
        </div>
        `;
        this.notFoundTemplate = `
        <div class="content">
            <h1 class="center-xs">Post not found!</h1>
        </div>
        `;
        this.removeModalTemplate = `
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
    }
    activate(router, container) {
        if (router.params.id === undefined || router.params.id.trim() === '') {
            window.location.hash = '/';
            return;
        }
        container.innerHTML = '';
        let apiPost = new ApiPost(this.httpRequestFactory);
        let apiLike = new ApiLike(this.httpRequestFactory);
        let apiComment = new ApiComment(this.httpRequestFactory);
        this.load(router, container, apiPost, apiLike, apiComment);
    }
    load(router, container, apiPost, apiLike, apiComment) {
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
            }
            else {
                removeButton.addEventListener('click', () => {
                    let requestToken = {};
                    this.requestToken = requestToken;
                    this.modalService.show((container, close, dismiss) => { this.removeModalController(container, close, dismiss); }).then(() => {
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
            let likesCount = container.querySelector('#likes-count');
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
                    }
                    else {
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
            let commentForm = container.querySelector(".add-comment-container");
            commentForm.addEventListener('submit', (ev) => {
                ev.preventDefault();
                let input = commentForm.querySelector('input');
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
        }, (error) => {
            if (error.status === 404) {
                container.innerHTML = this.notFoundTemplate;
            }
            else {
                window.location.hash = '/';
            }
        });
    }
    removeModalController(container, close, dismiss) {
        container.innerHTML = this.removeModalTemplate;
        container.querySelector('#confirm-button').addEventListener('click', () => { close(undefined); });
        container.querySelector('#cancel-button').addEventListener('click', () => { dismiss(undefined); });
    }
    getHtmlFromComments(comments) {
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
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
class User {
    constructor(httpRequestFactory) {
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
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
        this.notFoundTemplate = `
        <div class="content">
            <h1 class="center-xs">User not found!</h1>
        </div>
        `;
        this.postTemplate = `
        <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
            <div class="post-card">
                <a href="#/post?id={postId}" class="post-card-image" style="background-image: url(./usr/{fileName})"></a>
            </div>
        </div>
        `;
    }
    activate(router, container) {
        if (router.params.id === undefined || router.params.id.trim() === '') {
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
            }
            else {
                this.loadMoreButton.remove();
            }
        }, (error) => {
            if (error.status === 404) {
                container.innerHTML = this.notFoundTemplate;
            }
            else {
                window.location.hash = '/';
            }
        });
    }
    disable() {
    }
}
class HttpInterceptor {
    constructor() {
        this.onRequest = null;
        this.onResponseSuccess = null;
        this.onResponseError = null;
    }
}
/// <reference path="./HttpRequest.ts"/>
/// <reference path="./HttpInterceptor.ts"/>
class HttpRequestFactory {
    constructor() {
        this.interceptors = [];
    }
    createRequest(url) {
        return new HttpRequest(url, this.interceptors);
    }
    registerInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
}
/// <reference path="./StringHelpers.ts"/>
/// <reference path="./Router.ts"/>
/// <reference path="./controllers/IController.ts"/>
/// <reference path="./controllers/Home.ts"/>
/// <reference path="./controllers/Navbar.ts"/>
/// <reference path="./controllers/Post.ts"/>
/// <reference path="./controllers/User.ts"/>
/// <reference path="./api/HttpInterceptor.ts"/>
/// <reference path="./api/HttpRequestFactory.ts"/>
document.addEventListener('DOMContentLoaded', () => {
    let bodyTemplate = `
        <div id="navbar"></div>
        <div id="page-content"></div>
        <div id="modal-container"></div>
        <div id="footer">
            lpilotto - 2018
        </div>
        `;
    document.body.innerHTML = bodyTemplate;
    let container = document.querySelector('#page-content');
    let modalContainer = document.querySelector("#modal-container");
    let modalService = new ModalService(modalContainer);
    let stringHelpers = new StringHelpers();
    let httpRequestFactory = new HttpRequestFactory();
    let navbar = new Navbar(stringHelpers, httpRequestFactory);
    let accountCreatedController = new AccountCreated();
    let accountValidatedController = new AccountValidated();
    let invalidTokenController = new InvalidToken();
    let homeController = new Home(stringHelpers, httpRequestFactory);
    let loginController = new Login(navbar, httpRequestFactory);
    let postController = new Post(stringHelpers, httpRequestFactory, modalService);
    let settingsController = new Settings(navbar, httpRequestFactory);
    let manageTokensController = new ManageTokens(stringHelpers, httpRequestFactory);
    let userController = new User(httpRequestFactory);
    let takeController = new Take(httpRequestFactory);
    let currentController;
    let router = new Router(stringHelpers, [
        { route: /^[\/]?$/, factory: () => { switchController(homeController); } },
        { route: /^[\/]?accountCreated$/, factory: () => { switchController(accountCreatedController); } },
        { route: /^[\/]?accountValidated$/, factory: () => { switchController(accountValidatedController); } },
        { route: /^[\/]?invalidToken$/, factory: () => { switchController(invalidTokenController); } },
        { route: /^[\/]?login$/, factory: () => { switchController(loginController); } },
        { route: /^[\/]?settings$/, factory: () => { switchController(settingsController); } },
        { route: /^[\/]?post$/, factory: () => { switchController(postController); } },
        { route: /^[\/]?user$/, factory: () => { switchController(userController); } },
        { route: /^[\/]?take$/, factory: () => { switchController(takeController); } },
        { route: /^[\/]?manageTokens$/, factory: () => { switchController(manageTokensController); } },
    ]);
    let authInterceptor = new HttpInterceptor();
    authInterceptor.onRequest = (url, queryParams, xhr) => {
        if (localStorage.getItem('auth')) {
            xhr.setRequestHeader('Authentication', localStorage.getItem('auth'));
        }
    };
    authInterceptor.onResponseError = (url, response) => {
        if (response.status === 401) {
            localStorage.removeItem('auth');
            navbar.logout();
        }
    };
    httpRequestFactory.registerInterceptor(authInterceptor);
    window.addEventListener('hashchange', () => { router.onHashChange(); }, false);
    document.addEventListener('loginStateChanged', () => {
        switchController(currentController);
    });
    navbar.activate(document.querySelector('#navbar'));
    router.onHashChange();
    function switchController(controller) {
        if (currentController) {
            currentController.disable();
        }
        currentController = controller;
        currentController.activate(router, container);
    }
}, false);
/// <reference path="./HttpRequest.ts"/>
class ApiPostEffects {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    get() {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('images/config.php').get({}, resolve, reject);
        });
        return promise;
    }
}
class ApiPostEffectsResponse {
}
/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>
class ApiRegister {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    register(username, email, password) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/register-user.php').post({}, {
                username: username,
                email: email,
                password: password
            }, resolve, reject, undefined);
        });
        return promise;
    }
}
/// <reference path="./HttpRequest.ts"/>
/// <reference path="./ApiClassicResponse.ts"/>
class ApiSettings {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    setMail(newEmail, password) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/set-email.php').post({}, {
                newEmail: newEmail,
                password: password,
            }, resolve, reject, undefined);
        });
        return promise;
    }
    setPassword(oldPassword, newPassword) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/set-password.php').post({}, {
                newPassword: newPassword,
                password: oldPassword,
            }, resolve, reject, undefined);
        });
        return promise;
    }
    setUsername(username, password) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/set-username.php').post({}, {
                username: username,
                password: password,
            }, resolve, reject, undefined);
        });
        return promise;
    }
    setMailNotification(receiveNotification) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/set-mail-comment-notification.php').post({}, {
                sendMailOnComment: receiveNotification,
            }, resolve, reject, undefined);
        });
        return promise;
    }
}
/// <reference path="./HttpRequest.ts"/>
class ApiToken {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    get() {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/get-tokens.php').get({}, resolve, reject);
        });
        return promise;
    }
}
class ApiTokensResponse {
}
/// <reference path="./HttpRequest.ts"/>
class ApiUser {
    constructor(requestFactory) {
        this.requestFactory = requestFactory;
    }
    get(id) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/get-user.php').get({ id: id }, resolve, reject);
        });
        return promise;
    }
    getPosts(userId, count, lastId) {
        let promise = new Promise((resolve, reject) => {
            this.requestFactory.createRequest('api/get-user-images.php').get({ userId: userId, count: count, lastId: lastId }, resolve, reject);
        });
        return promise;
    }
}
class ApiUserPostsResponse {
}
class ApiUserResponse {
}
/// <reference path="../api/ApiPost.ts"/>
class Webcam {
    constructor(container, httpRequestFactory) {
        this.container = container;
        this.httpRequestFactory = httpRequestFactory;
        this.inputModeTemplate = `
        <div id="camera-container"></div>
        <div id="select-file-container">
            <label id="select-file">If you want to take a file from your device, select a file! <input type="file"></label>
        </div>
        `;
        this.cameraTemplate = `
        <video id="camera" autoplay></video>
        <i class="far fa-dot-circle fa-3x" id="take-photo-button"></i>
        `;
        this.editModeTemplate = `
        <div id="edit-canvas-container">
            <button id="back-button">Back</button>
            <button id="confirm-button" disabled>Confirm</button>
            <div class="edition-container">
                <canvas></canvas>
                <div id="handles" class="handles-container" style="display: none;">
                    <div id="top-left-handle" class="handle"></div>
                    <div id="top-right-handle" class="handle"></div>
                    <div id="middle-handle" class="handle"></div>
                    <div id="bottom-left-handle" class="handle"></div>
                    <div id="bottom-right-handle" class="handle"></div>
                </div>
            </div>
            <div style="display: none;">
                <div class="loading-bar" style="height: 20px;"></div>
            </div>
            <div class="row" id="images-selection"></div>
        </div>
        `;
        this.images = {
            images: [],
            promise: new ApiPostEffects(httpRequestFactory).get()
        };
        this.images.promise.then((effects) => {
            effects.content.images.forEach((image) => {
                let img = new Image();
                let imgToPush = {
                    file: image.file,
                    promise: null,
                };
                imgToPush.promise = new Promise((resolve, reject) => {
                    img.onload = () => {
                        resolve(img);
                    };
                    img.src = './images/' + image.file;
                });
                this.images.images.push(imgToPush);
            });
        });
    }
    showInputMode() {
        this.container.innerHTML = this.inputModeTemplate;
        let cameraContainer = this.container.querySelector('#camera-container');
        navigator.getUserMedia({ video: {
                width: { ideal: 9999 }
            }, audio: false }, (localMediaStream) => {
            cameraContainer.innerHTML = this.cameraTemplate;
            this.webcamStream = localMediaStream;
            this.container.querySelector('#camera').srcObject = localMediaStream;
            this.container.querySelector('#take-photo-button').addEventListener('click', () => {
                let tempCanvas = document.createElement('canvas');
                let tempContext = tempCanvas.getContext('2d');
                let camera = this.container.querySelector('#camera');
                tempCanvas.width = camera.videoWidth;
                tempCanvas.height = camera.videoHeight;
                tempContext.drawImage(camera, 0, 0);
                this.showEditMode(tempCanvas, true);
            });
        }, (error) => {
            if (error.name === 'NotFoundError') {
                cameraContainer.innerHTML = '<div>No camera found!</div>';
            }
            console.error('Error occured while retrieving user media: ' + error);
        });
        let input = this.container.querySelector('#select-file-container input[type=file]');
        input.addEventListener('change', (ev) => {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = () => {
                    let image = new Image();
                    image.src = reader.result;
                    image.onload = () => {
                        this.showEditMode(image, input.files[0].type === 'image/jpeg');
                    };
                };
                reader.readAsDataURL(input.files[0]);
            }
        });
    }
    showEditMode(img, useJpeg) {
        this.stop();
        let imagesToAdd = [];
        let selectedImageIndex = -1;
        this.container.innerHTML = this.editModeTemplate;
        this.container.querySelector('#back-button').addEventListener('click', () => {
            this.showInputMode();
        });
        let confirmButton = this.container.querySelector('#confirm-button');
        confirmButton.addEventListener('click', () => {
            if (confirmButton.disabled) {
                return;
            }
            if (imagesToAdd.length === 0) {
                return;
            }
            let apiPost = new ApiPost(this.httpRequestFactory);
            let tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = img.width;
            tmpCanvas.height = img.height;
            let tmpContext = tmpCanvas.getContext('2d');
            tmpContext.drawImage(img, 0, 0);
            let loadingBar = this.container.querySelector('.loading-bar');
            loadingBar.parentElement.style.display = 'block';
            confirmButton.disabled = true;
            apiPost.post(tmpCanvas.toDataURL(useJpeg ? 'image/jpeg' : undefined, useJpeg ? 0.88 : undefined).split('base64,')[1], imagesToAdd, (progressEvent) => {
                loadingBar.style.width = (progressEvent.loaded / progressEvent.total * 100) + '%';
            }).then(() => {
                this.uploadListener();
                this.showInputMode();
            }, () => {
                confirmButton.disabled = false;
            });
        });
        let editionContainer = this.container.querySelector('.edition-container');
        let handlesContainer = this.container.querySelector('#handles');
        let topLeftHandler = handlesContainer.querySelector('#top-left-handle');
        let topRightHandler = handlesContainer.querySelector('#top-right-handle');
        let middleHandler = handlesContainer.querySelector('#middle-handle');
        let bottomLeftHandler = handlesContainer.querySelector('#bottom-left-handle');
        let bottomRightHandler = handlesContainer.querySelector('#bottom-right-handle');
        let startedToDragTopLeft = false;
        topLeftHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragTopLeft = true;
        });
        let startedToDragTopRight = false;
        topRightHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragTopRight = true;
        }, false);
        let startedToDragBottomLeft = false;
        bottomLeftHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragBottomLeft = true;
        }, false);
        let startedToDragBottomRight = false;
        bottomRightHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragBottomRight = true;
        }, false);
        let startedToDragMiddle = false;
        middleHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragMiddle = true;
        }, false);
        function updateHandles() {
            if (selectedImageIndex < 0) {
                handlesContainer.style.display = 'none';
                return;
            }
            handlesContainer.style.display = 'block';
            handlesContainer.style.top = (imagesToAdd[selectedImageIndex].y) + '%';
            handlesContainer.style.left = (imagesToAdd[selectedImageIndex].x) + '%';
            handlesContainer.style.right = (100 - (imagesToAdd[selectedImageIndex].x + imagesToAdd[selectedImageIndex].width)) + '%';
            handlesContainer.style.bottom = (100 - (imagesToAdd[selectedImageIndex].y + imagesToAdd[selectedImageIndex].height)) + '%';
        }
        let clicking = false;
        editionContainer.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            clicking = true;
        });
        editionContainer.addEventListener('mouseup', (evt) => {
            evt.preventDefault();
            if (clicking) {
                let box = editionContainer.getBoundingClientRect();
                let x = ((evt.clientX - box.left) / (box.right - box.left)) * 100;
                let y = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100;
                selectedImageIndex = -1;
                for (let i = imagesToAdd.length - 1; i >= 0; i--) {
                    if (x >= imagesToAdd[i].x && x <= imagesToAdd[i].x + imagesToAdd[i].width &&
                        y >= imagesToAdd[i].y && y <= imagesToAdd[i].y + imagesToAdd[i].height) {
                        selectedImageIndex = i;
                        break;
                    }
                }
                updateHandles();
            }
            clicking = false;
        });
        editionContainer.addEventListener('mousemove', (evt) => {
            clicking = false;
            evt.preventDefault();
            if (!startedToDragBottomLeft && !startedToDragBottomRight && !startedToDragMiddle && !startedToDragTopLeft && !startedToDragTopRight) {
                return;
            }
            let selectedImage = imagesToAdd[selectedImageIndex];
            let box = editionContainer.getBoundingClientRect();
            if (startedToDragTopLeft) {
                let newX = ((evt.clientX - box.left) / (box.right - box.left)) * 100;
                let newWidth = (selectedImage.width + selectedImage.x - newX);
                if (newWidth < 0) {
                    newWidth = 0;
                    newX = selectedImage.x + selectedImage.width;
                }
                selectedImage.x = newX;
                selectedImage.width = newWidth;
                let newY = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100;
                let newHeight = (selectedImage.height + selectedImage.y - newY);
                if (newHeight < 0) {
                    newHeight = 0;
                    newY = selectedImage.y + selectedImage.height;
                }
                selectedImage.y = newY;
                selectedImage.height = newHeight;
            }
            else if (startedToDragTopRight) {
                let newWidth = ((evt.clientX - box.left) / (box.right - box.left)) * 100 - selectedImage.x;
                if (newWidth < 0) {
                    newWidth = 0;
                }
                selectedImage.width = newWidth;
                let newY = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100;
                let newHeight = (selectedImage.height + selectedImage.y - newY);
                if (newHeight < 0) {
                    newHeight = 0;
                    newY = selectedImage.y + selectedImage.height;
                }
                selectedImage.y = newY;
                selectedImage.height = newHeight;
            }
            else if (startedToDragMiddle) {
                selectedImage.x = ((evt.clientX - box.left) / (box.right - box.left)) * 100 - selectedImage.width / 2;
                selectedImage.y = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100 - selectedImage.height / 2;
            }
            else if (startedToDragBottomLeft) {
                let newX = ((evt.clientX - box.left) / (box.right - box.left)) * 100;
                let newWidth = (selectedImage.width + selectedImage.x - newX);
                if (newWidth < 0) {
                    newWidth = 0;
                    newX = selectedImage.x + selectedImage.width;
                }
                selectedImage.x = newX;
                selectedImage.width = newWidth;
                let newHeight = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100 - selectedImage.y;
                if (newHeight < 0) {
                    newHeight = 0;
                }
                selectedImage.height = newHeight;
            }
            else if (startedToDragBottomRight) {
                let newWidth = ((evt.clientX - box.left) / (box.right - box.left)) * 100 - selectedImage.x;
                if (newWidth < 0) {
                    newWidth = 0;
                }
                selectedImage.width = newWidth;
                let newHeight = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100 - selectedImage.y;
                if (newHeight < 0) {
                    newHeight = 0;
                }
                selectedImage.height = newHeight;
            }
            updateHandles();
            this.redrawCanvas(canvas, context, img, imagesToAdd);
        });
        editionContainer.addEventListener('mouseup', (evt) => {
            evt.preventDefault();
            startedToDragTopLeft = false;
            startedToDragTopRight = false;
            startedToDragMiddle = false;
            startedToDragBottomLeft = false;
            startedToDragBottomRight = false;
        });
        this.images.promise.then(() => {
            Promise.all(this.images.images.map((i) => i.promise)).then((images) => {
                let imagesContainer = this.container.querySelector('#images-selection');
                images.forEach((i, index) => {
                    let imageSelectionContainer = document.createElement('div');
                    imageSelectionContainer.classList.add('col-xs-4');
                    imageSelectionContainer.classList.add('col-md-3');
                    imageSelectionContainer.classList.add('col-lg-2');
                    let imageSelection = document.createElement('div');
                    imageSelection.classList.add('image-selection');
                    imageSelection.appendChild(i);
                    imageSelectionContainer.appendChild(imageSelection);
                    imagesContainer.appendChild(imageSelectionContainer);
                    imageSelection.addEventListener('click', () => {
                        confirmButton.removeAttribute('disabled');
                        let canvasRatio = canvas.width / canvas.height;
                        let imgRatio = images[index].width / images[index].height;
                        let sw = canvasRatio > imgRatio ? (images[index].width * canvas.height / images[index].height) : (canvas.width);
                        let sh = canvasRatio > imgRatio ? (canvas.height) : (images[index].height * canvas.width / images[index].width);
                        imagesToAdd.push(new ImageEffect(images[index], index, 100 * ((canvas.width - sw) / 2) / canvas.width, 100 * ((canvas.height - sh) / 2) / canvas.height, 100 * sw / canvas.width, 100 * sh / canvas.height));
                        selectedImageIndex = imagesToAdd.length - 1;
                        updateHandles();
                        this.redrawCanvas(canvas, context, img, imagesToAdd);
                    });
                });
            });
        });
        let canvas = this.container.querySelector('canvas');
        let context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
    }
    redrawCanvas(canvas, context, originalImage, overlayImages) {
        context.drawImage(originalImage, 0, 0);
        for (let overlayImage of overlayImages) {
            context.drawImage(overlayImage.img, canvas.width * overlayImage.x / 100, canvas.height * overlayImage.y / 100, canvas.width * overlayImage.width / 100, canvas.height * overlayImage.height / 100);
        }
    }
    stop() {
        if (this.webcamStream) {
            let camera = this.container.querySelector('#camera');
            this.webcamStream.getTracks().forEach(track => track.stop());
            if (camera) {
                camera.srcObject = null;
            }
            this.webcamStream = undefined;
        }
    }
    setUploadListener(listener) {
        this.uploadListener = listener;
    }
}
class ImageEffect {
    constructor(img, effectId, x, y, width, height) {
        this.img = img;
        this.effectId = effectId;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>
class AccountCreated {
    constructor() {
        this.template = `
        <div class="content">
            <div class="center-xs">
                <h1>Your account is now created!</h1>
                <div>Please check your email to validate your account.</div>
                <a href="#/">Go to home</a>
            </div>
        </div>
        `;
    }
    activate(router, container) {
        container.innerHTML = this.template;
    }
    disable() { }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>
class AccountValidated {
    constructor() {
        this.template = `
        <div class="content">
            <div class="center-xs">
                <h1>Your account is now validated!</h1>
                <div>You can now login with your account.</div>
                <a href="#/login">Go to login</a>
            </div>
        </div>
        `;
    }
    activate(router, container) {
        container.innerHTML = this.template;
    }
    disable() { }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>
class InvalidToken {
    constructor() {
        this.template = `
        <div class="content">
            <div class="center-xs">
                <h1>This activation link is invalid or has already been used!</h1>
                <a href="#/login">Go to login</a>
            </div>
        </div>
        `;
    }
    activate(router, container) {
        container.innerHTML = this.template;
    }
    disable() { }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiLogin.ts"/>
/// <reference path="../StringHelpers.ts"/>
class Login {
    constructor(navbar, httpRequestFactory) {
        this.navbar = navbar;
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
        <div class="content">
            <div class="row center-xs">
                <div class="col-xs-12 col-sm-8 col-md-6 col-lg-5">
                    <form id="login" class="mini-container">
                        <h1>Login</h1>
                        <div id="invalid-user-password" class="error-message form-element" style="display:none;">Wrong username or password!</div>
                        <div id="email-validation" class="error-message form-element" style="display:none;">You need to validate your account by clicking the link in the mail sent to you e-mail address!</div>
                        <input class="form-element" id="username" type="text" placeholder="Username">
                        <input class="form-element" id="password" type="password" placeholder="Password">
                        <button class="form-element" type="submit">Login</button>
                    </form>
                    <form id="signup" class="mini-container">
                        <h1>Sign up</h1>
                        <input class="form-element" id="susername" type="text" placeholder="Username">
                        <div id="username-used" class="error-message form-element" style="display:none;">Username already used!</div>
                        <input class="form-element" id="semail" type="email" placeholder="E-mail">
                        <div id="email-used" class="error-message form-element" style="display:none;">E-mail already used!</div>
                        <input class="form-element" id="scemail" type="email" placeholder="Confirm e-mail">
                        <div id="email-matching" class="error-message form-element" style="display:none;">E-mail doesn't match!</div>
                        <input class="form-element" id="spassword" type="password" placeholder="Password">
                        <div id="password-security" class="error-message form-element" style="display:none;">Your password must include a lowercase and uppercase character, a number and contains at least 8 characters!</div>
                        <input class="form-element" id="scpassword" type="password" placeholder="Confirm password">
                        <div id="password-matching" class="error-message form-element" style="display:none;">Password doesn't match!</div>
                        <button class="form-element" type="submit">Sign up</button>
                    </form>
                </div>
            </div>
        </div>
        `;
    }
    activate(router, container) {
        if (localStorage.getItem('auth')) {
            window.location.hash = '/settings';
            return;
        }
        container.innerHTML = this.template;
        let apiLogin = new ApiLogin(this.httpRequestFactory);
        let apiRegister = new ApiRegister(this.httpRequestFactory);
        let loginForm = container.querySelector('#login');
        let self = this;
        loginForm.addEventListener('submit', (ev) => {
            let errorInvalidUsernamePassword = loginForm.querySelector('#invalid-user-password');
            let errorMailValidation = loginForm.querySelector('#email-validation');
            errorInvalidUsernamePassword.style.display = errorMailValidation.style.display = 'none';
            let requestToken = {};
            this.requestToken = requestToken;
            apiLogin.login(loginForm.querySelector('#username').value, loginForm.querySelector('#password').value).then((user) => {
                if (requestToken !== this.requestToken) {
                    return;
                }
                if (user.content.result === undefined) {
                    localStorage.setItem('auth', user.content.session_token);
                    self.navbar.login(user);
                    window.location.hash = '/';
                }
                else {
                    switch (user.content.result) {
                        case 'need_validation':
                            errorMailValidation.style.display = 'block';
                            break;
                        case 'invalid_info':
                            errorInvalidUsernamePassword.style.display = 'block';
                            break;
                    }
                }
            });
            ev.preventDefault();
        });
        let signUpForm = container.querySelector('#signup');
        signUpForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            let inputUsername = signUpForm.querySelector('#susername');
            let inputEmail = signUpForm.querySelector('#semail');
            let inputEmailConfirm = signUpForm.querySelector('#scemail');
            let inputPassword = signUpForm.querySelector('#spassword');
            let inputPasswordConfirm = signUpForm.querySelector('#scpassword');
            let errorUsernameUsed = signUpForm.querySelector('#username-used');
            let errorEmailUsed = signUpForm.querySelector('#email-used');
            let errorEmailMatching = signUpForm.querySelector('#email-matching');
            let errorPasswordSecurity = signUpForm.querySelector('#password-security');
            let errorPasswordMatching = signUpForm.querySelector('#password-matching');
            let hasError = false;
            errorUsernameUsed.style.display = errorEmailUsed.style.display = errorEmailMatching.style.display = errorPasswordSecurity.style.display = errorPasswordMatching.style.display = 'none';
            if (inputEmail.value !== inputEmailConfirm.value) {
                hasError = true;
                errorEmailMatching.style.display = 'block';
            }
            if (inputPassword.value !== inputPasswordConfirm.value) {
                hasError = true;
                errorPasswordMatching.style.display = 'block';
            }
            let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
            if (!passwordRegex.test(inputPassword.value)) {
                hasError = true;
                errorPasswordSecurity.style.display = 'block';
            }
            if (hasError)
                return;
            let requestToken = {};
            this.requestToken = requestToken;
            apiRegister.register(inputUsername.value, inputEmail.value, inputPassword.value).then((reponse) => {
                if (requestToken !== this.requestToken) {
                    return;
                }
                switch (reponse.content.result) {
                    case 'username_taken':
                        errorUsernameUsed.style.display = 'block';
                        break;
                    case 'email_taken':
                        errorEmailUsed.style.display = 'block';
                        break;
                    case 'ok':
                        window.location.hash = '/accountCreated';
                        break;
                }
            });
        });
    }
    disable() {
        this.requestToken = null;
    }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>
class ManageTokens {
    constructor(stringHelpers, httpRequestFactory) {
        this.stringHelpers = stringHelpers;
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
        <div class="content">
            <div class="center-xs">
                <div id="tokens"></div>
            </div>
        </div>
        `;
        this.tokenTemplate = `
        <div class="token row" style="margin-bottom: 10px;">
            <div class="userAgent col-xs-6"></div>
            <div class="ip col-xs-3"></div>
            <div class="date col-xs-3"></div>
        </div>
        `;
    }
    activate(router, container) {
        container.innerHTML = this.template;
        let tokensContainer = container.querySelector('#tokens');
        let apiToken = new ApiToken(this.httpRequestFactory);
        apiToken.get().then(response => {
            response.content.tokens.forEach(token => {
                let tokenContainer = document.createElement('div');
                tokenContainer.innerHTML = this.tokenTemplate;
                tokenContainer.querySelector('.userAgent').innerText = token.userAgent;
                tokenContainer.querySelector('.ip').innerText = token.ip;
                let date = this.stringHelpers.parseMySqlDate(token.creationDate);
                tokenContainer.querySelector('.date').innerText = date.toLocaleString();
                tokensContainer.appendChild(tokenContainer.firstElementChild);
            });
        });
    }
    disable() { }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../api/ApiMe.ts"/>
/// <reference path="../api/ApiLogin.ts"/>
/// <reference path="../StringHelpers.ts"/>
class Settings {
    constructor(navbar, httpRequestFactory) {
        this.navbar = navbar;
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
        <div class="content">
            <div class="mini-container center-xs">
                <h1>Profile</h1>
                <div class="separator"></div>
                <div class="setting-parameter">
                    <div>
                        Your username:
                    </div>
                    <div id="your-username"></div>
                </div>
                <div class="setting-parameter">
                    <div>
                        Your e-mail:
                    </div>
                    <div id="your-email"></div>
                </div>
                <div>
                    <label>
                        <input type="checkbox" id="receive-mail"> Receive mail when someone post a comment on my publication
                    </label>
                </div>
                
                <h1>Change username</h1>
                <div class="separator"></div>
                <form id="username-change-form">
                    <input required class="form-element" id="username" type="text" placeholder="Your new username">
                    <div id="username-taken" class="error-message form-element" style="display:none;">Username already taken!</div>
                    <div id="username-invalid" class="error-message form-element" style="display:none;">The username must be at least 3 characters long and not include more than 24 characters!</div>
                    <input required class="form-element" id="u-password" type="password" placeholder="Password">
                    <div id="username-change-password-incorrect" class="error-message form-element" style="display:none;">Password is incorrect!</div>
                    <button class="form-element" type="submit" id="confirm-username-change">Save</button>
                    <div id="username-changed" class="form-element" style="display: none;">Username successfully changed!</div>
                </form>

                <h1>Change e-mail</h1>
                <div class="separator"></div>
                <form id="email-change-form">
                    <input required class="form-element" id="email" type="email" placeholder="Your new e-mail">
                    <div id="email-used" class="error-message form-element" style="display:none;">E-mail already used!</div>
                    <div id="email-format" class="error-message form-element" style="display: none;">Incorrect format of e-mail!</div>
                    <input required class="form-element" id="password" type="password" placeholder="Password">
                    <div id="email-change-password-incorrect" class="error-message form-element" style="display:none;">Password is incorrect!</div>
                    <button class="form-element" type="submit" id="confirm-email-change">Save</button>
                    <div id="email-changed" class="form-element" style="display: none;">E-mail successfully changed!</div>
                </form>

                <h1>Change password</h1>
                <div class="separator"></div>
                <form id="password-change-form">
                    <input required class="form-element" id="new-password" type="password" placeholder="New password">
                    <div id="password-security" class="error-message form-element" style="display:none;">Your password must include a lowercase and uppercase character, a number and contains at least 8 characters!</div>
                    <input required class="form-element" id="new-password-repeat" type="password" placeholder="Confirm new password">
                    <div id="password-matching" class="error-message form-element" style="display:none;">Password doesn't match!</div>
                    <input required class="form-element" id="old-password" type="password" placeholder="Old password">
                    <div id="password-change-password-incorrect" class="error-message form-element" style="display:none;">Password is incorrect!</div>
                    <div id="password-changed" class="form-element" style="display: none;">Password successfully changed!</div>
                    <button class="form-element" type="submit" id="confirm-password-change">Save</button>
                </form>
            </div>
        </div>
        `;
    }
    activate(router, container) {
        container.innerHTML = this.template;
        let apiSettings = new ApiSettings(this.httpRequestFactory);
        this.loadUserInfos(container);
        container.querySelector('#receive-mail')
            .addEventListener('change', (event) => {
            apiSettings.setMailNotification(event.target.checked)
                .then(() => {
                this.loadUserInfos(container);
            }, () => {
                this.loadUserInfos(container);
            });
        });
        let changingUsername = false;
        container.querySelector('#username-change-form')
            .addEventListener('submit', (event) => {
            event.preventDefault();
            if (changingUsername) {
                return;
            }
            let usernameInput = container.querySelector('#username');
            let passwordInput = container.querySelector('#u-password');
            let usernameTakenError = container.querySelector('#username-taken');
            let usernameInvalidError = container.querySelector('#username-invalid');
            let passwordError = container.querySelector('#username-change-password-incorrect');
            let usernameChangedMessage = container.querySelector('#username-changed');
            usernameTakenError.style.display = 'none';
            usernameInvalidError.style.display = 'none';
            passwordError.style.display = 'none';
            usernameChangedMessage.style.display = 'none';
            if (usernameInput.value == null || usernameInput.value.length < 3 || usernameInput.value.length > 24) {
                usernameInvalidError.style.display = 'block';
                return;
            }
            changingUsername = true;
            apiSettings.setUsername(usernameInput.value, passwordInput.value).then(() => {
                changingUsername = false;
                usernameInput.value = '';
                passwordInput.value = '';
                usernameChangedMessage.style.display = 'block';
                this.loadUserInfos(container);
                this.navbar.refreshUsername();
            }, (response) => {
                changingUsername = false;
                switch (response.content.result) {
                    case 'invalid_password':
                        passwordError.style.display = 'block';
                        break;
                    case 'invalid_username':
                        usernameInvalidError.style.display = 'block';
                        break;
                    case 'username_taken':
                        usernameTakenError.style.display = 'block';
                        break;
                }
            });
        });
        let changingMail = false;
        container.querySelector('#email-change-form')
            .addEventListener('submit', (event) => {
            event.preventDefault();
            if (changingMail) {
                return;
            }
            let emailInput = container.querySelector('#email');
            let passwordInput = container.querySelector('#password');
            let emailFormatError = container.querySelector('#email-format');
            let emailTakenError = container.querySelector('#email-used');
            let passwordError = container.querySelector('#email-change-password-incorrect');
            let emailChangedMessage = container.querySelector('#email-changed');
            emailFormatError.style.display = 'none';
            emailTakenError.style.display = 'none';
            passwordError.style.display = 'none';
            emailChangedMessage.style.display = 'none';
            changingMail = true;
            apiSettings.setMail(emailInput.value, passwordInput.value).then(() => {
                changingMail = false;
                emailInput.value = '';
                passwordInput.value = '';
                emailChangedMessage.style.display = 'block';
                this.loadUserInfos(container);
            }, (response) => {
                changingMail = false;
                switch (response.content.result) {
                    case 'invalid_email':
                        emailFormatError.style.display = 'block';
                        break;
                    case 'invalid_password':
                        passwordError.style.display = 'block';
                        break;
                    case 'email_taken':
                        emailTakenError.style.display = 'block';
                        break;
                }
            });
        });
        let changingPassword = false;
        container.querySelector('#password-change-form')
            .addEventListener('submit', (event) => {
            event.preventDefault();
            if (changingPassword) {
                return;
            }
            let newPasswordInput = container.querySelector('#new-password');
            let newPasswordRepeatInput = container.querySelector('#new-password-repeat');
            let oldPasswordInput = container.querySelector('#old-password');
            let passwordSecurityError = container.querySelector('#password-security');
            let passwordMatchingError = container.querySelector('#password-matching');
            let passwordError = container.querySelector('#password-change-password-incorrect');
            let passwordChangedMessage = container.querySelector('#password-changed');
            passwordSecurityError.style.display = 'none';
            passwordMatchingError.style.display = 'none';
            passwordError.style.display = 'none';
            passwordChangedMessage.style.display = 'none';
            let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
            if (!passwordRegex.test(newPasswordInput.value)) {
                passwordSecurityError.style.display = 'block';
                return;
            }
            if (newPasswordInput.value !== newPasswordRepeatInput.value) {
                passwordMatchingError.style.display = 'block';
                return;
            }
            changingPassword = true;
            apiSettings.setPassword(oldPasswordInput.value, newPasswordInput.value).then(() => {
                changingPassword = false;
                newPasswordInput.value = '';
                newPasswordRepeatInput.value = '';
                oldPasswordInput.value = '';
                passwordChangedMessage.style.display = 'block';
                this.loadUserInfos(container);
            }, (response) => {
                changingPassword = false;
                switch (response.content.result) {
                    case 'insecure_new_password':
                        passwordSecurityError.style.display = 'block';
                        break;
                    case 'invalid_password':
                        passwordError.style.display = 'block';
                        break;
                }
            });
        });
    }
    loadUserInfos(container) {
        let apiMe = new ApiMe(this.httpRequestFactory);
        apiMe.get().then((me) => {
            if (me.content.result === 'not_connected') {
                localStorage.removeItem('auth');
                window.location.hash = '/login';
            }
            else {
                container.querySelector('#your-username').innerHTML = me.content.username;
                container.querySelector('#your-email').innerHTML = me.content.email;
                container.querySelector('#receive-mail').checked = me.content.sendMailOnComment == 1;
            }
        });
    }
    disable() { }
}
/// <reference path="../Router.ts"/>
/// <reference path="./IController.ts"/>
/// <reference path="../StringHelpers.ts"/>
class Take {
    constructor(httpRequestFactory) {
        this.httpRequestFactory = httpRequestFactory;
        this.template = `
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
        this.postTemplate = `
        <div class="col-xs-6 col-sm-4 col-md-6">
            <a href="#/post?id={postId}" class="post-card-image" style="background-image: url(./usr/{fileName})"></a>
        </div>
        `;
        this.notConnectedTemplate = `
        <div class="content">
            <div class="center-xs">
                <h1>You are not connected, please login to take pictures!</h1>
                <a href="#/login">Go to login</a>
            </div>
        </div>
        `;
    }
    activate(router, container) {
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
            }
            else {
                container.innerHTML = this.notConnectedTemplate;
            }
        });
    }
    loadLastPosts(container, userId) {
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
class ModalService {
    constructor(modalContainer) {
        this.modalContainer = modalContainer;
    }
    show(controller) {
        if (this.currentModal) {
            this.currentModal.dismiss(this.currentModal.dimissToken);
            this.currentModal = undefined;
            this.modalContainer.innerHTML = '';
        }
        let dismissToken = {};
        let promise = new Promise((resolve, reject) => {
            document.body.style.overflow = 'hidden';
            this.modalContainer.classList.add('visible');
            this.currentModal = {
                promise: null,
                dismiss: reject,
                dimissToken: dismissToken
            };
            controller(this.modalContainer, resolve, reject);
        });
        this.currentModal.promise = promise;
        let after = (arg) => {
            if (arg !== dismissToken) {
                this.currentModal = undefined;
                document.body.style.overflow = '';
                this.modalContainer.classList.remove('visible');
                this.modalContainer.innerHTML = '';
            }
        };
        promise.then(after, after);
        return promise;
    }
}
//# sourceMappingURL=script.js.map