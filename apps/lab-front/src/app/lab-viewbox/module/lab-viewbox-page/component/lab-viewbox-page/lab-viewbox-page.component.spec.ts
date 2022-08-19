import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewboxPageComponent} from './lab-viewbox-page.component';

describe('LabViewboxPageComponent', () => {
  let component: LabViewboxPageComponent;
  let fixture: ComponentFixture<LabViewboxPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewboxPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabViewboxPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
