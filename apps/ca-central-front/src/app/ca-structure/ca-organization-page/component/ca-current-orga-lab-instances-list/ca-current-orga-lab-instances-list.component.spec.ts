import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentOrgaLabInstancesListComponent} from './ca-current-orga-lab-instances-list.component';

describe('CaCurrentOrgaLabInstancesListComponent', () => {
  let component: CaCurrentOrgaLabInstancesListComponent;
  let fixture: ComponentFixture<CaCurrentOrgaLabInstancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentOrgaLabInstancesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentOrgaLabInstancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
