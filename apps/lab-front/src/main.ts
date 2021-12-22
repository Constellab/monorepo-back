import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {LabAppModule} from './app/lab-app.module';
import {environment} from './environments/lab-environment';
import {LabEnvironmentSettings} from './environments/lab-environment.class';
import {labLoadEnvironmentFromAssets} from './environments/lab-environment-loader';

if (environment.production) {
  enableProdMode();

  labLoadEnvironmentFromAssets().then((env: LabEnvironmentSettings) => {
    // set the environment setting from the json file
    environment.settings = env;

    platformBrowserDynamic()
      .bootstrapModule(LabAppModule)
      .catch((err) => console.error(err));
  });

} else {
  // in dev no environment loading
  platformBrowserDynamic()
    .bootstrapModule(LabAppModule)
    .catch((err) => console.error(err));
}

