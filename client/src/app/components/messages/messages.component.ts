import { Component, AfterViewInit , OnInit, ElementRef, ViewChild} from '@angular/core';
import {DataService} from '../../services/data.service';
import {SocketService} from '../../services/socket.service';
import {CookieService } from 'ngx-cookie-service';
import { FileSelectDirective, FileUploader } from 'ng2-file-upload';
import { Connection, Colleque, Person, Info, Notification } from '../../models/person.model';
import {Message } from '../../models/message.model';
import { AuthService } from '../../services/auth.service';

const uri = 'http://192.168.1.100:5000/api/upload';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  // queries: {
  //   "chatBody" : new ViewChild({},"chatBody");
  // },
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements  OnInit {
url = null;
uploader: FileUploader = new FileUploader({url: uri});
people = 'followings';
leftcard = 'contacts';
file: File = null;
curcolleques: any[] = [];
cardView = null;
curPerson = new Person();
follows: Person[] = [];
contacts: any[] = [];
coleagues: Person[] = [];
message = null;
me = null;
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
// @ViewChild('chatBody', {static: false})
oldPwd = null;
  constructor(
    private data: DataService,
    private cookies: CookieService,
    public socket: SocketService,
    private authService: AuthService,
    private elm: ElementRef
  ) {}
  ngOnInit() {
      this.getMyAccount();
      this.me = this.cookies.get('i');
      this.socket.io.on('new message', (data) => {
        const i = this.coleagues.findIndex(c => c._id === data.sender);
        if (this.coleagues[i].messages.length) {
          const j = this.coleagues[i].messages.findIndex(m => m.contactId === data.reciever);
          if (j !== -1) {
            this.coleagues[i].messages[j].chats = data.msg.chats;
          } else {
            this.coleagues[i].messages.push({
              ...new Colleque(),
              contactId: this.cookies.get('i'),
              chats: data.msg.chats
            }) ;
          }
        } else {
          this.coleagues[i].messages.push({
            ...new Colleque(),
            contactId: this.cookies.get('i'),
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
      this.socket.io.on('online', (data) => {
        this.contacts.forEach(contact => {
          if (contact.person._id === data.sender) {
              contact.person.info.online = true;
          }
        });
      });
      this.uploader.onCompleteItem = (
        item: any, response: any, status: any, headers: any ) => {
        this.person.info.personal.avatar = response;
        this.data.updateInfo(this.person.info, this.person._id).subscribe((info: Info) => {
           this.person.info = info;
        });
       };
   }
   fileSelected(event) {
      this.file = <File>event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (e) => {
        let ev = <any>e; // called once readAsDataURL is completed
        this.url = ev.target.result;
      };
  }

  getMe() {
    return this.cookies.get('i');
  }
  showInput(i: number) {
    this.input[i] = 1;
  }
  check($event) {
    if ($event.keyCode === 13 ) {
      $event.preventDefault();
      this.sendMessage();
      this.message = null;
    }
  }
  sendMessage() {
    if (this.curPerson.messages[this.curMsgIndex].chats.length) {
      if (this.curPerson.messages[this.curMsgIndex]
        .chats[this.curPerson.messages[this.curMsgIndex].chats.length - 1][0]
        .sender === this.cookies.get('i')) {
        this.curPerson.messages[this.curMsgIndex]
        .chats[this.curPerson.messages[this.curMsgIndex].chats.length - 1]
        .push(new Message(
          this.message,
          this.cookies.get('i'),
          this.me
        ));
        } else {
        this.curPerson.messages[this.curMsgIndex].chats.push([
            new Message(
            this.message,
            this.cookies.get('i'),
            this.me
        )]);
      }
    } else {
      this.curPerson.messages[this.curMsgIndex].chats[0] = [
        new Message(
        this.message,
        this.cookies.get('i'),
        this.me
     )];
    }
    // this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    this.updateMessages();

}
  updateMessages() {
    this.data.updateMessages({
      sid: this.person._id,
      rid: this.curPerson._id,
      to: this.curPerson.messages[this.curMsgIndex]
     }).subscribe(() => {
      this.socket.io.emit('new message', {
        msg: this.curPerson.messages[this.curMsgIndex],
        sender: this.cookies.get('i'),
        reciever: this.curPerson._id
    });
   });
  }
  indicate(e) {
    console.log(e.target);
  }
  selectPerson(person) {
    this.curPerson = person;
    const i = this.curPerson.messages
    .findIndex((contact) => contact.contactId === this.cookies.get('i'));
    if (i !== -1) {
      this.curMsgIndex = i;
    } else {
      this.curPerson.messages.unshift({
        ...new Colleque(),
          contactId: this.cookies.get('i'),
          chats: []
      });
    }
    // this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    // console.log(this.chatBody.nativeElement.scrollTop, this.chatBody.nativeElement.scrollHeight );
  }
  isSender(i) {
    return (this.curPerson.messages[this.curMsgIndex].chats[i][0].sender === this.me) ? true : false;
  }
  timeStyler(i) {
    return {
      left: !this.isSender(i) ? '53px' : ''
    };
  }
  getMsgClass(i) {
    return (this.isSender(i))  ? 'message-send' : 'message-recieved';
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
  getCurrentChats() {
    return this.curPerson.messages[this.curMsgIndex].chats;
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

  getMyAccount() {
    this.data.getMyAccount().subscribe((account: any) => {
      this.person = account.me;
      this.coleagues = account.colleagues
      .filter(col => col._id !== this.person._id);
     });
  }
  back(view) {
    this.rightCard = view;
  }
   getDp(avatar: string) {
    return 'http://localhost:5000/api/dp/' + avatar;
  }

  getMyDp() {
    return this.getDp(this.cookies.get('d'));
  }
  getMsgDp(id: string) {
       return 'http://localhost:5000/api/dp/' + this.curPerson.info.personal.avatar;
  }
  explore() {
    this.data.explore().subscribe((suggestions: Person[]) => {
         this.sugestions = suggestions.filter(p => p._id !== this.cookies.get('i'));
    });
  }

  updateProfile() {
    this.person.info = this.editing;
    if(this.url) {
      if(this.oldPwd) {
       if(this.editing.personal.password === this.oldPwd){
        this.person.info.personal.password = this.oldPwd;
        this.uploader.uploadAll();
        this.rightCard = 'profile';
        this.input = [0, 0, 0, 0];
       } else {
        this.errLine = true;
       }
      } else {
        this.uploader.uploadAll();
        this.rightCard = 'profile';
        this.input = [0, 0, 0, 0];
        this.showMenu = false;
      }
    } else if(this.oldPwd) {
      if(this.editing.personal.password === this.oldPwd) {
        this.person.info.personal.password = this.oldPwd;
        this.uploader.uploadAll();
        this.rightCard = 'profile';
        this.input = [0, 0, 0, 0];
        this.showMenu = false;
    } else {
      this.errLine = true;
    }
    } else {
    this.uploader.uploadAll();
    this.rightCard = 'profile';
    this.input = [0, 0, 0, 0];
    this.showMenu = false;
   }
  }
  toggleMenu() {
    this.showMenu = this.showMenu ? false : true;
  }
  switchToEdit(view: string) {
    this.editing = this.person.info;
    this.switchMenu(view);
    this.toggleMenu();
  }
  switchMenu(view: string) {
    this.rightCard = view;
    this.toggleMenu();
}
  switchRightCard(view) {
    this.rightCard = view;
  }
  getContacts() {
   return this.coleagues;
    // return this.person.connections.people.filter(contact => contact.follower && contact.following);
  }

}
