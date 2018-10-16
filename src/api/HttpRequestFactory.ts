/// <reference path="./HttpRequest.ts"/>
/// <reference path="./HttpInterceptor.ts"/>
class HttpRequestFactory {
    private interceptors: HttpInterceptor[] = [];

    createRequest(url: string) {
        return new HttpRequest(url, this.interceptors);
    }

    registerInterceptor(interceptor: HttpInterceptor) {
        this.interceptors.push(interceptor);
    }
}