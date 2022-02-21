import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceConfigComponent} from './ca-lab-instance-config.component';

describe('CaLabInstanceConfigComponent', () => {
  let component: CaLabInstanceConfigComponent;
  let fixture: ComponentFixture<CaLabInstanceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
