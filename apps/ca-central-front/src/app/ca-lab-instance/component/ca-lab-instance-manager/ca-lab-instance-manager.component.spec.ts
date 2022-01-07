import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceManagerComponent} from './ca-lab-instance-manager.component';

describe('CaLabInstanceManagerComponent', () => {
  let component: CaLabInstanceManagerComponent;
  let fixture: ComponentFixture<CaLabInstanceManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstanceManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
