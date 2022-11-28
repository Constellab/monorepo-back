import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceTeamsListComponent} from './ca-current-space-teams-list.component';

describe('CaCurrentSpaceTeamsListComponent', () => {
  let component: CaCurrentSpaceTeamsListComponent;
  let fixture: ComponentFixture<CaCurrentSpaceTeamsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceTeamsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceTeamsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
