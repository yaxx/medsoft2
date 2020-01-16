import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
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

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: LoginComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'pharmacy',
    component: MainComponent,
    children: [
      {
        path: 'me',
        component: MessagesComponent
      },
      {
        path: 'pending',
        component: PharmacyComponent
      },
      {
        path: 'completed',
        component: PharmacyComponent
      },
      {
        path: 'notifications',
        component: NotificationsComponent
      },
      {
        path: '',
        component: PharmacyComponent
      }
    ]
  },
  {
    path: 'lab',
    component: MainComponent,
    children: [
      {
        path: 'me',
        component: MessagesComponent
      },
      {
        path: 'pending',
        component: LabComponent
      },
      {
        path: 'completed',
        component: LabComponent
      },
      {
        path: 'notifications',
        component: NotificationsComponent
      },
      {
        path: '',
        component: LabComponent
      }
    ]
  },
  {
    path: 'billing',
    component: MainComponent,
    children: [
      {
        path: 'me',
        component: MessagesComponent
      },
      {
        path: 'pending',
        component: CashierComponent
      },
      {
        path: 'completed',
        component: CashierComponent
      },
      {
        path: 'notifications',
        component: NotificationsComponent
      },
      {
        path: '',
        component: CashierComponent
      }
    ]
  },
  {
    path: 'admin',
    component: MainComponent,
    children: [
      {
        path: 'history/:id',
        component: HistoryComponent
      },
      {
        path: 'appointments',
        component: AppointmentsComponent
      },
      {
        path: 'consultations',
        component: ConsultationComponent
      },
      {
        path: 'addmisions',
        component: PatientComponent
      },
      {
        path: 'discharged',
        component: RegistrationComponent
      },
      {
        path: 'pharmacy',
        component: PharmacyComponent
      },
      {
        path: 'inventory',
        component: InventoryComponent
      },
      {
        path: 'deceased',
        component:  DeceasedComponent
      },
      {
        path: 'me',
        component: MessagesComponent
      },
      {
        path: 'notifications',
        component: NotificationsComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: '',
        component: RegistrationComponent
      }
    ]
  },
  {
    path: 'information',
    component: MainComponent,
    children: [
        {
          path: 'appointments',
          component: AppointmentsComponent
        },
        {
          path: 'addmisions',
          component: PatientComponent
        },
        {
          path: 'consultations',
          component: ConsultationComponent
        },
        {
          path: 'deceased',
          component:  DeceasedComponent
        },
        {
          path: 'pharmacy',
          component: PharmacyComponent
        },
        {
          path: 'me',
          component: MessagesComponent
        },
        {
          path: 'notifications',
          component: NotificationsComponent
        },
        {
          path: '', component: RegistrationComponent
        }
      ]
  },
  
  {
    path: ':dept/ward',
    component: MainComponent,
      children: [
        {
          path: 'addmisions',
          component: WardComponent
        },
        {
          path: 'deceased',
          component:  DeceasedComponent
        },
        {
          path: 'me',
          component: MessagesComponent
        },
        {
          path: 'notifications',
          component: NotificationsComponent
        },
        {
          path: '',
          component: RegistrationComponent}
      ]
    },
    {
      path: ':dept',
      component: MainComponent,
      children: [
        {
          path: 'appointments',
          component: AppointmentsComponent
        },
        {
          path: 'addmisions',
          component: PatientComponent
        },
        {
          path: 'notifications',
          component: NotificationsComponent
        },
        {
          path: 'discharged',
          component: RegistrationComponent
        },
        {
          path: 'deceased',
          component:  DeceasedComponent
        },
        {
          path: 'history/:id',
          component: HistoryComponent
        },
        {
          path: 'me',
          component: MessagesComponent
        },
        {
          path: '',
          component: ConsultationComponent
        }
      ]
    },
    {
      path: '**',
      component: LoginComponent
    }

 ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
