import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent, ResetPasswordFormComponent, CreateAccountFormComponent, ChangePasswordFormComponent } from './shared/components';
import { AuthGuardService } from './shared/services';
import { HomeComponent } from './pages/home/home.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { DxButtonModule, DxCheckBoxModule, DxColorBoxModule, DxDataGridModule, DxFormModule, DxPopupModule, DxScrollViewModule, DxTabPanelModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule } from 'devextreme-angular';
import { DxFileUploaderModule } from 'devextreme-angular';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Sax2Component } from './pages/sax2/sax2.component';
// import { Sax2_v2_Component } from './pages/sax2_v2/sax2_v2.component';
// import { Sax2_v2_Component } from './pages/sax2_v2/sax.component';
// import { Sax2v3Component } from './pages/sax2_v3/sax2.component';
const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'sax2',
    component: Sax2Component,
    canActivate: [ AuthGuardService ]
  },
  // {
  //   path: 'sax2_v2',
  //   component: Sax2_v2_Component,
  //   canActivate: [ AuthGuardService ]
  // },
  // {
  //   path: 'sax2_v3',
  //   component: Sax2v3Component,
  //   canActivate: [ AuthGuardService ]
  // },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'login-form',
    component: LoginFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'reset-password',
    component: ResetPasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'create-account',
    component: CreateAccountFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: 'change-password/:recoveryCode',
    component: ChangePasswordFormComponent,
    canActivate: [ AuthGuardService ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), HttpClientModule, DxDataGridModule, DxFormModule, DxToolbarModule, 
    DxColorBoxModule, FormsModule, DxTextAreaModule, DxButtonModule,
    DxFileUploaderModule, DxPopupModule, DxScrollViewModule, DxCheckBoxModule, DxToolbarModule, DxTabPanelModule, DxTextBoxModule],
  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [HomeComponent,  TasksComponent, Sax2Component]
})
export class AppRoutingModule { }
