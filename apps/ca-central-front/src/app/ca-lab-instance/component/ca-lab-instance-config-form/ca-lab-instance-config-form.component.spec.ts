import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceConfigFormComponent} from './ca-lab-instance-config-form.component';

describe('CaLabInstanceConfigFormComponent', () => {
  let component: CaLabInstanceConfigFormComponent;
  let fixture: ComponentFixture<CaLabInstanceConfigFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceConfigFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceConfigFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
