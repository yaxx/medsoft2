import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../services/data.service';
import {SocketService} from '../../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import { Connection, Colleque, Person, Info, Notification } from '../../../models/person.model';
import {Message } from '../../../models/message.model';
import {host} from '../../../util/url';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  curPerson = new Person();
  dept = null;
  info = null;
  admin = null;
  seg2 = null;
  message = null;
  me = null;
  curcolleques: any[] = [];
  cardView = null;
  follows: Person[] = [];
  contacts: any[] = [];
  coleagues: Person[] = [];
  curMsgIndex = 0;
  person: Person = new Person();
  sugestions: Person[] = [];
  hovers = [0, 0, 0, 0];
  input = [0, 0, 0, 0];
  rightCard = 'profile';
  leftCard = '';
  editing = null;
  errLine = false;
  showMenu = false;
  element = null;
  menuOpened = false;
  chatsOpened = false;
  peopleView = true;
  title = this.chatsOpened ? 'Close' : 'Open';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private data: DataService,
    private cookies: CookieService,
    public socket: SocketService
) { }

  ngOnInit() {
    this.info = this.route.snapshot.url[0].path || null;
    this.admin = this.route.snapshot.url[0].path || null;
    this.seg2 = this.route.snapshot.url[0].path  || null;
    this.getMyAccount();
    this.me = localStorage.getItem('i');
    this.socket.io.on('new message', (data) => {
      const i = this.coleagues.findIndex(c => c._id === data.sender);
      if (this.coleagues[i].messages.length) {
        const j = this.coleagues[i].messages.findIndex(m => m.contactId === data.reciever);
        if (j !== -1) {
          this.coleagues[i].messages[j].chats = data.msg.chats;
        } else {
          this.coleagues[i].messages.push({
            ...new Colleque(),
            contactId: localStorage.getItem('i'),
            chats: data.msg.chats
          }) ;
        }
      } else {
        this.coleagues[i].messages.push({
          ...new Colleque(),
          contactId: localStorage.getItem('i'),
          chats: data.msg.chats
        });
      }
      if (this.curPerson._id === data.sender) {
        const n = this.curPerson.messages.findIndex(cont => cont.contactId === data.reciever);
        if (n !== -1) {
            this.curPerson.messages[n].chats = data.msg.chats;
        }
      }

    });


  }
  isConsult() {
    return !this.isInfo() &&
     !this.isBillable() &&
     !this.isWard() &&
     !this.isAdmin();
  }
  toggleMainMenu() {
    this.menuOpened = (this.menuOpened) ? false : true;
    console.log(this.menuOpened);
  }
  toggleChats() {
    this.chatsOpened = (this.chatsOpened) ? false : true;
  }
  getCurrentChats() {
    return (this.curPerson.messages.length) ? this.curPerson.messages[this.curMsgIndex].chats : [];
  }
  timeStyler(i) {
    return {
      left: !this.isSender(i) ? '53px' : ''
    };
  }
  getClass() {
    return (this.menuOpened) ? 'opened' : 'closed';
  }
  isAdmin() {
    return this.router.url.includes('admin');
  }
  isMessages() {
    return this.router.url.includes('messages');
  }
  isInfo() {
    return this.router.url.includes('information');
  }
  isWard() {
    return this.router.url.includes('ward');
  }
  isVisible() {
    return !this.router.url.includes('pharmacy') || !this.router.url.includes('billing');
  }
  isPharmacy() {
    return this.router.url.includes('pharmacy');
  }

  isBillable() {
    return this.router.url.split('/')[1] === 'pharmacy' ||
    this.router.url.split('/')[1] === 'billing' ||
    this.router.url.split('/')[1] === 'lab';
  }



  getMsgClass(i) {
    return (this.isSender(i))  ? 'message-send' : 'message-recieved';
  }

  getDp(avatar: string) {
    return `${host}/dp/${avatar}`;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getMsgDp(id: string) {
       return this.getDp(this.curPerson.info.personal.avatar) ;
  }
  isSender(i) {
    return (this.curPerson.messages[this.curMsgIndex].chats[i][0].sender === this.me) ? true : false;
  }


  getMyAccount() {
    this.data.getMyAccount().subscribe((account: any) => {
      this.person = account.me;
      this.coleagues = account.colleagues
      .filter(col => col._id !== this.person._id);
      });
    }
  toggelePeopleView() {
    this.peopleView = (this.peopleView) ? false : true;
  }
  selectPerson(person) {
    this.curPerson = person;
    const i = this.curPerson.messages
    .findIndex((contact) => contact.contactId === localStorage.getItem('i'));
    if (i !== -1) {
      this.curMsgIndex = i;
    } else {
      this.curPerson.messages.unshift({
        ...new Colleque(),
          contactId: localStorage.getItem('i'),
          chats: []
      });
    }
    this.toggelePeopleView();
  }


  getContacts() {
    return this.coleagues;
     // return this.person.connections.people.filter(contact => contact.follower && contact.following);
   }



   check($event) {
    if ($event.keyCode === 13 ) {
      $event.preventDefault();
      this.sendMessage();
      this.message = null;
    }
  }
  updateMessages() {
    this.data.updateMessages({
      sid: localStorage.getItem('i'),
      rid: this.curPerson._id,
      to: this.curPerson.messages[this.curMsgIndex]
     }).subscribe(() => {
      this.socket.io.emit('new message', {
        msg: this.curPerson.messages[this.curMsgIndex],
        sender: localStorage.getItem('i'),
        reciever: this.curPerson._id
    });
   });
  }
  indicate(e) {
    console.log(e.target);
  }

  sendMessage() {
    if (this.curPerson.messages[this.curMsgIndex].chats.length) {
      if (this.curPerson.messages[this.curMsgIndex]
        .chats[this.curPerson.messages[this.curMsgIndex].chats.length - 1][0]
        .sender === localStorage.getItem('i')) {
        this.curPerson.messages[this.curMsgIndex]
        .chats[this.curPerson.messages[this.curMsgIndex].chats.length - 1]
        .push(new Message(
          this.message,
          localStorage.getItem('i'),
          this.curPerson._id
        ));
        } else {
        this.curPerson.messages[this.curMsgIndex].chats.push([
            new Message(
            this.message,
            localStorage.getItem('i'),
            this.curPerson._id
        )]);
      }
    } else {
      this.curPerson.messages[this.curMsgIndex].chats[0] = [
        new Message(
        this.message,
        localStorage.getItem('i'),
        this.curPerson._id
     )];
    }
    // this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    this.updateMessages();

}
getLastChatTime(person) {
  let time = null;
  const me = person.messages.find(m => m.contactId === this.me);
  if (me) {
    if (me.chats.length > 0) {
      time = me.chats[me.chats.length - 1][me.chats[me.chats.length - 1].length - 1].sendOn;
    } else {
      person = person.createdAt;
    }
  } else {
    time = person.createdAt;
  }
  return time;
}

getLastMessage(person) {
  let lastMsg = null;
  const me = person.messages.find(m => m.contactId === this.me);
  if (me) {
    if (me.chats.length > 0) {
      lastMsg = me.chats[me.chats.length - 1][me.chats[me.chats.length - 1].length - 1].message;
    } else {
      lastMsg = person.info.official.department;
    }
  } else {
    lastMsg = person.info.official.department;
  }
  return lastMsg;
}



}


