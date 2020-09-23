import { Component, OnInit, ElementRef, AfterViewInit, ViewChild} from '@angular/core';
import { Person} from '../../models/person.model';
import {Client, Department} from '../../models/client.model';
import {Vaccins} from '../../data/immunization';
import {DataService} from '../../services/data.service';
import * as cloneDeep from 'lodash/cloneDeep';
import {SocketService} from '../../services/socket.service';
import {sortInventory, signStock, updateVitals, stamp} from '../../util/functions';
import 'simplebar';
import {DatePipe} from '@angular/common'
import 'simplebar/dist/simplebar.css';
import {CookieService } from 'ngx-cookie-service';
import {ActivatedRoute, Router} from '@angular/router';
import {Inventory, Suggestion, StockInfo, Stock, Card, Invoice, Stamp} from '../../models/inventory.model';
import {
    Record, Medication, Height, Weight, Bg, Condition,
    Note, Visit, Session, Test, Surgery, Scan, History, Complain,
    Bp, Resp, Pulse, Temp, Vitals, Vaccin, RecordItem,  VitalStocks
  } from '../../models/record.model';

import {Chart} from 'chart.js';
import {ChartOptions, pulseDataConfig,tempDataConfig} from '../../util/chartConfig';
import {saveAs} from 'file-saver';
import {host} from '../../util/url';
import { CONTEXT_NAME } from '@angular/compiler/src/render3/view/util';

// import { truncateSync } from 'fs';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  providers:[DatePipe]
})
export class HistoryComponent implements OnInit {
  stocks: Stock[] = [];
  inventory: Stock[] = [];
  suggestions: Suggestion[] = [];
  clonedPatient: Person = new Person();
  clonedPatients: Person[] = [];
  department: Department = new Department();
  session: Session = new Session();
  vaccins: any[] = Vaccins;
  allegies = [];
  feedback = null;
  currentImage = 0;
  count = 0;
  cardTypes = [];
  client: Client = new Client();
  scans = [];
  clonedTest = [];
  newSuggestions = [];
  images = [];
  editing = null;
  elem = null;
  logout = false;
  ctx = null;
  imgCount = 0;
  step = null;
  btn = null;
  showing = 'PR';
  unit = 'mmHg';
  vit = null;
  duration = new Array<number>(30);
  sortMenu = false;
  histories = [];
  complains = [];
  medications = [];
  vital = 1;
  form = '';
  vitals = [];
  matches = [];

