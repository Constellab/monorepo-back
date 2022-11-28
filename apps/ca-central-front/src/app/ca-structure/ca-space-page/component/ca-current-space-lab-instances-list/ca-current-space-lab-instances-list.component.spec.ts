import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceLabInstancesListComponent} from './ca-current-space-lab-instances-list.component';

describe('CaCurrentSpaceLabInstancesListComponent', () => {
  let component: CaCurrentSpaceLabInstancesListComponent;
  let fixture: ComponentFixture<CaCurrentSpaceLabInstancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceLabInstancesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceLabInstancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
