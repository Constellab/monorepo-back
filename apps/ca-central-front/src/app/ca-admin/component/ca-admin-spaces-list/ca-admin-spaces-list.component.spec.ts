import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminSpacesListComponent} from './ca-admin-spaces-list.component';

describe('CaAdminSpacesListComponent', () => {
  let component: CaAdminSpacesListComponent;
  let fixture: ComponentFixture<CaAdminSpacesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminSpacesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminSpacesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
