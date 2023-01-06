import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabConfigComponent} from './ca-lab-config.component';

describe('CaLabConfigComponent', () => {
  let component: CaLabConfigComponent;
  let fixture: ComponentFixture<CaLabConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
