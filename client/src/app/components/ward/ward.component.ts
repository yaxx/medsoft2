import { Component, OnInit } from '@angular/core';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CookieService } from 'ngx-cookie-service';
import { Priscription, Scan, Session, Vital, Medication, Note, Bp, Resp, Pulse, Temp} from '../../models/record.model';
import { Person } from '../../models/person.model';
import { Stock, Inventory, Suggestion, Invoice} from '../../models/inventory.model';
import { Client} from '../../models/client.model';
import * as cloneDeep from 'lodash/cloneDeep';
import {sorter, searchPatients} from '../../util/functions';
import {host, appName} from '../../util/url';



const uri = `${host}/api/upload`;
@Component({
  selector: 'app-ward',
  templateUrl: './ward.component.html',
  styleUrls: ['./ward.component.css']
})
export class WardComponent implements OnInit {
  appName = appName;
  patients: Person[] = [];
  clonedPatients: Person[] = [];
  reserved: Person[] = [];
  pool: Person[] = [];
  temp: Person[] = [];
  patient: Person = new Person();
  clonePatient: Person = new Person();
  inventory: Inventory = new Inventory();
  stocks: Stock[] = [];
  client: Client = new Client();
  cloneClient: Client = new Client();
  stock: Stock = new Stock();
  priscription: Priscription = new Priscription();
  medication: Medication = new Medication();
  invoices: Invoice[][] = new Array<Invoice[]>();
  medications: any[] = [];
  temStocks: Stock[] = [];
  item: Suggestion = new Suggestion();
  items: Suggestion[] = [];
  file: File = null;
  filesDesc = null;
  errLine = null;
  feedback = null;
  vital = 'Blood Presure';
  vitals = [];
  selections = [];
  successMsg = null;
  errorMsg = null;
  note = new Note();
  input = '';
  view = 'bed';
  session: Session = new Session();
  id = null;
  loading = false;
  selected = null;
  searchTerm = '';
  processing = false;
  curIndex = 0;
  sortBy = 'added';
  allocated = null;
  count = 0;
  page = 0;
  pageCount = 0;
  message = null;
  url = '';
  logout = false;
  cardCount = null;
  sortMenu = false;
  nowSorting = 'Date';
  uploader: FileUploader = new FileUploader({url: uri});
  attachments: any = [];
  myDepartment = null;
  cardView = {
    orders: true,
    editing: false,
    reversing: false
  };


