import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animation, animate } from '@angular/animations';
import {Router} from '@angular/router';
import {DataService} from '../../services/data.service';
import {Client, Department, Bed, Room} from '../../models/client.model';
import {Connection, Connections, Info, Person} from '../../models/person.model';
import {Stamp} from '../../models/inventory.model';
import {CookieService } from 'ngx-cookie-service';
import {states, lgas} from '../../data/states';
import {departments} from '../../data/departments';
import * as cloneDeep from 'lodash/cloneDeep';
import { AuthService } from '../../services/auth.service';
import {host, appName} from '../../util/url';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [trigger('slide', [
    transition(':enter', [
    // style({ left: '100%'}),
    animate(500, style({ left: '0%'}))
  ]),
    transition(':leave', [
      animate(500, style({ left: '100%'}))
  ])
])]
  // animations: [trigger: ('fade', [
  //   transition('void=>*',[style({
  //     backgroundColor:'yellow', opacity:0 }),
  //   animate(2000)
  //     )]
  // ])]
})
export class SettingsComponent implements OnInit {
  info: Info = new Info();
  staff: Person = new Person();
  staffs: Person[] = new Array<Person>();
  departments: Department[] = [];
  connections: Connections =  new Connections();
  connection: Connection =  new Connection();
  department = new Department();
  selectedDept: Department = new Department();
  client: Client  = new Client();
  rooms: Room[] = [];
  bed: Bed = new Bed();
  loading = false;
  processing = false;
  logout = false;
  numbOfBeds = null;
  staffMode = 'view';
  clientMode = null;
  deptMode = null;
  numOfRooms = null;
  roomNumb = 1;
  staffIndex = null;
  deptName = null;
  states = states;
  message = null;
  menu = null;
  transMsg = null;
  succs = true;
  errLine = null;
  appName = appName;
  stamp: Stamp = new Stamp();

  constructor(
    private dataService: DataService,
    private cookies: CookieService,
    private authService: AuthService,
    private router: Router
    ) { }

  ngOnInit() {
    this.stamp = new Stamp(localStorage.getItem('i'), localStorage.getItem('h'));
    this.getSettings();
  }

  getSettings() {
    this.loading = true;
    this.dataService.getClient().subscribe((res: any) => {
      if (res) {
        this.loading = false;
        this.client = res.client;
        this.staffs = res.client.staffs;
        this.departments = departments;
        this.client.departments = this.client.departments.map(d => ({...d, menu: false}));
      }
    }, (e) => {
      this.message = 'Network Error';
      this.loading = false;
    });
  }
  showDeptMenu(i) {
    this.client.departments[i].menu = true;
  }
  hideDeptMenu(i) {
    this.client.departments[i].menu = false;
  }
  getDp(avatar: string) {
    return `${host}/dp/${avatar}`;
  }
  showLogOut() {
    this.logout = true;
  }
  hideLogOut() {
    this.logout = false;
  }
  logOut() {
    this.authService.logOut();
  }
  getMyDp() {
    return localStorage.getItem('dp');
  }
  getBackgrounds() {
    const url = this.getMyDp();
    return {
      backgroundImage: `url(${url})`,
    };
  }
  switchToEditDept(i) {
    this.department = this.client.departments[i];
    this.switchRightCard('add');
  }
  showMenu(menu: string) {
    this.menu =  menu;
  }
  hideMenu(menu: string) {
    this.menu = null;
  }
  getRoomNumbs() {
  //  return this.department.rooms.length + 1;
  }
  // addRoom() {
  //   const beds = [];
  //   for (let i = 0; i < this.numbOfBeds; i++) {
  //       beds.push(new Bed(i + 1));
  //   }
  //   this.rooms.push({...new Room(), number: this.rooms.length + 1, beds: beds});
  //   this.roomNumb++;
  //   this.numbOfBeds = null;
  // }
  openDeptModal() {
    this.client.departments.forEach((d) => {
      this.departments = this.departments.filter(dep => dep.name !== d.name);
    });
    // this.deptName = this.departments[0].name;
  }
  switchClient(view: string) {
    this.clientMode = view;
  }
  openStafftModal() {
   this.staffMode = 'new';
   this.staff = new Person();
  }
  onScroll() {
    console.log('scrolled!!');
  }
  loadMore() {
    console.log('loading...');
  }
  isValidStaff() {
    return this.staff.info.personal.firstName &&
    this.staff.info.personal.lastName &&
    this.staff.info.personal.gender &&
    this.staff.info.contact.me.mobile &&
    this.staff.info.official.role &&
    this.staff.info.official.department;
  }
//   $(window).scroll(() => {
//     if($(window).scrollTop() === ($(document).height()-$(window).height())) {
//         alert('scrolled!');
//     }
// })

