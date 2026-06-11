import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse} from "@angular/common/http";
import {catchError, from, map, Observable, switchMap, throwError, EMPTY} from "rxjs";
import {JoyResponse} from "../response/JoyResponse";

export function JoyHttpInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // 克隆请求并设置withCredentials为true
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    map((event: HttpEvent<unknown>) => {
      if (event instanceof HttpResponse) {
        console.log('url: ', event.url);

        if (event.url?.endsWith('.html')) {
          return event;
        }

        if (event.url?.endsWith('.md')) {
          return event;
        }

        if (event.url?.endsWith('.json')) {
          return event;
        }

        const body = event.body as JoyResponse;
        if (body) {
          if (body.code !== 'SUCCESS') {
            throw new Error(body.message);
          }
        }
      }

      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('请求出错: ', error);
      return throwError(() => error);
    }));
}
