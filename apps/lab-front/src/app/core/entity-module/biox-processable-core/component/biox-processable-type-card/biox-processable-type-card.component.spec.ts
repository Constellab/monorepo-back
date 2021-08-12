import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessableTypeCardComponent} from './biox-processable-type-card.component';

describe('BioxProcessTypeCardComponent', () => {
  let component: BioxProcessableTypeCardComponent;
  let fixture: ComponentFixture<BioxProcessableTypeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessableTypeCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessableTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
