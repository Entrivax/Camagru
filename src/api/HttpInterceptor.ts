class HttpInterceptor {
    onRequest: (url: string, queryParams: any, xhr: XMLHttpRequest) => void = null;
    onResponseSuccess: (url: string, response: HttpResponse, xhr: XMLHttpRequest) => void = null;
    onResponseError: (url: string, response: HttpResponse, xhr: XMLHttpRequest) => void = null;
}