  constructor(
      private dataService: DataService,
      private route: ActivatedRoute,
      private cookies: CookieService,
      private router: Router,
      private socket: SocketService ) { }
  ngOnInit() {
    this.myDepartment = this.route.snapshot.params.dept;
    this.getClient();
    this.getPatients('Admit');
    this.uploader.onCompleteItem = (item: any, fileName: any, status: any, headers: any ) => {
      this.patients[this.curIndex].record.scans.unshift(new Scan(fileName, this.filesDesc));
      this.loading = !this.loading;
      this.dataService.updateRecord(this.patients[this.curIndex]).subscribe((newpatient: Person) => {
        this.loading = !this.loading;
        this.attachments = [];
      });
     };
    this.socket.io.on('record update', (update) => {
      const i = this.patients.findIndex(p => p._id === update.patient._id);
      switch (update.action) {
        case 'disposition':
            if (i !== -1) {
              if (update.patient.record.visits[0][0].status === 'out' || update.patient.record.visits[0][0].status === 'foward' ) {
               this.patients.splice(i, 1);
               this.message = ( this.patients.length) ? null : 'No Record So Far';
             }
            }  else if (update.patient.record.visits[0][0].dept === this.cookies.get('dpt')) {
              this.patients.unshift({
                 ...update.patient,
                 card: {
                    view: 'front',
                    menu: false,
                    indicate: true,
                    more: false
                  }
                });
            }
            break;
        case 'status update':
            if (i !== -1 ) {
              this.patients[i] = {
                ...update.patient,
                card: {
                  ...this.patients[i].card,
                  indicate: true,
                  more: false
                }
              };
            }
            break;
        default:
            if (i !== -1 ) {
              this.patients[i] = {
                ...update.patient,
                card: this.patients[i].card,
                more: false
              };
            }
            break;
      }
    });
  // this.socket.io.on('consulted', (patient: Person) => {
  //   const i = this.patients.findIndex(p => p._id === patient._id);
  //     if (patient.record.visits[0][0].dept.toLowerCase() === this.myDepartment && patient.record.visits[0][0].status === 'Admit') {
  //       this.patients.unshift(patient);
  //       this.clonedPatients.unshift(patient);
  //     } else if (patient.record.visits[0][0].dept.toLowerCase() ===
  //      this.myDepartment && patient.record.visits[0][0].status === 'Discharged') {
  //        this.patients.splice(i, 1);
  //     }
  // });

  }
  getDp(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }
  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getClient() {
    this.dataService.getClient().subscribe((res: any) => {
      this.client = res.client;
  });
  }
  goTo(count: number) {
    this.count = count;
  }
  refresh() {
    this.message = null;
    this.getClient();
    this.getPatients('Admit');
  }
  fileSelected(event) {
    if (event.target.files && event.target.files[0]) {
      this.file =  event.target.files[0] as File;
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => { // called once readAsDataURL is completed
        const ev =  e as any;
        this.url = ev.target.result;
      };
    }
  }
  getBackgrounds() {
    const url = this.getMyDp();
    return {
      backgroundImage: `url(${url})`,
    };
  }
  isInfo() {
    return this.router.url.includes('information');
  }
  searchPatient(name: string) {
    if (!this.temp.length) {
      this.temp = cloneDeep(this.patients);
    }
    if (name.length) {
      this.patients = searchPatients(this.clonedPatients, name);
      if(!this.patients.length) {
        this.message = '...No record found';
      }
   } else {
      this.patients = this.temp;
      this.temp = [];
   }
  }
   nextPage(pageNum: number) {
     this.pageCount = pageNum;
     if (pageNum === 2) {
      this.invoices = this.patient.record.invoices;
     }
   }
   viewOrders(i: number) {
    this.curIndex = i;
    this.invoices = cloneDeep(this.patients[i].record.invoices);
  }
  medicationSelected() {
    return this.patients[this.curIndex].record.medications.some(med => med.some(m => m.selected));
  }
  uploadFile() {
    const data: FormData = new FormData();
    data.append('file', this.file);
    this.dataService.upload(this.file,
       this.patients[this.curIndex]._id).subscribe(res => {
    });
  }
  selectPatient(i: number) {
    this.curIndex = i;
    this.patient = cloneDeep(this.patients[i]);
   }
   showMenu(i: number) {
     this.hideMenu();
     this.patients[i].card = { ...this.patients[i].card, menu: true, indicate: false};
   }
   hideMenu() {
     this.patients.forEach(p => {
       p.card.menu =  false;
     });
   }
   showSortMenu() {
    this.sortMenu = true;
  }
  showMoreIcon(i) {
    this.patients[i].card.more = true;
  }
  hideMoreIcon(i) {
    this.patients[i].card.more = false;
  }
  logOut() {
    this.dataService.logOut();
  }
  showLogOut() {
    this.logout = true;
  }
  hideLogOut() {
    this.logout = false;
  }
  switchToEdit() {
    this.patient.record.medications.forEach(inner => {
      inner.forEach(medic => {
        if (medic.meta.selected) {
           this.selections.push(medic);
        }
      });
    });
    this.switchViews('editing');
  }
  switchViews(view) {
    switch (view) {
      case 'orders':
      this.cardView.orders = true;
      this.cardView.editing = false;
      this.selections = [];
      break;
      case 'editing':
      this.cardView.orders = false;
      this.cardView.editing = true;
      break;
      default:
      break;
    }
  }
   sortPatients(order: string) {
    this.sortMenu = false;
    this.nowSorting = order;
    this.patients = sorter(this.patients, order)
  }
  isWard() {
    return this.router.url.includes('ward');
  }

  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  populate(patients) {
    this.pool = patients;
    this.clonedPatients  = cloneDeep(patients);
    this.patients   = patients.slice(0, 12);
    patients.splice(0, 12);
    this.reserved = patients;
  }

  getPatients(type?: string) {
    this.loading = (this.page === 0) ? true : false;
    this.dataService.getPatients(type, this.page).subscribe((patients: Person[]) => {
      if (patients.length) {
        patients.forEach(p => {
          p.card = {
            menu: false,
            indicate: false,
            view: 'front',
            name: null,
            processing: false,
            errorMsg: null,
            sucsMsg: null,
            more: false
          };
        });

        this.populate(patients);
        this.loading = false;
        this.message = null;
      } else {
          this.message = (this.page === 0) ? 'No Records So Far' : null;
          this.loading = false;
      }
    }, (e) => {
      this.loading = false;
      this.patients = [];
      this.message = '...Network Error';
    });
  }
  onScroll() {
    this.page = this.page + 1;
    if(this.reserved.length) {
      if(this.reserved.length >  12 ) {
        this.patients = [...this.patients, ...this.reserved.slice(0, 12)];
        this.reserved.splice(0,  12);
      } else {
        this.patients = [...this.patients, ...this.reserved];
        this.reserved = [];
      }
    }
  }

