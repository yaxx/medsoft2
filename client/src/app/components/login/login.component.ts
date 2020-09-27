import { Component, OnInit } from '@angular/core';
import {Client} from '../../models/client.model';
import {Person} from '../../models/person.model';
import {DataService} from '../../services/data.service';
import { AuthService } from '../../services/auth.service'
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {Router} from '@angular/router';
// const { session } = require('electron')

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 user = {
   username: null,
   password: null
};
signin = true;
loginError = false;
accountExist = false;
loading = false;
creating = false;
client: Client = new Client();

cred = {
  username: null,
  password: null,
  comfirm: null
}
  constructor(
    private accountService: DataService,
    private socket: SocketService,
    private router: Router,
    private cookies: CookieService
    
    ) { }

  ngOnInit() {
    // ElectronCookies.enable({
    //   origin: 'http://localhost/4200',
    // });
  }
  switch() {
    this.signin = false;
  }
  routeHas(path) {
    return this.router.url.includes(path);
  }
  hideError() {
    this.loginError = false;
  }
  storeUser(res) {
    localStorage.setItem('isLoggedIn', 'true');
    // console.log(res.token)
    localStorage.setItem('token', res.token);
    localStorage.setItem('i', res.person._id);
    localStorage.setItem('h', res.person.info.official.hospital);
    localStorage.setItem('d', res.person.info.official.department);
    localStorage.setItem('dp', res.person.info.personal.avatar);
  }
  login() {
    this.loading = true;
    this.accountService.login(this.user).subscribe((res: any) => {
      const role = `/${res.person.info.official.role}`;
      let route = null;
      if ( role !== 'admin') {
        switch (res.person.info.official.role) {
          case 'Doctor':
            route = `/${res.person.info.official.department.toLowerCase()}`;
            break;
          case 'Nurse':
            route = `/${res.person.info.official.department.toLowerCase()}/ward`;
            break;
          case 'Lab Scientist':
            route = '/lab';
            break;
          default:
            route = `/${res.person.info.official.department.toLowerCase()}`;
            break;
        }
      } else{ }
      this.storeUser(res);
      this.router.navigate([route]);
    }, (err) => {
        this.loading = false;
        this.loginError = true;
    });

  }
  signup() {
    this.creating = true;
    this.accountService.createClient({client: this.client, cred: this.cred}).subscribe((person: Person) => {
      this.storeUser({person})
      this.creating = false;
      this.loading = false;
      this.client = new Client();
      this.socket.io.emit('login', {ui: person._id, lastLogin: person.info.lastLogin})
      this.router.navigate(['/admin']);
    } , (err) => {
      this.accountExist = true;
      this.creating = false;
  });
  }
}
