import {Injectable} from "@angular/core";
import {OnOrganizationChanged} from "../typedef/define/listener/OnOrganizationChanged";
import {Developer} from '../typedef/define/developer/Developer';
import {DeveloperCodec} from '../typedef/codec/developer/DeveloperCodec';
import {Organization} from '../typedef/define/developer/Organization';
import {NamespaceDefinition} from '@openxiot/xiot-core-spec-ts';

@Injectable({providedIn: 'root'})
export class AccountService {

  private listeners: Map<string, OnOrganizationChanged> = new Map();

  public login: boolean = false;
  public developer: Developer = new Developer();
  public organization!: Organization;
  public ns!: NamespaceDefinition;

  constructor() {
    // const organization = localStorage.getItem("organizationId") || null;
    // if (organization !== null) {
    //   this.organizationId = organization;
    // }

    const a = localStorage.getItem("developer") || null;
    if (a !== null) {
      this.developer = DeveloperCodec.decode(JSON.parse(a));
      this.login = true;
    }

    console.info('AccountService Constructed: ', this.developer);
    console.info('developer.avatar: ' + this.developer.avatar);
  }

  isEditable(): boolean {
    return this.ns.organization === this.organization.id
  }

  isCurrentOrganization(organization: Organization): boolean {
    if (this.organization) {
      return this.organization.id === organization.id;
    }

    return false;
  }

  addOrganizationListener(id: string, listener: OnOrganizationChanged) {
    this.listeners.set(id, listener);
  }

  setOrganization(organization: Organization) {
    if (this.isOrganizationChanged(organization)) {
      localStorage.setItem("organizationId", organization.id);

      this.organization = organization;
      for (let listener of this.listeners.values()) {
        listener.onOrganizationChanged(this.organization.id);
      }
    }
  }

  private isOrganizationChanged(organization: Organization): boolean {
      if (this.organization) {
        return this.organization.id !== organization.id;
      } else {
        return true;
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
