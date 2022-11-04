import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceCodelabInfoComponent} from './ca-lab-instance-codelab-info.component';

describe('CaLabInstanceCodelabInfoComponent', () => {
  let component: CaLabInstanceCodelabInfoComponent;
  let fixture: ComponentFixture<CaLabInstanceCodelabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceCodelabInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceCodelabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
