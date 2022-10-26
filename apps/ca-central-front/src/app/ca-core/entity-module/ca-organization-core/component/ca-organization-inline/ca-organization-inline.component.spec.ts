import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaOrganizationInlineComponent} from './ca-organization-inline.component';

describe('CaOrganizationInlineComponent', () => {
  let component: CaOrganizationInlineComponent;
  let fixture: ComponentFixture<CaOrganizationInlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaOrganizationInlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaOrganizationInlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
