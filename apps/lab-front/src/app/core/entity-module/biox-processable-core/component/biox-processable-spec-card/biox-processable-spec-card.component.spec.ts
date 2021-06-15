import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BioxProcessableSpecCardComponent} from './biox-processable-spec-card.component';

describe('BioxProcessTypeCardComponent', () => {
  let component: BioxProcessableSpecCardComponent;
  let fixture: ComponentFixture<BioxProcessableSpecCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxProcessableSpecCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxProcessableSpecCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
