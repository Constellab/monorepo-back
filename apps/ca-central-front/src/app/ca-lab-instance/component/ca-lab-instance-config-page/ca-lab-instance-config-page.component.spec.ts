import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceConfigPageComponent} from './ca-lab-instance-config-page.component';

describe('CaLabInstanceConfigPageComponent', () => {
  let component: CaLabInstanceConfigPageComponent;
  let fixture: ComponentFixture<CaLabInstanceConfigPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceConfigPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceConfigPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
