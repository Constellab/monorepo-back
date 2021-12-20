import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {CaAppModule} from './app/ca-app.module';
import {environment} from './environments/ca-environment';

// import reflect to make class-transform work
import 'reflect-metadata/Reflect';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(CaAppModule)
  .catch(err => console.error(err));