  getRooms(i) {
    // return this.client.departments
    // .find(dept => dept.name === this.patients[i].record.visits[0][0].dept).rooms;
  }
  getBeds() {

  }
  switchCards(i: number, face: string) {
    this.patients[this.curIndex].card.view = 'front';
    this.curIndex = i;
    this.patients[i].card.view = face;
    switch (face) {
       case 'ap': this.cardCount = 'dispose';
                  break;
       case 'appointment': this.cardCount = 'ap';
                           break;
       case 'dispose': this.cardCount = 'dispose';
                       break;
       default: this.cardCount = null;
                break;
     }
   }
  allocateRoom(i) {
    this.patients[i].card.processing = true;
    this.dataService.updateRecord(this.patients[i]).subscribe((res: Person) => {
      this.patients[i].card.processing = false;
      this.patients[i].record.visits[0][0].wardNo =  res.record.visits[0][0].wardNo;
      this.patients[i].card.sucsMsg  = 'Room successfully allocated';
      this.socket.io.emit('record update', {action: 'ward', patient: this.patients[i]});
      setTimeout(() => {
        this.patients[i].card.sucsMsg  = null;
      }, 3000);
      setTimeout(() => {
        this.switchCards(i, 'front');
      }, 5000);
    }, (e) => {
      this.patients[i].card.processing = false;
      this.patients[i].card.errorMsg  = 'Unable to allocate room';
    });
  }

  clearVital(name) {
    this.clearError();
    switch (name) {
      case 'Blood Presure':
        if (!this.session.vitals.bp.systolic || !this.session.vitals.bp.diastolic) {
          this.vitals = this.vitals.filter(v => v.name !== name);
        }
        break;
      case 'Tempreture':
          if (!this.session.vitals.tempreture.value) {
            this.vitals = this.vitals.filter(t => t.name !== name);
          }
          break;
      case 'Pulse Rate':
          if (!this.session.vitals.pulse.value) {
            this.vitals = this.vitals.filter(p => p.name !== name);
          }
          break;
      case 'Respiratory Rate':
          if (!this.session.vitals.resp.value) {
            this.vitals = this.vitals.filter(r => r.name !== name);
          }
          break;
      default:
        break;
    }
  }
  addVital() {
    const i = this.vitals.findIndex(v => v.name === this.vital);
    switch (this.vital) {
      case 'Blood Presure':
        if (i >= 0) {
          this.vitals[i] = {
            name: 'Blood Presure',
            val: this.session.vitals.bp.systolic + '/'
          + this.session.vitals.bp.diastolic + 'mm Hg'
          };
        } else {
          this.vitals.unshift({
            name: 'Blood Presure',
            val: this.session.vitals.bp.systolic + '/'
          + this.session.vitals.bp.diastolic + 'mm Hg'
          });
          console.log(this.vitals);
        }
        break;
      case 'Tempreture':
          if (i >= 0) {
            this.vitals[i] = {
              name: 'Tempreture',
              val: this.session.vitals.tempreture.value + 'C'
            };
          } else {
            this.vitals.unshift({
              name: 'Tempreture',
              val: this.session.vitals.tempreture.value + 'C'
            });
          }
          break;
      case 'Respiratory Rate':
        if (i >= 0) {
          this.vitals[i] = {
            name: 'Respiratory Rate',
            val: this.session.vitals.resp.value + 'bpm'
          };
        } else {
          this.vitals.unshift({
            name: 'Respiratory Rate',
            val: this.session.vitals.resp.value + 'bpm'
          });
        }
        break;
      case 'Pulse Rate':
        if (i >= 0) {
          this.vitals[i] = {
            name: 'Pulse Rate',
            val: this.session.vitals.pulse.value + 'bpm'
          };
        } else {
          this.vitals.unshift({
            name: 'Pulse Rate',
            val: this.session.vitals.pulse.value + 'bpm'
          });
        }
        break;
      default:
        break;
    }

  }
  removeVital(i, sign) {
    this.vitals.splice(i, 1);
    switch (sign.name) {
      case 'Blood Presure':
        this.session.vitals.bp = new Bp();
        break;
      case 'Tempreture':
        this.session.vitals.tempreture = new Temp();
        break;
      case 'Pulse Rate':
        this.session.vitals.pulse = new Pulse();
        break;
      case 'Respiratory Rate':
        this.session.vitals.resp = new Resp();
        break;
      default:
        break;
    }
  }
  composeVitals() {
    if (this.session.vitals.tempreture.value) {
      if (this.patient.record.vitals.tempreture.length > 30) {
        this.patient.record.vitals.tempreture.unshift(this.session.vitals.tempreture);
        this.patient.record.vitals.tempreture.splice(this.patient.record.vitals.tempreture.length - 1 , 1);
      } else {
        this.patient.record.vitals.tempreture.unshift(this.session.vitals.tempreture);
      }
    } else {}

    if (this.session.vitals.bp.systolic && this.session.vitals.bp.diastolic) {
      if (this.patient.record.vitals.bp.length > 30) {
        this.patient.record.vitals.bp.unshift(this.session.vitals.bp);
        this.patient.record.vitals.bp.splice(this.patient.record.vitals.bp.length - 1 , 1);
      } else {
        this.patient.record.vitals.bp.unshift(this.session.vitals.bp);
      }
    } else {}
    if (this.session.vitals.pulse.value) {
      if (this.patient.record.vitals.pulse.length > 30) {
        this.patient.record.vitals.pulse.unshift(this.session.vitals.pulse);
        this.patient.record.vitals.pulse.splice(this.patient.record.vitals.pulse.length - 1 , 1);
      } else {
        this.patient.record.vitals.pulse.unshift(this.session.vitals.pulse);
      }
    } else {}
    if (this.session.vitals.resp.value) {
      if (this.patient.record.vitals.resp.length > 30) {
        this.patient.record.vitals.resp.unshift(this.session.vitals.pulse);
        this.patient.record.vitals.resp.splice(this.patient.record.vitals.resp.length - 1 , 1);
      } else {
        this.patient.record.vitals.resp.unshift(this.session.vitals.resp);
      }
    } else {}

  }
  switchToFront(i: number) {
    this.patients[i].card.view = 'front';
  }
  linked() {
    return !this.router.url.includes('information');
  }

