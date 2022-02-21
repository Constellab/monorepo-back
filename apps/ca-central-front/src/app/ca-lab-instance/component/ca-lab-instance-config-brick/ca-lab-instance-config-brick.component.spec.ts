import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceConfigBrickComponent} from './ca-lab-instance-config-brick.component';

describe('LabInstanceConfigBrickComponent', () => {
  let component: CaLabInstanceConfigBrickComponent;
  let fixture: ComponentFixture<CaLabInstanceConfigBrickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceConfigBrickComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceConfigBrickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
