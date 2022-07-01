import {Injectable} from '@angular/core';
import {
  FlDialogService,
  FlOverlayRef,
  FlPortalConfig,
  FlPortalService,
  FlQuillConfig,
  FlTextEditorBlockAddButton,
  FlTextEditorConfig,
  FlTextEditorImageLoader,
  FlTextEditorState
} from '@monorepo/front-core-lib';
import {HaDocumentationService} from '../../../ha-core/ha-service/ha-documentation.service';
import {HaPublicFindDocComponent} from './ha-public-find-doc/ha-public-find-doc.component';
import {HaDocumentationSearchDTO} from '../../../ha-core/ha-model/ha-entities/ha-documentation.class';
import {environment} from '../../../../environments/ha-environment';

/**
 * Config for the text editor in the report
 */
@Injectable({providedIn: 'root'})
export class HaDocTextEditorConfig extends FlTextEditorConfig implements FlTextEditorImageLoader {

  private overlayRef: FlOverlayRef;

  constructor(private brickName: string,
              private major: string,
              private documentationName: string,
              private docService: HaDocumentationService,
              private dialogService: FlDialogService,
              private portalService: FlPortalService) {
    super();
  }

  getToolbarConfig(): any {
    return FlQuillConfig.completeToolbarConfig;
  }

  getBlockAddButtons(state: FlTextEditorState): FlTextEditorBlockAddButton[] {
    return [
      {
        icon: 'image', type: 'fileExplorer',
        onAction: file => this.insertImageFromFile(file, state)
      },
      {
        icon: 'add_link', type: 'button',
        onAction: () => this.openSelectDocView(state)
      },
      this.getCodeBlockAddButton(state),
      this.getHintBlockAddButton(state),
      this.getVideoAddButton(state, this.dialogService),
    ];
  }

  public insertImageFromFile(file: File, textEditorState: FlTextEditorState): void {
    const index = textEditorState.getCurrentSelectionIndex();
    this.docService.uploadImage(file).subscribe(
      fileUrl => textEditorState.insertImageFromUrl(fileUrl, index)
    );
  }

  private openSelectDocView(textEditorState: FlTextEditorState): void {
    const portalConfig: FlPortalConfig = this.portalService.configureAbsolutePortal(
      {centerHorizontally: '0', top: '20%'},
      {
        disposeOnBackdropClick: true
      });

    const config: any = {
      brickName: this.brickName,
      major: this.major
    }

    this.overlayRef = this.portalService.createPortal(HaPublicFindDocComponent, portalConfig, config);
    this.overlayRef.detachments().subscribe((documentation: HaDocumentationSearchDTO) => {
      if (documentation) {
        this.documentationLink(textEditorState, documentation);
      }
    });
  }

  private documentationLink(textEditorState: FlTextEditorState, doc: HaDocumentationSearchDTO): void {
    const index: number = textEditorState.getCurrentSelectionIndex();
    const value: string = doc.anchor ?
      `${environment.hubUrl}bricks/${doc.brickName}/v${doc.major}/doc/${doc.completePath.slice(0, -1)}#${doc.anchor}`
      : `${environment.hubUrl}bricks/${doc.brickName}/v${doc.major}/doc/${doc.completePath}`;
    const name: string = doc.anchor ?
      (doc.name === this.documentationName ? doc.anchor : `${doc.name} > ${doc.anchor}`)
      : doc.name;
    textEditorState.insertLink(index, value, name);
  }

  //
  // private insertLink(textEditorState: FlTextEditorState, link)

  public getImageUrl(filename: string): string {
    return this.docService.getImageUrl(filename);
  }
}
