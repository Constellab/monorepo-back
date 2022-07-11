import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {marked} from 'marked';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {ClStringHelper, ClYoutubeHelper} from '@monorepo/core-lib';

@Pipe({
  name: 'tdMarkdown'
})
export class TdMarkdownPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    if (!value) return null;
    const renderer = new marked.Renderer();

    const iframes: Record<string, string> = {};

    renderer.image = (href: string, title: string, text: string) => {
      if (href === null) {
        return text;
      }

      let out: string = '';

      if(ClYoutubeHelper.isYoutubeVideoUrl(href)){
        const embedHref: SafeResourceUrl = ClYoutubeHelper.convertToEmbedUrl(href);
        // eslint-disable-next-line max-len
        let iframe: string = `<div class="iframe-div"><iframe src="${embedHref}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen property="binding"`;
        if (title) {
          iframe += ` title="${title}">`;
        } else {
          iframe += '>';
        }
        iframe += '</iframe></div>';
        const id: string = ClStringHelper.generateUUID();
        iframes[id] = iframe;
        out += id;
      } else {
        out += `<img src="${href}" alt="${text}"`;
        if (title) {
          out += ` title="${title}"`;
        }
        out += '>';
      }
      return out;
    }

    //return this.domSanitizer.sanitize(SecurityContext.NONE, marked.parse(value, {renderer: renderer}));
    const parsedDoc: string = marked.parse(value, {renderer: renderer});
    let safeDoc: string = this.domSanitizer.sanitize(SecurityContext.HTML, parsedDoc);
    for(const key of Object.keys(iframes)){
      safeDoc = safeDoc.replace(key,
        this.domSanitizer.sanitize(SecurityContext.RESOURCE_URL, this.domSanitizer.bypassSecurityTrustResourceUrl(iframes[key])))
    }
    return this.domSanitizer.bypassSecurityTrustHtml(safeDoc);
  }
}
