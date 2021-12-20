import {TestBed} from '@angular/core/testing';
import {LabAppComponent} from './lab-app.component';
import {RouterTestingModule} from '@angular/router/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [LabAppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(LabAppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'lab-front'`, () => {
    const fixture = TestBed.createComponent(LabAppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('lab-front');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(LabAppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(
      'Welcome to lab-front!'
    );
  });
});
