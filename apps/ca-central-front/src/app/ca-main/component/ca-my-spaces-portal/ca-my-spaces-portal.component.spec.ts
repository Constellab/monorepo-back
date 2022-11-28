import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMySpacesPortalComponent} from './ca-my-spaces-portal.component';

describe('CaMySpacesPortalComponent', () => {
  let component: CaMySpacesPortalComponent;
  let fixture: ComponentFixture<CaMySpacesPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMySpacesPortalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaMySpacesPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
