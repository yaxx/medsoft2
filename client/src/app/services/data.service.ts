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
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
    ) {}


  getHistory(id) {
    return this.http.get(
      `${this.uri}/history/${id}`, this.options
      );
  }
  logOut() {
    this.cookies.deleteAll();
    this.router.navigate(['/']);
  }
  getMyAccount() {
    return this.http.get(
      `${this.uri}/myaccount`, this.options
      );
  }
  explore() {
    return this.http.get(
      `${this.uri}/explore`, { withCredentials: true }
      );
  }
  getConnections(id) {
     return this.http.get(
      `${this.uri}/connections/${id}`, this.options );
  }
  getPatients(type?: string, page?: number) {
    return this.http.get(
      `${this.uri}/patients/${type}`, this.options
    );
  }
  getConsultees(dept) {
    return this.http.get(
       `${this.uri}/consultation/${dept}`, this.options
       );
  }
  follow(id) {
     return this.http.post(
      `${this.uri}/follow`, {id}, this.options
    );
  }
  followBack(id) {
    return this.http.post(
      `${this.uri}/followback`, {id}, this.options
      );
  }
  unFollow(me, you) {
    return this.http.post(
      `${this.uri}/unfollow`, {id: me, yourid: you.person._id, yourcon: you.person.connections}, this.options
      );
  }

  addProducts() {

  }
  updateStocks(stocks, action, suggestions) {
    return this.http.post(
      `${this.uri}/update-stocks`, {stocks, action, suggestions}, this.options
      );
  }
  runTransaction(pid, record, cart,reciepts) {
    return this.http.post(
      `${this.uri}/transaction`, {id: pid, record, cart, reciepts}, this.options
      );
  }
  deleteProducts(product) {

  }
  login (user) {
    return this.http.post(
      `${host}/login`, user, this.options
       );
  }
  searchPatient(id) {
    return this.http.get(
      `${this.uri}/patient/${id}`, this.options );
  }

  createClient(client) {
    return this.http.post(
      `${this.uri}/new-client`, client, this.options);
  }
  saveRecord(record) {
    return this.http.post(
      `${this.uri}/new-record`, record, this.options);
  }

  updateRecord(patient, items = []) {
    return this.http.post(
      `${this.uri}/update-record`, {patient, items} , this.options);
 }
  card(patient, card, invoice, entry) {
    return this.http.post(
      `${this.uri}/add-card`, {patient, card, invoice, entry} , this.options);
 }
  updateHistory(patient, suggestions = []) {
    return this.http.post(
      `${this.uri}/update-history`, {patient, suggestions} , this.options);
 }
  updateInfo(info, id) {
    return this.http.post(
      `${this.uri}/update-info`, {info, id}, this.options);
 }
  uploadScans(formData) {
    return this.http.post(
      `${this.uri}/upload-scans`, formData, this.options);
  }
  upload(image, pid) {
    return this.http.post(
      `${this.uri}/upload`, image, this.options);
  }
  getTransactions(date) {
    return this.http.get(
      `${this.uri}/trans/${date}`, this.options);
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
      `${this.uri}/update-medication`, {medications: m}, this.options);
  }
  updateMessages(msg) {
     return this.http.post(
      `${this.uri}/update-msg`, msg, this.options);
  }
  updateBed(patient, client) {
    return this.http.post(
      `${this.uri}/updatebed`, {patient, client}, this.options);
  }
  updateNote(i, n) {
    return this.http.post(
      `${this.uri}/updatenote`, {id: i, note: n}, this.options);

  }
  getNotifications() {
    return this.http.get(
      `${this.uri}/notifications`, this.options);
  }
  addNotifications(note) {
    return this.http.post(
      `${this.uri}/addnotification`, note, this.options);
  }
  getNew() {
    return this.staff;
  }
  getClient() {
    return this.http.get(
      `${this.uri}/client`, this.options
      );
  }
  getStocks() {
    return this.http.get(
      `${this.uri}/products`, this.options
      );
  }
  getItems() {
    return this.http.get(
      `${this.uri}/items`, this.options
      );
  }


  getDepartments() {
    return this.http.get(
      `${this.uri}/departments`, this.options);

  }

  addPerson(person: Person) {
     return this.http.post(
        // `${this.uri}/person`, staff, this.options
        `${this.uri}/new-patient`, person, this.options
      );
    }
    addPatient(patient: Person) {
      return this.http.post(
        `${this.uri}/new-patient`, patient, this.options
        );
    }
  updateClient(client) {
    return this.http.post(
      `${this.uri}/updateclient`, client, this.options );
  }
  updateDept(dept) {
    return this.http.post(
      `${this.uri}/update-dept`, dept, this.options);
  }
 
}


