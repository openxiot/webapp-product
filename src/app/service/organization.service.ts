import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  code = new BehaviorSubject<string>('jd');
  data$: Observable<string> = this.code.asObservable();

  constructor() {
    const code = localStorage.getItem('organization');
    console.log('init organization: ' + code);
  }

  update(value: string) {
    localStorage.setItem('organization', value);
    this.code.next(value);
  }
}