  refresh() {
    this.getSettings();
 }

  deptHasWard() {
    const d = departments.find(dept => dept.name === this.department.name);
    return (d) ? d.hasWard : false;
  }
  isAddminStaff() {
    const dept = this.departments.find(department => department.name === this.staff.info.official.department);
    if (dept) {
      this.staff.info.official.department = dept.name;
      return  dept.hasWard;
    } else {
      return false;
    }
  }

  switchRightCard(view) {
    this.deptMode = view;
  }
  generatePassword(): string {
    return Math.floor(Math.random() * (10000 - 1000 + 1) + 1000).toString();
  }
  createAccount() {
    this.errLine = null;
    this.processing = true;
    this.staff.stamp = this.stamp;
    console.log(this.stamp)
    this.staff.info.personal.password = this.generatePassword();
    this.staff.info.personal.username = this.staff.info.personal.firstName.toLowerCase();
    this.staff.info.official.hospital = this.client._id;
    this.dataService.addPerson(this.staff)
    .subscribe((staff: Person) => {
      this.processing = false;
      this.staffs.unshift(staff);
      this.transMsg = 'Staff added successfully';
      setTimeout(() => {
        this.transMsg = null;
  }, 3000);
     this.staff = new Person();
   }, (e) => {
    this.errLine = 'Could not add staff';
    this.processing = false;
  });
  }
  selectStaff(staff, i) {
    this.staffIndex = i;
    this.staff = cloneDeep(staff);
    this.switchView('view') ;
  }
  updateAccount() {
    this.processing = true;
    this.staff.info.personal.username = this.staff.info.personal.firstName.toLowerCase();
    console.log(this.staff);
    this.dataService.updateInfo(this.staff.info, this.staff._id).subscribe((edited: Person ) => {
      this.staffs[this.staffIndex].info = edited.info;
      this.transMsg = 'Account updated successfully';
      this.processing = false;
      setTimeout(() => {
        this.switchView('view');
        this.transMsg = null;
      }, 3000);
    }, (e) => {
      this.errLine = 'Could not updated account';
      this.processing = false;
    });
  }

  switchView(view: string) {
    this.staffMode = view;
  }
  resetNumOfRooms() {
    this.numOfRooms = null;
  }
  inComplete() {
    return (this.department.numbOfRooms) ? true : false;
  }

  resetVariables() {
    this.department = new Department();
    this.rooms = [];
    this.numbOfBeds = null;
    this.roomNumb = 1;
    this.numOfRooms = null;
    this.transMsg = null;
  }
  addDepartment() {
    this.processing = true;
    this.message = null;
    let copy = cloneDeep(this.client);
    copy.departments.unshift(this.department);
    this.dataService.updateDept(this.department).subscribe((res: Client) => {
      this.client.departments.unshift(this.department);
      this.processing = false;
      this.transMsg = 'Department added successfully';
      this.succs = true;
      setTimeout(() => {
        this.resetVariables();
    }, 4000);
    }, (e) => {
      this.transMsg = 'Could not add department';
      this.succs = false;
      this.processing = false;
    }
    );
  }
 
}

