class HttpRequest {
    constructor(private url: string, private interceptors: HttpInterceptor[]) { }

    delete(queryParams: any, success: (HttpResponse) => void, error: (HttpResponse) => void) : void {
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
                } else {
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
                } else {
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

    get(queryParams: any, success: (HttpResponse) => void, error: (HttpResponse) => void) : void {
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
                } else {
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
                } else {
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

    post(queryParams: any, body: any, success: (response: HttpResponse) => void, error: (response: HttpResponse) => void, progress: (ev: ProgressEvent) => void) : void {
        var xhr = new XMLHttpRequest();

        if (progress){
            xhr.upload.addEventListener('progress', (ev: ProgressEvent) => { progress(ev); })
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
                } else {
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
                } else {
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

    postFormData(queryParams: any, body: any, success: (HttpResponse) => void, error: (HttpResponse) => void, progress: (ev: ProgressEvent) => void) : void {
        var xhr = new XMLHttpRequest();

        if (progress){
            xhr.upload.addEventListener('progress', (ev: ProgressEvent) => { progress(ev); })
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
                } else {
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
                } else {
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

    put(queryParams: any, body: any, success: (HttpResponse) => void, error: (HttpResponse) => void, progress: (ev: ProgressEvent) => void) : void {
        var xhr = new XMLHttpRequest();

        if (progress){
            xhr.upload.addEventListener('progress', (ev: ProgressEvent) => { progress(ev); })
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
                } else {
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
                } else {
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
    constructor(public content: any, public status: number) { }
}