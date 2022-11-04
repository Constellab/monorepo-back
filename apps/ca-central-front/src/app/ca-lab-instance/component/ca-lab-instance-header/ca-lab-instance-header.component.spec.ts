import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceHeaderComponent} from './ca-lab-instance-header.component';

describe('CaLabInstanceHeaderComponent', () => {
  let component: CaLabInstanceHeaderComponent;
  let fixture: ComponentFixture<CaLabInstanceHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
