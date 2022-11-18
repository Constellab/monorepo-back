import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FlTextEditorSnowButtonComponent} from '@monorepo/front-core-lib';

describe('FlTextEditorBlockAddButtonComponent', () => {
  let component: FlTextEditorSnowButtonComponent;
  let fixture: ComponentFixture<FlTextEditorSnowButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlTextEditorSnowButtonComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlTextEditorSnowButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
