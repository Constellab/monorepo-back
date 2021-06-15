import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessableDocComponent} from './biox-processable-doc.component';

describe('BioxProcessTypeDocComponent', () => {
  let component: BioxProcessableDocComponent;
  let fixture: ComponentFixture<BioxProcessableDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessableDocComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessableDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
