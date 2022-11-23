import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminPageComponent} from './ca-admin-page.component';

describe('CaAdminPageComponent', () => {
  let component: CaAdminPageComponent;
  let fixture: ComponentFixture<CaAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
