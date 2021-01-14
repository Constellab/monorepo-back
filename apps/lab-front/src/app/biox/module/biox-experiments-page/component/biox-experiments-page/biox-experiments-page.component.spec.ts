import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxExperimentsPageComponent } from './biox-experiments-page.component';

describe('BioxExperimentsPageComponent', () => {
  let component: BioxExperimentsPageComponent;
  let fixture: ComponentFixture<BioxExperimentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxExperimentsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxExperimentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
