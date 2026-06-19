import {Injectable} from "@angular/core";
import {OnOrganizationChanged} from "../typedef/define/listener/OnOrganizationChanged";
import {Developer} from '../typedef/define/developer/Developer';
import {DeveloperCodec} from '../typedef/codec/developer/DeveloperCodec';
import {Organization} from '../typedef/define/developer/Organization';
import {NamespaceDefinition} from '@openxiot/xiot-core-spec-ts';
import {MainService} from './main.service';
import {NzMessageService} from 'ng-zorro-antd/message';

@Injectable({providedIn: 'root'})
export class AccountService {

  private listeners: Map<string, OnOrganizationChanged> = new Map();

  public loading: boolean = false;
  public organizations: Organization[] = [];
  public login: boolean = false;
  public developer: Developer = new Developer();
  public organization!: Organization;
  public ns!: NamespaceDefinition;

  constructor(
    private main: MainService,
    private msg: NzMessageService,
  ) {
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
    if (this.organization) {
      return this.ns.organization === this.organization.id
    }

    return false;
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

  public loadOrganizations() {
    if (this.login) {
      this.main.getOrganizations()
        .subscribe({
          next: data => {
            this.organizations = data;
            this.selectCurrentOrganization();
            this.loading = false;
          },
          error: error => {
            this.msg.warning(error);
          }
        })
    }
  }

  private selectCurrentOrganization() {
    const selected = localStorage.getItem("organizationId") || null;
    if (selected !== null) {
      const org = this.organizations.find(x => x.id === selected);
      if (org) {
        this.setOrganization(org);
      }
    } else {
      if (this.organizations.length > 0) {
        const org = this.organizations[0];
        this.setOrganization(org);
      }
    }
  }
}
