import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessTypeDocComponent} from './biox-process-type-doc.component';

describe('BioxProcessTypeDocComponent', () => {
  let component: BioxProcessTypeDocComponent;
  let fixture: ComponentFixture<BioxProcessTypeDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessTypeDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessTypeDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
