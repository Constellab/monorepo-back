import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbAdminPageComponent} from './ca-smart-db-admin-page.component';

describe('CaSmartDbAdminPageComponent', () => {
  let component: CaSmartDbAdminPageComponent;
  let fixture: ComponentFixture<CaSmartDbAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbAdminPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
