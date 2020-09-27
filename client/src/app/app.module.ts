import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import {DataService} from './services/data.service';
import {SocketService} from './services/socket.service';
import {PersonUtil} from './util/person.util';
import {NotePipe} from './pipes/note.pipe';
import {FileUploadModule} from 'ng2-file-upload';
import { ThermalPrintModule } from 'ng-thermal-print';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ChartsModule } from 'ng2-charts';
import {WebcamModule} from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './util/auth.guard';
import {DatePipe} from '@angular/common';
import { DobPipe } from './pipes/dob.pipe';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { CashierComponent } from './components/cashier/cashier.component';
import { ConsultationComponent } from './components/consultation/consultation.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DeceasedComponent } from './components/deceased/deceased.component';
import { HistoryComponent } from './components/history/history.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { LabComponent } from './components/lab/lab.component';
import { LoginComponent } from './components/login/login.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MainComponent } from './components/navs/main/main.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { PatientComponent } from './components/patient/patient.component';
import { PharmacyComponent } from './components/pharmacy/pharmacy.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SingupComponent } from './components/singup/singup.component';
import { WardComponent } from './components/ward/ward.component';
import { MessangerComponent } from './components/messanger/messanger.component';

@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    ConsultationComponent,
    InventoryComponent,
    HistoryComponent,
    PharmacyComponent,
    WardComponent,
    LoginComponent,
    NotePipe,
    PatientComponent,
    MessagesComponent,
    SingupComponent,
    DobPipe,
    AppointmentsComponent,
    MainComponent,
    SettingsComponent,
    DeceasedComponent,
    CashierComponent,
    NotificationsComponent,
    LabComponent,
    DashboardComponent,
    MessangerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ThermalPrintModule,
    FileUploadModule,
    WebcamModule,
    HttpClientModule,
    InfiniteScrollModule,
    FormsModule,
    ChartsModule
  ],
  providers: [DataService, DatePipe, AuthGuard, CookieService, SocketService, PersonUtil],
  bootstrap: [AppComponent]
})
export class AppModule { }
