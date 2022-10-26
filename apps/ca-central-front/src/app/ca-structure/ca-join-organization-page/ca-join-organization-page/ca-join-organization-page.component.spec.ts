import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaJoinOrganizationPageComponent} from './ca-join-organization-page.component';

describe('CaJoinOrganizationPageComponent', () => {
  let component: CaJoinOrganizationPageComponent;
  let fixture: ComponentFixture<CaJoinOrganizationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaJoinOrganizationPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaJoinOrganizationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
