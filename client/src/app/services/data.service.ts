import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Product, Item} from '../models/inventory.model';
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
  socket: Socket;
  staff: Person = new Person();
  patients: Person[] = new Array<Person>();
  constructor(
    private http: HttpClient,
    private cookies: CookieService,
    private router: Router
    ) { }
  getHistory(id) {
    return this.http.get(
      `${this.uri}/history/${id}`, {withCredentials: true}
      );
  }
  logOut() {
    this.cookies.deleteAll();
    this.router.navigate(['/']);
  }
  getMyAccount() {
    return this.http.get(
      `${this.uri}/myaccount`, {withCredentials: true}
      );
  }
  explore() {
    return this.http.get(
      `${this.uri}/explore`, { withCredentials: true }
      );
  }
  getConnections(id) {
     return this.http.get(
      `${this.uri}/connections/${id}`, {withCredentials: true} );
  }
  getPatients(type?:string, page?:number) {
    return this.http.get(
      `${this.uri}/patients/${type}/${page}`, {withCredentials: true}
      );
  }
  getConsultees(dept) {
    return this.http.get(
       `${this.uri}/consultation/${dept}`, {withCredentials: true}
       );
  }
  follow(id) {
     return this.http.post(
      `${this.uri}/follow`, {id}, {withCredentials: true}
    );
  }
  followBack(id) {
    return this.http.post(
      `${this.uri}/followback`, {id}, {withCredentials: true}
      );
  }
  unFollow(me, you) {
    return this.http.post(
      `${this.uri}/unfollow`, {id: me, yourid: you.person._id, yourcon: you.person.connections}, {withCredentials: true}
      );
  }
  
  addProducts(products: Product[], items: Item[]) {
    return this.http.post(
    `${this.uri}/new-product`,  {products, items}, {withCredentials: true}
    );
  }
  updateProducts(products) {
    return this.http.post(
      `${this.uri}/update-products`, products, {withCredentials: true}
      );
  }
  runTransaction(pid, record, cart) {
    return this.http.post(
      `${this.uri}/transaction`, {id: pid, record, cart}, {withCredentials: true}
      );
  }
  deleteProducts(product) {
    return this.http.post(
      `${this.uri}/delete-products`, product, {withCredentials: true}
      );
  }
  login (user) {
    return this.http.post(
      `${this.uri}/login`, user, {withCredentials: true}
       );
  }
  searchPatient(id) {
    return this.http.get(
      `${this.uri}/patient/${id}`, {withCredentials: true} );
  }

  createClient(client) {
    return this.http.post(
      `${this.uri}/new-client`, client, {withCredentials: true});
  }
  saveRecord(record) {
    return this.http.post(
      `${this.uri}/new-record`, record, {withCredentials: true});
  }

  updateRecord(patient, items = []) {
    return this.http.post(
      `${this.uri}/update-record`, {patient, items} , {withCredentials: true});
 }
  card(patient, card, invoice) {
    return this.http.post(
      `${this.uri}/add-card`, {patient, card, invoice} , {withCredentials: true});
 }
  updateHistory(patient, captures = []) {
    return this.http.post(
      `${this.uri}/update-history`, {patient, captures} , {withCredentials: true});
 }
  updateInfo(info, id) {
    return this.http.post(
      `${this.uri}/update-info`, {info, id}, {withCredentials: true});
 }


  uploadScans(formData) {
    return this.http.post(
      `${this.uri}/upload-scans`, formData, {withCredentials: true});
  }
  upload(image, pid) {
    return this.http.post(
      `${this.uri}/upload`, image, {withCredentials: true});
  }
  download(file: string){
    return this.http.post(
      `${this.uri}/download`, {fileName: file}, {
        withCredentials: true,
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json')

      });
  }
  updateMedication(m) {
     return this.http.post(
      `${this.uri}/update-medication`, {medications: m}, {withCredentials: true});
  }
  updateBed(patient, client) {
    return this.http.post(
      `${this.uri}/updatebed`, {patient: patient, client: client}, {withCredentials: true});
  }
  updateNote(i, n) {
    return this.http.post(
      `${this.uri}/updatenote`, {id: i, note: n}, {withCredentials: true});

  }
  getNotifications() {
    return this.http.get(
      `${this.uri}/notifications`, {withCredentials: true});
  }
  addNotifications(note) {
    return this.http.post(
      `${this.uri}/addnotification`, {note: note}, {withCredentials: true});
  }
  getNew() {
    return this.staff;
  }
  getClient() {
    return this.http.get(
      `${this.uri}/client`, {withCredentials: true}
      );
  }
  getProducts() {
    return this.http.get(
      `${this.uri}/products`, {withCredentials: true}
      );
  }
  getItems() {
    return this.http.get(
      `${this.uri}/items`, {withCredentials: true}
      );
  }
  getInPatients() {
    return this.http.get(
      `${this.uri}/inpatients`, {withCredentials: true}
      );
  }
  getOrders() {
    return this.http.get(
      `${this.uri}/orders`, {withCredentials: true});
  }
  getDepartments() {
    return this.http.get(
      `${this.uri}/departments`, {withCredentials: true});

  }

  addPerson(person: Person) {
     return this.http.post(
        // `${this.uri}/person`, staff, {withCredentials: true}
        `${this.uri}/new-patient`, person, {withCredentials: true}
      );
    }
    addPatient(patient: Person) {
      return this.http.post(
        `${this.uri}/new-patient`, patient, {withCredentials: true}
        );
    }
  updateClient(client) {
    return this.http.post(
      `${this.uri}/updateclient`, client, {withCredentials: true});
  }
}

