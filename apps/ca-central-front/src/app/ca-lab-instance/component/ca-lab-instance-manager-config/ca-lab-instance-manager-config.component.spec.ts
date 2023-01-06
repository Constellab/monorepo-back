import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceManagerConfigComponent} from './ca-lab-instance-manager-config.component';

describe('CaLabInstanceConfigComponent', () => {
  let component: CaLabInstanceManagerConfigComponent;
  let fixture: ComponentFixture<CaLabInstanceManagerConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceManagerConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceManagerConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