  dat = [15, 78, 20, 105, 61];
  invst = 'Test';
  historyItem = 1;
  patient: Person = new Person();
  loading = false;
  processing = false;
  clientMode = null;
  errLine = null;
  message = null;
  edit = false;
  bpChart = [];
  suggestedPulseMax = 150;
  barChartOptions = ChartOptions.bp;
  pulseChartOptions = ChartOptions.pulse;
  tempChartOptions = ChartOptions.pulse;
  barChartType = 'bar';
  lineChartType = 'line';
  barChartLegend = false;
  bPChartData = [
    {
      label: 'Systolic',
      data: [60, 140, 110, 85, 105, 120, 90],
      tension: 0.0,
      borderColor: 'white',
      backgroundColor: (context) => {
        const index = context.dataIndex;
        const value = context.dataset.data[index];
        return value > 120 ? 'red' : 'ghostwhite';
      },
      pointBackgroundColor: ['white', 'white', 'whitesmoke', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 0
  },
  {
      label: 'Diastolic',
      data: [100, 70, 90, 195, 60, 80, 120],
      tension: 0.0,
      borderColor: 'white',
      backgroundColor: (context) => {
        const index = context.dataIndex;
        const value = context.dataset.data[index];
        return value > 80 ? 'red' : 'ghostwhite';
      },
      pointBackgroundColor: ['white', 'white', 'whitesmoke', 'white', 'white', 'white', 'rgb(255,190,70)'],
      pointRadius: 4,
      borderWidth: 0
  }
];
  data = [0,0,0,0,0];
  tempChartData = tempDataConfig(this.data);
  pulseChartData = pulseDataConfig(this.data);
  barChartLabels = ['', '', '', '',''];
  notes: Note[] = [];
  stamp = new Stamp();
  constructor(
     private dp: DatePipe,
     private dataService: DataService,
     private router: Router,
     private cookies: CookieService,
     private socket: SocketService,
     private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const day = null;
    this.loading = true;
    this.getClient();
    this.dataService.getHistory(this.route.snapshot.params.id).subscribe((res: any) => {
      this.loading = false;
      this.suggestions = res.s;
      this.notes = res.patient.record.notes;
      this.patient = res.patient;
      this.patient.record.notes = res.patient.record.notes
      .map(note => ({
        ...note,
        note: note.note.length > 150 ? note.note.substr(0, 150) : note.note
      }));
      this.populateChart();
    }, (e) => {
      this.message = '...Network Error';
      this.loading = false;
    });

    this.socket.io.on('record update', (update) => {
      if (update.patient._id === this.patient._id) {
        this.patient = {
          ...update.patient,
          record: {
          ...update.patient.record,
          notes: this.patient.record.notes
          }
        };
      }
    });
  }
populateChart() {
  switch (this.showing) {
    case 'PR':
      this.setChartVals(this.patient.record.vitals.pulse);
      break;
    case 'RR':
      this.setChartVals(this.patient.record.vitals.resp);
      break;
    case 'TEM':
      this.setChartVals(this.patient.record.vitals.tempreture);
      break;
    default:
      break;
  }
}
setChartVals(vals) {
  if(this.data.length > vals.length) {
    this.data.splice(vals.length, (this.data.length - vals.length));
    this.barChartLabels = this.barChartLabels.fill('', vals.length);
  } else {}
  vals.slice(0, 5).reverse().forEach((p, i) => {
    this.data[i] = p.value;
    this.barChartLabels[i] = this.dp.transform(p.stamp.dateAdded, 'dd-MM hh:mma').toLowerCase()
  });
}
switchVitals(label: string, unit) {
  this.unit = unit;
  this.showing  = label;
  this.toggleSortMenu();
  // this.data = [0,0,0,0,0];
  this.populateChart();
}
  isClarkable() {
    return (this.patient.record.visits[0][0].status === 'queued' || this.patient.record.visits[0][0].status === 'Admit') &&
    this.isConsult();
  }

  getDp(avatar: string) {
    return `${host}/dp/${avatar}`;
  }
  getMyDp() {
    return localStorage.getItem('dp');
  }
  pullImages(i, j, item) {
    this.images = (item === 'test') ? this.patient.record.investigations.tests[i][j]
    .report.attachments : this.patient.record.investigations.scans[i][j].report.attachments;
  }

  getLabs() {
    return this.client.departments.filter(dept => dept.category === 'Lab');
  }
  getDepts() {
    return this.client.departments.filter(dept => dept.category === 'Ward' || dept.category === 'Surgical');
  }
  compareNotes(i: number, note: Note) {

    // return this.notes[i].note.length === note.note.length;
  }
  downloadImage(file: string) {
    this.dataService.download(file).subscribe(
      res =>  saveAs(res, file)
    );
  }

  readMore(e: Event, i: number) {
    e.preventDefault();
    this.patient.record.notes[i].note = this.notes[i].note;
}
  getDocDp(avatar: string) {
      return `${host}/api/dp/${avatar}`;
  }



  showTimeLine() {
    return (this.unit === 'Meters' && this.patient.record.vitals.height.length) ||
    (this.unit === 'mmHg' && this.patient.record.vitals.bp.length) ||
    (this.unit === 'Kilograms' && this.patient.record.vitals.weight.length) ||
    (this.unit === 'Celcius' && this.patient.record.vitals.tempreture.length) ||
    (this.unit === 'bpm' && this.patient.record.vitals.pulse.length) ||
    (this.unit === 'cpm' && this.patient.record.vitals.resp.length);
  }


  switchClient(view: string) {
    this.clientMode =  view ;
  }
  addImmunizations() {
    const s: Vaccin[] = [];
    this.vaccins.forEach(vaccins => {
     vaccins.forEach(vcn => {
       if (vcn.selected) {
        s.push({
          name: vcn.name,
           stamp: stamp()
          });
        vcn.selected = false;
       }
     });
    });
    if (s.length) {
       this.patient.record.immunization.vaccins.unshift(s);
    }
    this.switchClient('view');
  }
  toggleSortMenu() {
    this.sortMenu = !this.sortMenu;
  }
  showEdit() {
    this.edit = true;
    this.session.vitals.height = (this.patient.record.vitals.height.length) ?
    cloneDeep(this.patient.record.vitals.height[0]) : new Height();
    this.session.vitals.weight = (this.patient.record.vitals.weight.length) ?
    cloneDeep(this.patient.record.vitals.weight[0]) : new Weight();
    this.session.vitals.bloodGl = (this.patient.record.vitals.bloodGl.length) ?
    cloneDeep(this.patient.record.vitals.bloodGl[0]) : new Bg();
    this.vit = 'in';
  }
  hideEdidt() {
    this.edit = false;
    this.vit = 'out';
  }

  checkProfiles() {
    if (this.session.vitals.height.value) {
        this.patient.record.vitals.height.unshift({
          ...this.session.vitals.height,
          stamp: stamp()
        });
    }
    if (this.session.vitals.weight.value) {
          this.patient.record.vitals.weight.unshift({
            ...this.session.vitals.weight,
            stamp: stamp()
          });
        }
    if (this.session.vitals.bloodGl.value) {
          this.patient.record.vitals.bloodGl[0] = {
            ...this.session.vitals.bloodGl,
            stamp: stamp()
          };
      }
  }
  addProfiles() {
   this.checkProfiles();
   this.editing = 'editing';
   this.dataService.updateHistory(this.patient).subscribe((patient: Person) => {
      this.patient.record  = patient.record;
      this.socket.io.emit('record update', {action: '', patient});
      this.editing = 'edited';
      setTimeout(() => {
        this.session.vitals = new Vitals();
        this.editing = null;
        this.hideEdidt();
        this.suggestions = [];
      }, 3000);
    }, (e) => {
      this.errLine = 'Unable to update record';
      this.processing = false;
    });
  }

  composeVitals() {
    this.patient.record.vitals = updateVitals(this.session.vitals, this.patient.record.vitals);
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isInfo() {
    return this.router.url.includes('information');
  }
  isConsult() {
    return !this.router.url.includes('information') &&
    !this.router.url.includes('pharmacy') &&
    !this.router.url.includes('billing') &&
    !this.router.url.includes('ward') &&
    !this.router.url.includes('admin');
  }



removeMedication(i: number) {
  this.session.medications.splice(i, 1);
  this.session.invoices.splice(i, 1);
}
removeComplain(complain: string, i: number) {
  this.session.complains.splice(i, 1);
  this.suggestions.splice(this.suggestions.findIndex(c => c.name ===  complain), 1);
}
removeHistory(complain: string, i: number) {
  // this.session.histories.splice(i, 1);
  // this.newSuggestions.splice(this.suggestions.findIndex(c => c.name ===  complain), 1);
}
removeCondition(condition: string, i: number) {
  this.session.conditions.splice(i, 1);
  this.suggestions.splice(this.suggestions.findIndex(c => c.name ===  condition), 1);
}
removePriscription(i: number) {
  this.session.medications.splice(i, 1);
  this.session.medInvoices.splice(i, 1);
}
removeTest(i) {
//  this.tests.splice(i, 1);
//  this.session.invoices.splice(i, 1);
}

switchHistory(i) {
  this.historyItem = i;
}
switchVital(i) {
  this.vital = i;
}
pickMatch(match) {
  switch (this.elem) {
    case 'test':
      this.session.test.name = match;
      break;
    case 'scan':
      this.session.scan.name = match;
      break;
    case 'surgery':
      this.session.test.name = match;
      break;
    case 'condition':
      this.session.condition.name = match;
      break;
    case 'complain':
      this.session.complain.complain = match;
      break;
    case 'medication':
      this.session.medication.product.name = match;
      break;
    case 'allegy':
      this.session.allegy.name = match;
      break;
    case 'pmh':
      this.session.pmh.name = match;
      break;
    case 'fsh':
      this.session.fsh.name = match;
      break;
    default:
      break;
  }
  this.matches = [];
  this.elem = null;
}


isEmptySession() {
  return this.isEmpty('requests') &&
  this.isEmpty('complains') &&
  this.isEmpty('conditions') &&
  this.isEmpty('note') &&
  this.isEmpty('medications') &&
  this.isEmpty('complains') &&
  this.isEmpty('examinations') &&
  this.isEmpty('vitals') &&
  this.isEmpty('medHist') &&
  this.isEmpty('fsh') &&
  this.isEmpty('allegies');
}
isEmpty(record) {
  switch (record) {
    case 'vitals' :
      return (!this.session.vitals.bp.systolic &&
        !this.session.vitals.tempreture.value &&
        !this.session.vitals.resp.value &&
        !this.session.vitals.pulse.value
        );
      break;
    case 'examinations' :
      return !this.session.examination.name;
      break;
    case 'complains' :
      return !this.session.complains.length;
      break;
    case 'medications' :
      return !this.session.medications.length;
      break;
    case 'allegies':
      return !this.session.history.pmh.allegies.length;
      break;
    case 'medHist':
      return !this.session.history.pmh.medHist.length;
      break;
    case 'fsh' :
      return !this.session.history.fsh.length;
      break;
    case 'note':
      return !this.session.note.note;
      break;
    case 'conditions':
      return !this.session.conditions.length;
      break;
    case 'requests':
      return !this.session.requests.length;
      break;
    default :
    break;
  }
}

fetchDept() {
  return this.client.departments
  .filter(dept => (dept.hasWard) && (dept.name !== this.patient.record.visits[0][0].dept));
}
getPriceTotal() {
  let total = 0;
  this.session.medInvoices.forEach((invoice) => {
     total = total + invoice.quantity * invoice.price;
   });
  return total;
}
getRequestTotal() {
  const invoices = cloneDeep(this.session.invoices);
  let total = 0;
  invoices.filter(i => i.desc === 'Test' || i.desc === 'Scan').forEach((invoice) => {
     total = total + invoice.quantity * invoice.price;
   });
  return total;
}
getClient() {
  this.dataService.getClient().subscribe((res: any) => {
    this.client = res.client;
    this.inventory = res.client.inventory;
});
}
next() {
  this.count = this.count + 1;
  this.clearSuggestions();
}
prev() {
  this.count = this.count - 1;
  this.clearSuggestions();
}
nextImage() {
  this.currentImage = this.currentImage + 1;
}
prevImage() {
  this.currentImage = this.currentImage - 1;
}
toggleComment(i, j, action) {
  this.patient.record.investigations.tests[i][j].report.stamp.selected = (action === 'open') ? true : false;
}
toggleScanComment(i, j, action) {
  this.patient.record.investigations.scans[i][j].report.stamp.selected = (action === 'open') ? true : false;
}
getLength(length) {
  return (length > 1 ) ? 's' : '';
}
getProducts() {
  this.dataService.getStocks().subscribe((res: any) => {
    this.inventory = res.inventory;
    this.medications = res.inventory.filter(m => m.stockInfo.category).map(med => med.name);
    this.session.items = res.items;
 });
}
showLogOut() {
  this.logout = true;
}
hideLogOut() {
  this.logout = false;
}
checkItems(type: string) {
  // return this.temItems.some(item => item.type === type);
}

addInvoice(items, itemType) {
  if (itemType === 'medication') {
    items.forEach(m => {
      console.log(m);
      // const p = this.inventory.find(stock => stock.signature === signStock(m.product));
      this.session.invoices.unshift({
        ...new Invoice(),
        name: this.formatMedication(m),
        price : 0,
        desc: `${m.priscription.freq} ${this.formatDuration(m.priscription.piriod, m.priscription.duration)}`,
        kind: 'Medication',
        processed: false,
        stamp: new Stamp()
      });
    });
  } else {
    items.forEach(item => {

      // const s = this.inventory.find(stock => stock.signature === signStock(m.product));
      this.session.invoices.unshift({
        ...new Invoice(),
        name: item.name,
        price:  0,
        desc: itemType,
        kind: 'Services',
        processed: false,
        stamp: new Stamp()
      });
    });
  }
}
clearSuggestions() {
  this.matches = [];
}
showSuggestions(field) {
  this.elem = field;
  this.errLine = null;
  this.matches = this.suggestions.filter(e => e.category === field).map(i => i.name);
  return this.matches.slice(0, 50);
}

searchMatch(term, name) {
  this.elem = name;
  this.matches = [];
  if (term.trim().length === 0) {
     this.matches = [];
     this.elem = null;
  }
  this.matches = this.suggestions.filter(i => new RegExp('\^' + term , 'i').test(i.name) && i.category === this.elem).map(s => s.name);
}

invoiceExist(name) {
  return this.session.invoices
  .some(invoice => invoice.name === name);
}

getStyle(medication) {
  return {
    textDecoration: medication.paused ? 'line-through' : 'none',
    color: medication.paused ? 'light-grey' : 'black'
  };
}

addSuggestions(items, cat) {
    switch (cat) {
      case 'complain':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.complain)) {
            this.newSuggestions.unshift({name: i.complain, category: cat});
          }
        });
        break;
      case 'condition':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      case 'test':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      case 'scan':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      case 'medication':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.product.name)) {
            this.newSuggestions.unshift({name: i.product.name, category: cat});
          }
        });
        break;
      case 'pmh':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      case 'pc':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      case 'allegy':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      case 'fsh':
        items.forEach(i => {
          if (!this.suggestions.some(s => s.name === i.name)) {
            this.newSuggestions.unshift({name: i.name, category: cat});
          }
        });
        break;
      default:
        break;
    }
}
addRecord(name) {
  switch (name) {
    case 'complain':
       this.session.complains.unshift({
     ...this.session.complain,
     stamp: new Stamp()
    });
       this.session.complain = new Complain();
       break;
     case 'condition':
       this.session.conditions.unshift({
     ...this.session.condition,
     stamp: new Stamp()
    });
       this.session.condition = new RecordItem();
       break;
    case 'request':
      if (this.session.test.name) {
        this.session.tests.unshift({
          ...this.session.test,
          stamp: new Stamp()
         });
        this.session.requests.unshift({
          ...this.session.test,
          stamp: new Stamp()
        });
        this.session.test.name = null;
      } else {
        this.session.scans.unshift({
          ...this.session.scan,
          dept: this.session.test.dept,
          urgency: this.session.test.urgency,
          stamp: new Stamp()
        });
        this.session.requests.unshift({
          ...this.session.scan,
          dept: this.session.test.dept,
          urgency: this.session.test.urgency,
        });
        this.session.scan.name = null;
        this.session.test.name = null;
      }
      break;
    case 'medication':
       this.session.medications.unshift({
        ...this.session.medication,
        stamp: new Stamp()
      });
       this.session.medication = new Medication();
       break;
    case 'pmh':
      this.session.history.pmh.medHist.unshift({
      ...this.session.pmh,
      stamp: new Stamp()
      });
      this.session.pmh = new RecordItem();
      break;
    case 'allegy':
      this.session.history.pmh.allegies.unshift({
      ...this.session.allegy,
      stamp: new Stamp()
      });
      break;
    case 'fsh':
      this.session.history.fsh.unshift({
      ...this.session.fsh,
      stamp: new Stamp()
      });
      this.session.fsh = new RecordItem();
      break;
    default:
      break;
  }
}
formatMedication(med: Medication) {
  return med.product.form +' '+ med.product.name + ' ' + med.product.size + med.product.unit;
}
formatDuration(p, d) {
  let m = null;
  switch (d) {
    case 'h':
      m = 'h';
      break;
    case 'd':
      m = '/7';
      break;
    case 'w':
      m = '/52';
      break;
    case 'm':
      m = '/12';
      break;
    case 'y':
      m = 'y';
      break;
    default:
      break;
  }
  return `${p}${m}`;
}
removeRecord(type, i, name?: string) {
  switch (type) {
    case 'complain':
       this.session.complains.splice(i, 1);
       break;
    case 'condition':
       this.session.conditions.splice(i, 1);
       break;
    case 'request':
      this.session.requests.splice(i, 1);
      this.session.tests = this.session.tests.filter(t => t.name !== name);
      this.session.scans = this.session.scans.filter(t => t.name !== name);
      break;
    case 'medication':
       this.session.medications.splice(i, 1);
       break;
    case 'pmh':
      this.session.history.pmh.medHist.splice(i, 1);
      break;
    case 'allegy':
      this.session.history.pmh.allegies.splice(i, 1);
      break;
    case 'fsh':
      this.session.history.fsh.splice(i, 1);
      break;
    default:
      break;
  }

}
isAdded(name) {
  let i = null;
  switch (name) {
    case 'complain':
      i = this.session.complains.some(c => c.complain === this.session.complain.complain);
      break;
    case 'condition':
      i = this.session.conditions.some(c => c.name === this.session.condition.name);
      break;
    case 'test':
      i = this.session.tests.some(t => t.name === this.session.test.name);
      break;
    case 'scan':
      i = this.session.scans.some(s => s.name === this.session.scan.name);
      break;
    case 'medication':
      i = this.session.medications.some(m => m.product.name === this.session.medication.product.name);
      break;
    case 'pmh':
      i = this.session.history.pmh.medHist.some(p => p.name === this.session.pmh.name);
      break;
    case 'allegy':
      i = this.session.history.pmh.allegies.some(p => p.name === this.session.allegy.name);
      break;
    case 'fsh':
      i = this.session.history.fsh.some(p => p.name === this.session.fsh.name);
      break;
    default:
      break;
  }
  return i;
}
addMoreItem(name) {
  if (!this.isAdded(name)) {
      this.addRecord(name);
  } else {
    this.errLine = `${this.elem} already added`;
  }
 }


 getPriscription(med) {
   return med.kind;
 }
 refresh() {

 }

