import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceLabInstancesPageComponent} from './ca-current-space-lab-instances-page.component';

describe('CaCurrentSpaceLabInstancesPageComponent', () => {
  let component: CaCurrentSpaceLabInstancesPageComponent;
  let fixture: ComponentFixture<CaCurrentSpaceLabInstancesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceLabInstancesPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceLabInstancesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
