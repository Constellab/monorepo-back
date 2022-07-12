import {Pipe, PipeTransform, SecurityContext} from '@angular/core';
import {marked} from 'marked';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ClStringHelper, ClYoutubeHelper} from '@monorepo/core-lib';
import {objectKeys} from 'codelyzer/util/objectKeys';

@Pipe({
  name: 'tdMarkdown'
})
export class TdMarkdownPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    const renderer = new marked.Renderer();

    const iframes: Record<string, string> = {};

    renderer.image = (href: string, title: string, text: string) => {
      if (href === null) {
        return text;
      }

      let out: string = '';

      if(ClYoutubeHelper.isYoutubeVideoUrl(href)){
        const embedHref: string = ClYoutubeHelper.convertToEmbedUrl(href);
        // eslint-disable-next-line max-len
        let iframe: string = `<div class="iframe-div"><iframe src="${embedHref}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen`;
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
    for(const key of objectKeys(iframes)){
      safeDoc = safeDoc.replace(key, iframes[key]);
    }
    return this.domSanitizer.bypassSecurityTrustHtml(safeDoc);
  }
}
