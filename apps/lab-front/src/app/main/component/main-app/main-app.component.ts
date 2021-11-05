import {Component, OnInit} from '@angular/core';
import {MainMenuLink, mainMenuLinks} from '../../utils/main-menu-link.class';
import {Observable} from 'rxjs';
import {ThemePalette} from '@angular/material/core';
import {map} from 'rxjs/operators';
import {LabEnvStore} from '../../../core/service/lab-env.store';

@Component({
  selector: 'gen-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss']
})
export class MainAppComponent implements OnInit {

  accessibleLinks: MainMenuLink[] = mainMenuLinks;

  constructor(private labEnvManager: LabEnvStore) {
  }

  ngOnInit(): void {
  }

  get toolbarColor(): Observable<ThemePalette> {
    return this.labEnvManager.getLabEnvironment$().pipe(
      map(env => env === 'prod' ? 'primary' : 'accent')
    );
  }

}
