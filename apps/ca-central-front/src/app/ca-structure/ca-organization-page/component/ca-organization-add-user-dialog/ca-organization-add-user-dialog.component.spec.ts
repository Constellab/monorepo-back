import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationAddUserDialogComponent} from './ca-organization-add-user-dialog.component';

describe('CaOrganizationAddUserDialogComponent', () => {
  let component: CaOrganizationAddUserDialogComponent;
  let fixture: ComponentFixture<CaOrganizationAddUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationAddUserDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganizationAddUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
