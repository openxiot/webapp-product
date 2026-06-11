import {OSSUpload} from '../../define/upload/OSSUpload';

export class OSSUploadCodec {

  static decode(o: any): OSSUpload {
    if (o) {
      const upload = o.upload || ''
      const download = o.download || ''
      return new OSSUpload(upload, download);
    }

    return new OSSUpload();
  }
}
