import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceServerComponent} from './ca-lab-instance-server.component';

describe('CaLabInstanceServerComponent', () => {
  let component: CaLabInstanceServerComponent;
  let fixture: ComponentFixture<CaLabInstanceServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceServerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
