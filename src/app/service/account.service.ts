import {Injectable} from "@angular/core";
import {OnOrganizationChanged} from "../typedef/define/listener/OnOrganizationChanged";
import {Developer} from '../typedef/define/developer/Developer';
import {DeveloperCodec} from '../typedef/codec/developer/DeveloperCodec';

@Injectable({providedIn: 'root'})
export class AccountService {

  private listeners: Map<string, OnOrganizationChanged> = new Map();
  public organizationId: string = '';
  public organizationValid: boolean = false;
  public developer: Developer = new Developer();
  public login: boolean = false;

  constructor() {
    const organization = localStorage.getItem("organizationId") || null;
    if (organization !== null) {
      this.organizationId = organization;
    }

    const a = localStorage.getItem("developer") || null;
    if (a !== null) {
      this.developer = DeveloperCodec.decode(JSON.parse(a));
      this.login = true;
    }

    console.info('AccountService Constructed: ', this.developer);
    console.info('developer.avatar: ' + this.developer.avatar);
  }

  addOrganizationListener(id: string, listener: OnOrganizationChanged) {
    this.listeners.set(id, listener);
  }

  setOrganizationId(organizationId: string) {
    if (this.organizationId !== organizationId) {
      console.log("setOrganizationId: " + organizationId);

      localStorage.setItem("organizationId", organizationId);
      this.organizationId = organizationId;

      for (let listener of this.listeners.values()) {
        listener.onOrganizationChanged(organizationId);
      }
    } else {
      console.log('setOrganizationId: not changed');
    }
  }

  setDeveloper(developer: Developer) {
    console.log("setDeveloper: ", developer);
    localStorage.setItem("developer", DeveloperCodec.encode(developer));
    this.developer = developer;
    this.login = true;
  }

  clear() {
    console.log("clear");
    localStorage.clear();
    this.login = false;
  }
}