searchScans() {
  if (!this.session.scan.name) {
    this.matches = [];
  } else {
      this.matches = this.scans.filter((name) => {
      const patern =  new RegExp('\^' + this.session.scan.name , 'i');
      return patern.test(name);
    });
  }
}
clearMsg() {
  this.errLine = null;
}
selectVaccin(i, j, action) {
 this.vaccins[i][j].selected = (action === 'check') ? true : false;
}
goTo(count: number) {
  this.count = count;
  this.clearSuggestions();
}


nextImg() {
    this.btn = 'next';
    if (this.imgCount < this.images.length - 1) {
      this.imgCount += 1;
    }
}
  nextStep() {
    this.step = 'finish';
  }
  prevImg() {
    this.btn = 'prev';
    if (this.imgCount > 0) {
      this.imgCount -= 1;
    }
  }
  prevStep() {
    this.step = 'start';
  }
  reset() {
    this.images = [];
    this.imgCount = 0;
    this.btn = null;
  }
  getClass(i: number): string {
    if (this.imgCount > i && this.btn === 'next') {
      return 'img-wrap rightOut';
    } else if (this.imgCount === i && this.btn === 'prev') {
      return 'img-wrap rightIn';
    } else if (this.imgCount < i && this.btn === 'prev') {
      return 'img-wrap leftOut';
    } else if (this.imgCount === i && this.btn === 'next') {
      return 'img-wrap leftIn';
    } else if (this.imgCount === i && !this.btn) {
      return 'img-wrap start';
    }
  }
  getPhoto(avatar: string) {
    return `${host}/api/dp/${avatar}`;
  }
  getInlineStyle(album) {
    const url = this.getPhoto(this.images[0]);
    return {
      background: `url(${url})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    };
  }

  getInputStyle() {
    return {
      width: (this.form === 'IVF') ? '70%' : '' ,
    };
   }
  getInStyle() {
    if (this.form === 'IVF') {
      return {
      width: '100%',
      borderRight: '1px solid ghostwhite',
    };
  }
    return {
      width: '100%',
      borderRight: '1px solid ghostwhite',
      borderTopRightRadius: '4px',
      borderBottomRightRadius: '4px'
  };
}

  getBackgrounds(name) {
    const url = this.getPhoto(name);
    return {
      backgroundImage: `url(${url})`,
    };
  }
  getImage(name) {
    return `${host}/api/dp/${name}`;
  }

  composeInvoices() {
    const invoices = cloneDeep([
      ...this.session.invoices,
      ...this.session.medInvoices
    ]);
    if (invoices.length) {
      if (this.patient.record.invoices.length) {
        if (new Date(this.patient.record.invoices[0][0].stamp.dateAdded)
        .toLocaleDateString() === new Date()
        .toLocaleDateString()) {
          for (const i of invoices) {
            this.patient.record.invoices[0].unshift(i);
          }
        } else {
            this.patient.record.invoices.unshift(invoices);
        }
        } else {
          this.patient.record.invoices = [invoices];
        }
      }
  }
  composeMedications() {
    if (this.session.medications.length) {
      // this.session.bills.push('Medication');
      if (this.patient.record.medications.length) {
      if (new Date(this.patient.record.medications[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date()
      .toLocaleDateString()) {
        for (const m of this.session.medications) {
          this.patient.record.medications[0].unshift(m);
        }
       } else {
          this.patient.record.medications.unshift(this.session.medications);
       }
      } else {
        this.patient.record.medications = [this.session.medications];
      }
      this.addInvoice(this.session.medications, 'medication');
      this.addSuggestions(this.session.medications, 'medication');
    }
  }
  composeTests() {
    if (this.session.tests.length) {
      // this.session.bills.push('cashier');
      if (this.patient.record.investigations.tests.length) {
      if (new Date(this.patient.record.investigations.tests[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const t of this.session.tests) {
          this.patient.record.investigations.tests[0].unshift(t);
        }
       } else {
          this.patient.record.investigations.tests.unshift(this.session.tests);
       }
      } else {
         this.patient.record.investigations.tests = [this.session.tests];
      }
      this.addInvoice(this.session.tests, 'test');
      this.addSuggestions(this.session.tests, 'test');
    }
  }
  composeScans() {
    if (this.session.scans.length) {
      if (this.patient.record.investigations.scans.length) {
      if (new Date(this.patient.record.investigations.scans[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        this.patient.record.investigations.scans[0] = [...this.session.scans, ...this.patient.record.investigations.scans[0]];
       } else {
          this.patient.record.investigations.scans.unshift(this.session.scans);
       }
      } else {
        this.patient.record.investigations.scans = [this.session.scans];
      }
      this.addInvoice(this.session.scans, 'Scaning');
      this.addSuggestions(this.session.scans, 'scan');
    }
  }
  composeSurgeries() {
    // if (this.session.surgeries.length) {
    //   this.session.bills.push('cashier');
    //   if (this.patient.record.surgeries.length) {
    //   if (new Date(this.patient.record.surgeries[0][0].stamp.dateAdded)
    //   .toLocaleDateString() === new Date().toLocaleDateString()) {
    //     for (const t of this.session.surgeries) {
    //       this.patient.record.surgeries[0].unshift(t);
    //     }
    //    } else {
    //       this.patient.record.surgeries.unshift(this.session.surgeries);
    //    }
    //   } else {
    //     this.patient.record.surgeries = [this.session.surgeries];
    //   }
    // }
  }
  composeComplains() {
    console.log(this.patient.record.complains);
    if (this.session.complains.length) {
    if (this.patient.record.complains.length) {
      if (new Date(this.patient.record.complains[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const c of this.session.complains) {
          this.patient.record.complains[0].unshift(c);
        }
       } else {
          this.patient.record.complains.unshift(this.session.complains);
       }
      } else {
         this.patient.record.complains = [this.session.complains];
      }
    this.addSuggestions(this.session.complains, 'complain');
    }
  }
  composeHistory() {
    // tslint:disable-next-line:max-line-length
    if (this.session.history.pc.length ||
        this.session.history.fsh.length ||
        this.session.history.pmh.allegies.length ||
        this.session.history.pmh.medHist.length
        ) {
      if (this.patient.record.histories.length) {
        if (new Date(this.patient.record.histories[0].stamp.dateAdded)
        .toLocaleDateString() === new Date().toLocaleDateString()) {
          this.patient.record.histories[0].pc = [
            ...this.session.history.pc,
            ...this.patient.record.histories[0].pc
          ];
          this.patient.record.histories[0].fsh = [
            ...this.session.history.fsh,
            ...this.patient.record.histories[0].fsh
          ];
          this.patient.record.histories[0].pmh.allegies = [
            ...this.session.history.pmh.allegies,
            ...this.patient.record.histories[0].pmh.allegies
          ];
          this.patient.record.histories[0].pmh.medHist = [
            ...this.session.history.pmh.medHist,
             ...this.patient.record.histories[0].pmh.medHist
          ];
        }
        this.patient.record.histories.unshift(this.session.history);
      }
      this.patient.record.histories.push(this.session.history);
    } else {}
    this.addSuggestions(this.session.history.fsh, 'fsh');
    this.addSuggestions(this.session.history.pmh.allegies, 'allegy');
    this.addSuggestions(this.session.history.pmh.medHist, 'pmh');
  }
  composeConditions() {
    if (this.session.conditions.length) {
    if (this.patient.record.conditions.length) {
      if (new Date(this.patient.record.conditions[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        for (const c of this.session.conditions) {
          this.patient.record.conditions[0].unshift(c);
        }
       } else {
        this.patient.record.conditions.unshift(this.session.conditions);
       }
      } else {
        this.patient.record.conditions = [this.session.conditions];
      }
    }
  }
  composeScalars() {
    if (this.session.note.note) {
      this.patient.record.notes.unshift({
        ...this.session.note,
        stamp: stamp()
      });
    } else {}
    if (this.session.pc.name) {
       this.session.history.pc.push({
         ...this.session.pc,
         stamp: stamp()
      });
       this.addSuggestions([this.session.pc], 'pc');
    }
  }
  composeExams() {
    if (this.session.examination.name) {
      if (this.patient.record.examinations.length) {
      if (new Date(this.patient.record.examinations[0][0].stamp.dateAdded)
      .toLocaleDateString() === new Date().toLocaleDateString()) {
        this.patient.record.examinations[0] = [{
          ...this.session.examination,
          stamp: stamp()
        },
        ...this.patient.record.examinations[0]];
       } else {
          this.patient.record.examinations.unshift([{
            ...this.session.examination,
            stamp: stamp()
          }]);
       }
      } else {
        this.patient.record.examinations = [[{
          ...this.session.examination,
          stamp: stamp()
        }]];
      }
      this.addSuggestions([this.session.examination], 'exam');
    }
  }

  sendRecord() {
    this.errLine = null;
    this.processing = true;
    this.dataService.updateHistory(this.patient, this.newSuggestions)
    .subscribe((patient: Person) => {
      this.patient.record  = patient.record;
      this.socket.io.emit('record update', {
        action: 'encounter',
        bills: this.session.bills,
        patient
      });
      this.populateChart();
      this.session = new Session();
      this.feedback = 'Record successfully updated';
      this.processing = false;
      // this.suggestions = [];
      setTimeout(() => {
        this.feedback = null;
      }, 5000);
    }, (e) => {
      this.errLine = 'Unable to update record';
      this.processing = false;
    });
  }

  updateRecord() {
    this.composeVitals();
    this.composeTests();
    this.composeScans();
    this.composeSurgeries();
    this.composeComplains();
    this.composeHistory();
    this.composeConditions();
    this.composeMedications();
    this.composeInvoices();
    this.composeScalars();
    this.composeExams();
    this.sendRecord();
  }
}

