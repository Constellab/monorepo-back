import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {MatSelect} from '@angular/material/select';
import {mergeMap, Observable, of} from 'rxjs';
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
  @Input() minVersion$?: Observable<string>;

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
        mergeMap(brickVersions => this.filterVersionObservable(brickVersions))
      );
    } else {
      this.versions$ = of([]);
    }
  }

  private filterVersionObservable(brickVersions: CaBrickVersion[]): Observable<CaBrickVersion[]> {
    if (this.minVersion$ == null) return of(brickVersions);

    return this.minVersion$.pipe(
      map(minVersion => this.filterVersions(brickVersions, minVersion))
    );
  }

  private filterVersions(brickVersions: CaBrickVersion[], minVersion?: string): CaBrickVersion[] {
    if (minVersion == null) return brickVersions;

    const minVersionObj = CmVersion.fromString(minVersion);

    return brickVersions.filter(brickVersion => brickVersion.isEqualOrHigher(minVersionObj));
  }


  ngAfterViewInit(): void {
    this.initOptions();
  }


}
