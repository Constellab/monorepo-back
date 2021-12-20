import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganisationFormComponent} from './ca-organisation-form.component';

describe('OrganisationFormComponent', () => {
  let component: CaOrganisationFormComponent;
  let fixture: ComponentFixture<CaOrganisationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganisationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaOrganisationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
