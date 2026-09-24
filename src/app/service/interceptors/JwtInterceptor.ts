import {HttpHandlerFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {AccountService} from "../account.service";
import {environment} from "../../../environments/environment";

export function JwtInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const account = inject(AccountService);
  if (account.login()) {
    if (req.url.startsWith(environment.server) ||
      req.url.startsWith(environment.account) ||
      req.url.startsWith(environment.storage)
    ) {
      const newReq = req.clone({
        headers: req.headers.append('Authorization', 'Bearer ' + account.developer().token),
      });
      return next(newReq);
    }
  }

  return next(req);
}
