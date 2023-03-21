import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaCommunityHelper} from '../../../ca-core/utils/ca-community.helper';
import {FlClipboardService, FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Dialog to show information about the codelab of a lab instance
 */
@Component({
  selector: 'ca-lab-instance-codelab-info',
  templateUrl: './ca-lab-instance-codelab-info.component.html',
  styleUrls: ['./ca-lab-instance-codelab-info.component.scss']
})
export class CaLabInstanceCodelabInfoComponent implements OnInit {

  labInstance: CaLabInstance;

  codelabUrl: string;
  communityHelpUrl = CaCommunityHelper.getDevEnvironmentUrl();

  showCodeLabToken = false;

  constructor(@Inject(MAT_DIALOG_DATA) labInstance: CaLabInstance,
              private clipboardService: FlClipboardService,
              private snackBarService: FlSnackBarService) {
    this.labInstance = labInstance;
  }

  ngOnInit(): void {
    // eslint-disable-next-line max-len
    this.codelabUrl = `https://codelab.${this.labInstance.virtualHost}/?folder=/lab/user`;
  }

  copyToTokenToClipboard(): void {
    const result = this.clipboardService.copy(this.labInstance.codelabToken);
    if (result) {
      this.snackBarService.openSuccessMessage({text: 'codelab_token_copied', translateText: true});
    }
  }

  toggleShowCodeLabToken(): void {
    this.showCodeLabToken = !this.showCodeLabToken;
  }
}
