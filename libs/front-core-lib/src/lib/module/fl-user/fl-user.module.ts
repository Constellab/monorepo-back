import {ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlUserProfilePictureComponent} from './fl-user-profile-picture/fl-user-profile-picture.component';
import {FlUserConfig} from './service/fl-user-config.config';


@NgModule({
  declarations: [
    FlUserProfilePictureComponent
  ],
  exports: [
    FlUserProfilePictureComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FlUserModule {

  public static forRoot(apiServiceConfig: Type<FlUserConfig>): ModuleWithProviders<FlUserModule> {

    const providers: Provider[] = [
      {provide: FlUserConfig, useClass: apiServiceConfig}
    ];

    return {
      ngModule: FlUserModule,
      providers: providers
    };
  }
}
