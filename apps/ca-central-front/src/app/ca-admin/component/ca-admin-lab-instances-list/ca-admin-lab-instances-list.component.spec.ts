import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaAdminLabInstancesListComponent} from './ca-admin-lab-instances-list.component';

describe('AdminLabInstancesListComponent', () => {
  let component: CaAdminLabInstancesListComponent;
  let fixture: ComponentFixture<CaAdminLabInstancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaAdminLabInstancesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaAdminLabInstancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