  selectMedication(i: number, j: number) {
    this.patient.record.medications[i][j].meta.selected =
    this.patient.record.medications[i][j].meta.selected ? false : true;
   }
   medSelected() {
    return this.patient.record.medications.some(med => med.some(m => m.meta.selected));
   }
   getStyle(medication) {
    return {
      textDecoration: medication.paused ? 'line-through' : 'none',
      color: medication.paused ? 'light-grey' : 'black'
    };
  }

   resetOrders() {
    this.processing = false;
    setTimeout(() => {
      this.successMsg = null;
    }, 3000);
    setTimeout(() => {
      this.switchViews('orders');
    }, 6000);
  }
 updateTimeTaken() {
  this.errorMsg = null;
  this.processing = true;
  this.patient.record.medications.forEach(group => {
      group.forEach(medic => {
        if (medic.meta.selected) {
          medic.lastTaken = new Date();
          medic.meta.selected = false;
        }
      });
    });
  this.dataService.updateRecord(this.patient).subscribe((p: Person) => {
      this.successMsg = 'Medications Successfully Updated';
      this.patients[this.curIndex].record = p.record;
      this.resetOrders();
    }, () => {
      this.errorMsg = 'Unable to Update Medications';
    });
  }
 updateVitals() {
   this.errorMsg = null;
   this.processing = true;
   this.composeVitals();
   this.dataService.updateRecord(this.patient).subscribe((p: Person) => {
      this.successMsg = 'Vitals Successfully Updated';
      this.patients[this.curIndex].record = p.record;
      this.resetOrders();
    }, () => {
      this.errorMsg = 'Unable to Update Vitals';
    });
  }
clearError() {
  this.errorMsg = null;
}

gone(i) {
  // this.patients[i].status = 'gone';
}
// switchViews() {
//   if (this.view === 'details') {
//      this.view = '';
//   } else {
//     this.view = 'details';
//   }
// }

getStocks() {
  this.dataService.getStocks().subscribe((p: any) => {
    this.inventory = p.inventory;
  });
}

searchItem(input) {
//   if (input === '') {
//     this.temStocks = new Array<Stock>();
//   } else {
//       this.temStocks = this.inventory.stocks.filter((stock) => {
//       const patern =  new RegExp('\^' + input , 'i');
//       return patern.test(stock.product.name);
//   });
// }
}
selectStock(stock: Stock) {
  // this.input = stock.item.name + ' ' + stock.item.mesure + stock.item.unit;
  // this.temStocks = new Array<Stock>();

}

}
