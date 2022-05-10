import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaGroupAddUserDialogComponent} from './ca-group-add-user-dialog.component';

describe('CaGroupAddUserDialogComponent', () => {
  let component: CaGroupAddUserDialogComponent;
  let fixture: ComponentFixture<CaGroupAddUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaGroupAddUserDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaGroupAddUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
