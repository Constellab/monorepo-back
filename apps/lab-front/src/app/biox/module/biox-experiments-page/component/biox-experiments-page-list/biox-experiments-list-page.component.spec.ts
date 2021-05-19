import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxExperimentsListPageComponent } from './biox-experiments-list-page.component';

describe('BioxExperimentsPageComponent', () => {
  let component: BioxExperimentsListPageComponent;
  let fixture: ComponentFixture<BioxExperimentsListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentsListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
