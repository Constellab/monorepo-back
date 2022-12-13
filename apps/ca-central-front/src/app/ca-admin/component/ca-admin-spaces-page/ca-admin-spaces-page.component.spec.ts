import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminSpacesPageComponent} from './ca-admin-spaces-page.component';

describe('CaAdminSpacesPageComponent', () => {
  let component: CaAdminSpacesPageComponent;
  let fixture: ComponentFixture<CaAdminSpacesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminSpacesPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminSpacesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
