import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {Observable, of} from 'rxjs';
import {CaBrickVersion} from '../../../../model/entities/ca-brick.class';
import {CaBrickService} from '../../../../service-api/ca-brick.service';
import {map} from 'rxjs/operators';
import {CmVersion} from '@monorepo/common-model';

/**
 * Automatically search for available brick version and use version string as value
 */
@Component({
  selector: 'ca-brick-version-select-options',
  templateUrl: './ca-brick-version-select-options.component.html',
  styleUrls: ['./ca-brick-version-select-options.component.scss']
})
export class CaBrickVersionSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  @Input() set brickName(brickName: string) {
    this.loadVersions(brickName);
  }

  /**
   * If provided only the version higher or equal than this version are shown
   */
  @Input() minVersion?: string;

  versions$: Observable<CaBrickVersion[]>;

  constructor(@Host() private select: MatSelect,
              private brickService: CaBrickService) {
    super(select);
  }

  ngOnInit(): void {
  }

  private loadVersions(brickName: string): void {
    if (brickName) {
      this.versions$ = this.brickService.getBrickVersions(brickName).pipe(
        map(brickVersions => this.filterVersions(brickVersions))
      );
    } else {
      this.versions$ = of([]);
    }
  }

  private filterVersions(brickVersions: CaBrickVersion[]): CaBrickVersion[] {
    if (this.minVersion == null) return brickVersions;

    const minVersion = CmVersion.fromString(this.minVersion);

    return brickVersions.filter(brickVersion => brickVersion.isEqualOrHigher(minVersion));
  }


  ngAfterViewInit(): void {
    this.initOptions();
  }


}
