import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaUpdateProjectLeaderDialogComponent} from './ca-update-project-leader-dialog.component';

describe('CaUpdateProjectLeaderDialogComponent', () => {
  let component: CaUpdateProjectLeaderDialogComponent;
  let fixture: ComponentFixture<CaUpdateProjectLeaderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaUpdateProjectLeaderDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaUpdateProjectLeaderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
