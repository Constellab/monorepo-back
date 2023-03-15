import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaLabInstanceGlobalStatusComponent } from './ca-lab-instance-global-status.component';

describe('CaLabInstanceGlobalStatusComponent', () => {
  let component: CaLabInstanceGlobalStatusComponent;
  let fixture: ComponentFixture<CaLabInstanceGlobalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceGlobalStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceGlobalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
