import {Component, ElementRef, Input, model, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

// todo: 需要废弃的组件
@Component({
  selector: 'control-page',
  templateUrl: './control-page.component.html',
  styleUrl: './control-page.component.less',
  standalone: true,
})
export class ControlPageComponent implements OnInit {

  @Input() url: string = 'https://test/mobile_1.html';

  @ViewChild('iframeContainer', { static: true }) iframeContainer!: ElementRef;
  iframeSrc: SafeResourceUrl = '';

  constructor(
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadHtmlInIframe();
  }

  // 使用iframe加载HTML文件
  loadHtmlInIframe() {
    console.log('loadHtmlInIframe: ', this.url);
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  protected onIframeLoad() {
    console.log('onIframeLoad');
  }
}
