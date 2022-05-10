import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SideNavInnerToolbarModule, SingleCardModule } from './layouts';
import { FooterModule, ResetPasswordFormModule, CreateAccountFormModule, ChangePasswordFormModule, LoginFormModule } from './shared/components';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { UnauthenticatedContentModule } from './unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { DxDataGridModule, DxTabPanelModule } from 'devextreme-angular';
// import { Sax2Component } from './pages/sax2/sax2.component';

import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

// import { JSZip } from 'jszip';
// import 'jszip';
// import * as JSZip from 'jszip';



@NgModule({
  declarations: [
    AppComponent,
  //  Sax2Component 
  ],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SideNavInnerToolbarModule,
    SingleCardModule,
    FooterModule,
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    AppRoutingModule,
    DxDataGridModule,
    DxTabPanelModule,
    HighlightModule
    // JSZip
  ],
  providers: [AuthService, ScreenService, AppInfoService,{
    provide: HIGHLIGHT_OPTIONS,
    useValue: {
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        xml: () => import('highlight.js/lib/languages/xml')
      }
    }
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
