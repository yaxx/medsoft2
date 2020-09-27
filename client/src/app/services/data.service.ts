import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Stock, Suggestion} from '../models/inventory.model';
import {Client, Department} from '../models/client.model';
import {Person} from '../models/person.model';
import * as socketIo from 'socket.io-client';
import {Router} from '@angular/router';
import { Socket } from '../models/socket';
import {host} from '../util/url';
import {CookieService} from 'ngx-cookie-service';
declare var io: {
  connect(url: string): Socket;
};
@Injectable({
  providedIn: 'root'
})
export class DataService {
  uri = `${host}/api`;
  options = { 
    headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
  }
  socket: Socket;
  staff: Person = new Person();
  patients: Person[] = new Array<Person>();
  constructor(
    private router: Router,
    private http: HttpClient,
    private cookies: CookieService
  ) {}

  getHistory(id) {
    return this.http.get(
      `${this.uri}/history/${id}`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  logOut() {
    this.cookies.deleteAll();
    this.router.navigate(['/']);
  }
  getMyAccount() {
    return this.http.get(
      `${this.uri}/myaccount`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  explore() {
    return this.http.get(
      `${this.uri}/explore`, { withCredentials: true }
      );
  }
  getConnections(id) {
     return this.http.get(
      `${this.uri}/connections/${id}`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
      );
  }
  getPatients(type?: string, page?: number) {
    return this.http.get(
      `${this.uri}/patients/${type}`, {
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  getConsultees(dept) {
    return this.http.get(
       `${this.uri}/consultation/${dept}`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
       );
  }

  updateStocks(stocks, action, suggestions) {
    return this.http.post(
      `${this.uri}/update-stocks`, {stocks, action, suggestions}, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  runTransaction(pid, record, cart, reciepts) {
    return this.http.post(
      `${this.uri}/transaction`, {id: pid, record, cart, reciepts}, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  login (user) {
    return this.http.post(
      `${host}/login`, user
    );
  }
  searchPatient(id) {
    return this.http.get(
      `${this.uri}/patient/${id}`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      } 
    );
  }

  createClient(client) {
    return this.http.post(
      `${this.uri}/new-client`, client, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  saveRecord(record) {
    return this.http.post(
      `${this.uri}/new-record`, record, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }

  updateRecord(patient, items = []) {
    return this.http.post(
      `${this.uri}/update-record`, {patient, items} , { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
 }
  card(patient, card, invoice, entry) {
    return this.http.post(
      `${this.uri}/add-card`, {patient, card, invoice, entry} , { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
 }
  updateHistory(patient, suggestions = []) {
    return this.http.post(
      `${this.uri}/update-history`, {patient, suggestions} , { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
 }
  updateInfo(info, id) {
    return this.http.post(
      `${this.uri}/update-info`, {info, id}, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
 }
  uploadScans(formData) {
    return this.http.post(
      `${this.uri}/upload-scans`, formData, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  upload(image, pid) {
    return this.http.post(
      `${this.uri}/upload`, image, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  getTransactions(date) {
    return this.http.get(
      `${this.uri}/trans/${date}`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  download(file: string) {
    return this.http.post(
      `${this.uri}/download`, {fileName: file}, {
        withCredentials: true,
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }
  updateMedication(m) {
     return this.http.post(
      `${this.uri}/update-medication`, {medications: m}, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  updateMessages(msg) {
     return this.http.post(
      `${this.uri}/update-msg`, msg, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  updateBed(patient, client) {
    return this.http.post(
      `${this.uri}/updatebed`, {patient, client}, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  updateNote(i, n) {
    return this.http.post(
      `${this.uri}/updatenote`, {id: i, note: n}, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  getNotifications() {
    return this.http.get(
      `${this.uri}/notifications`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  addNotifications(note) {
    return this.http.post(
      `${this.uri}/addnotification`, note, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  getNew() {
    return this.staff;
  }
  getClient() {
    return this.http.get(
      `${this.uri}/client`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  getStocks() {
    return this.http.get(
      `${this.uri}/products`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }

  getItems() {
    return this.http.get(
      `${this.uri}/items`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }


  getDepartments() {
    return this.http.get(
      `${this.uri}/departments`, { 
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );

  }

  addPerson(person: Person) {
     return this.http.post(
        // `${this.uri}/person`, staff, this.options
        `${this.uri}/new-patient`, person, { 
          headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
        }
      );
    }
    addPatient(patient: Person) {
      return this.http.post(
        `${this.uri}/new-patient`, patient, { 
          headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
        }
      );
    }
  updateClient(client) {
    return this.http.post(
      `${this.uri}/updateclient`, client, {
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
  updateDept(dept) {
    return this.http.post(
      `${this.uri}/update-dept`, dept, {
        headers: new HttpHeaders().set('authorization', localStorage.getItem('token'))
      }
    );
  }
 
}


