import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessDocComponent} from './biox-process-doc.component';

describe('BioxProcessTypeDocComponent', () => {
  let component: BioxProcessDocComponent;
  let fixture: ComponentFixture<BioxProcessDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
