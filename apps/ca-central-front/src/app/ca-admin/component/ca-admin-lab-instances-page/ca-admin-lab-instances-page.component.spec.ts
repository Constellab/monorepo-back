import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminLabInstancesPageComponent} from './ca-admin-lab-instances-page.component';

describe('CaAdminLabInstancesPageComponent', () => {
  let component: CaAdminLabInstancesPageComponent;
  let fixture: ComponentFixture<CaAdminLabInstancesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminLabInstancesPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaAdminLabInstancesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
