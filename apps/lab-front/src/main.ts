import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {EnvironmentSettings} from './environments/environment.class';

// import reflect to make class-transform work
import 'reflect-metadata/Reflect';
import {loadEnvironmentFromAssets} from './environments/environment-loader';

if (environment.production) {
  enableProdMode();

  loadEnvironmentFromAssets().then((env: EnvironmentSettings) => {
    // set the environment setting from the json file
    environment.settings = env;

    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  });

} else {
  // in dev no environment loading
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}

