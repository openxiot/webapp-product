export class OrganizationMember {
  developerId: string = '';
  role: string = '';
  name: string = '';
  update: Date = new Date();
}

export class Organization {
  id: string = '';
  name: string = '';
  creator: string = '';
  creatorName: string = '';
  createAt: Date = new Date();
  members: OrganizationMember[] = [];
  personal: boolean = false;
  _role: string = 'member';
}
