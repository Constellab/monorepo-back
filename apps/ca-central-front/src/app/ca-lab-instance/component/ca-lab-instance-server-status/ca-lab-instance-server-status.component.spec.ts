import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceServerStatusComponent} from './ca-lab-instance-server-status.component';

describe('CaLabInstanceServerStatusComponent', () => {
  let component: CaLabInstanceServerStatusComponent;
  let fixture: ComponentFixture<CaLabInstanceServerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceServerStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceServerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
