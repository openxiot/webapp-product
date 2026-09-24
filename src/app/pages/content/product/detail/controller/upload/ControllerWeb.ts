export class ControllerWeb {

  constructor(
    public url?: string,
    public format: string = 'html',
    public fileName: string = '',
    public fileSize: number = 0,
  ) {
  }
}