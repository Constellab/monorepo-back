import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessSourceConfigComponent} from './biox-process-source-config.component';

describe('BioxProcessSourceConfigComponent', () => {
  let component: BioxProcessSourceConfigComponent;
  let fixture: ComponentFixture<BioxProcessSourceConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessSourceConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessSourceConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
