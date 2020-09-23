// const { error } require 'util'
const mongoose = require ('mongoose')
const Person = require('../models/schemas/person')
const Client = require ('../models/schemas/client')
const Suggestion = require ('../models/schemas/suggestions')
const data = require ('../models/data')
const Department = require ('../models/schemas/department')
const multer = require ('multer')
const path = require('path');
const  truncate  = require ('fs');
const Notification = require('../models/schemas/noteschema')
const Connection = require('../models/schemas/connection')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const escpos = require('escpos');
// escpos.USB = require('escpos-usb');
// const device  = new escpos.USB()
// const options = { encoding: "GB18030" /* default */ }
// const printer = new escpos.Printer(device, options);


let name = null;
const store = multer.diskStorage({
 destination:'./uploads',
 filename: (req, file, cb) => {
 cb (null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({
  storage: store
}).single('file')
const uploads = multer({
  storage: store
}).array('files')

const createPerson = async data => {
  try {
    let  person = null;
    if(data.info.official.hospital) {
      new Person(data).save()
      .then((p) => {
        person = p
        Client.findOneAndUpdate({ _id: person.info.official.hospital }, {
        $push: {staffs: person._id }}, {new: true}
        )
        .then((client) => console.log(client.staffs))
        .catch((err) => console.log(err)); 
      })
      .catch((e) => console.log(e)) 


    //  bcrypt.genSalt(10, (err, salt) => {
    //     bcrypt.hash(data.info.personal.password, salt, (err, hashed) => {
    //       if (err) {
    //         throw err
    //       } else {
    //         data.info.personal.password = hashed
    //          new Person(data).save()
    //          .then((p) => {
    //             person = p
    //             Client.findOneAndUpdate({ _id: person.info.official.hospital }, {
    //             $push: {staffs: person._id }}, {new: true}
    //             )
    //             .then((client) => console.log(client.staffs))
    //             .catch((err) => console.log(err)); 
    //           })
    //           .catch((e)=>console.log(e)) 
    //         }
    //       })
    //     })
    } else {
     person = await new Person(data).save() 
  }
  return data
} catch (e)  {
  throw e
  }
}


module.exports = {
uploadFile: (req, res) => {
  upload(req, res, (err) => {
    if(err) {
     return res.status(501).jason({error: err})
    } else {
     res.send(req.file.filename)
    }
  })
},
uploadScans: (req, res) => {
  uploads(req, res, (err) => {
    if(err) {
     return res.status(501).jason({error: err})
    } else {
    res.send(req.files)
    }
  })
},

getDp: (req, res) => {
  const filePath = path.join(__dirname, '../uploads') + '/' + req.params.id
  res.sendFile(filePath);
},
downloadFile: (req, res) => {
  const filename = path.join(__dirname, '../uploads') + '/' + req.body.fileName
  res.sendFile(filename);
},
addPerson: async (req, res) => {
  try {
  const p = await Person.findOne({
    'info.contact.me.mobile': req.body.info.contact.me.mobile
  })
  if(!p) {
    let response = await createPerson(req.body) 
      if(response) {
        res.send(response)
      } else {
        res.sendStatus(403)
      }
  } else {
    res.sendStatus(403)
  }
}
catch (e) {
  throw e
  }
},

getPatients: async (req, res) => {
  try {
    const {info: {official}} = await Person.findById(req.user._id).select('info');
    let patients = await Person.find().sort({'updatedAt': -1}).lean()
    patients = patients.filter(person => person.info.official.department === null);
    let suggestions = []
    // record transformation

    switch(official.role) {
      case 'Doctor':
        patients = patients.filter(
          patient => patient.record.visits[0][0].status === req.params.type && 
          patient.record.visits[0][0].dept === official.department
      );
      break;
      case 'Nurse':
        patients = patients.filter(
          patient => patient.record.visits[0][0].status === req.params.type && 
          patient.record.visits[0][0].dept === official.department
        );
      break;
      case 'Pharmacist':
        patients = patients.filter(
          patient => patient.record.medications.length > 0
        );
        break
      case 'Lab Scientist':
          patients = patients.filter(patient => patient.record.tests
            .some(test => test.some(t => t.dept === official.department)) || patient.record.scans
            .some(scan => scan.some(s.dept === official.department))
          );
      break;
      case 'Receptionist':
        if(req.params.type === 'billing') {
          patients = patients.filter(patient => patient.record.invoices.length > 0);
        } else if (req.params.type === 'out') {
          patients = patients.filter(
            patient => patient.record.visits[0][0].status === req.params.type || 
            !patient.record.visits[0][0].status
            );
            suggestions = await Suggestion.find({category: 'name'})
        } else {
          suggestions = await Suggestion.find({category: 'name'})
          patients = patients.filter(
            patient => patient.record.visits[0][0].status === req.params.type
          );
        }
      break;
      case 'Admin':
        patients = (req.params.type) ? patients.filter(
          patient => patient.record.visits[0][0].status === req.params.type) : patients.filter(
            patient => patient.record.medications.length
        );
      break;
      default:
      if(req.params.type === 'out') {
        patients = patients.filter(
          patient => patient.record.visits[0][0].status === 'out' || 
          !patient.record.visits[0][0].status);
      } else {
         patients = patients.filter(
           patient => patient.record.visits[0][0].status === req.params.type
          );
      }
      break
    }
    res.send({patients, suggestions})
  }
  catch(e) {
    throw e
  }
   
},


  addClient: async (req, res) => {
  try {
    const client = await Person.findOne({ $or: [{
      'info.contact.me.email': req.body.client.info.email}, {
        'info.contact.me.mobile': req.body.client.info.mobile
      }]
    })
    if(client) {
        res.status(400).send(client)
      } else {
        const client = await new Client(req.body.client).save()
            let admin = {
              info: {
                personal: {
                  firstName: 'Admin',
                  lastName: '',
                  username: 'admin',
                  password: req.body.client.info.password,
                  avatar:'avatar.jpg'
                },
                contact: {
                  me: {
                    email: req.body.client.info.email,
                    mobile: req.body.client.info.mobile
                  }
                },
                official: {
                  hospital: client._id,
                  department:'Admin',
                  role: 'admin'
                },
                stamp: {
                  addedBy: null,
                  facility: client._id
                }
              }
            }
            let person  = await createPerson(admin)
            person.info.stamp.addedBy = person._id
            person.info.stamp.facility = client._id
            res.send(await person.save())
          }
      }
  catch(e) {
      throw e
    }
},


getMyAccount: async (req, res) => {
  try {
    const me  = await Person.findById(req.user._id,'_id info')
    let colleagues  = await Person.find({
      "info.official.role": {$ne: null}
    })
    res.send({me, colleagues})
  } 
  catch (e) {
   console.log(e)
  }
 
 },






updateMessages: async (req, res) => {
  try {
    const reciever = await Person.findById(req.body.rid)
    const i = reciever.messages.findIndex(m => m.contactId === req.body.sid)
    if (i === -1) {
      reciever.messages.push(req.body.to)
    } else {
      reciever.messages[i] = req.body.to
    }
    let sender = await Person.findById(req.body.sid)
    const j = sender.messages.findIndex(m => m.contactId === req.body.rid)
    if(j === -1) {
      sender.messages.push({
        ...req.body.to,
        contactId: req.body.rid
      })
    } else {
      sender.messages[j] = {
        ...req.body.to, 
        contactId: req.body.rid
      }
    }
    sender.save()
    reciever.save()
    res.send()
  } catch (error) {
    console.log(error)
  }
},

runTransaction: async (req, res) => {
  try {
     let client = await Client.findByIdAndUpdate(req.user.info.official.hospital)
     req.body.cart.forEach(product => {
      client.inventory[client.inventory.findIndex(pro => pro._id.toString() === product._id)] = product;
    });
    const person = await Person.findByIdAndUpdate( req.body.id, {
      'record': req.body.record
     }, {new: true})
    await client.save()
    let reciepts = [];
    let totalAmount = 0;
    req.body.reciepts.forEach(r => {
      let nameSpace = 26 - r.name.length
      let ammountSapce = 5 - r.price.toString().length
      let totalSpace = nameSpace + ammountSapce
      totalAmount += r.price
      let s = '';
      for(let i = 0; i < totalSpace; i++) {
        s = s.concat(' ');
      }
      reciepts.push({
        text: r.name + s + r.price, align:"LEFT", width:0.65
      })
    })
    // device.open(function(error) {
    //   printer
    //   .font('a')
    //   .style('bu')
    //   .size(1, 1)
    //   .align('ct')
    //   .text('JAMAA HOSPITAL')
    //   .drawLine()
    //   .tableCustom(reciepts)
    //   .drawLine()
    //   .align('rt')
    //   .text(totalAmount.toLocaleString())
    //   .qrimage('./uploads/sn.jpg', function(err) {
    //     this.cut();
    //     this.close();
    //   })
    //   .align('ct')
    //   .text(new Date().toLocaleString())
    // });
    res.send(person)
  }
  catch(e) {
    throw e
  }      
},
verify: (req, res, next) => {
  const bearerHeader =  req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
   jwt.verify(bearerHeader.split(' ')[1], 'secretKey', (err, data) => {
    if(!err) {
      req.user = data.person
    } else {
      res.sendStatus(403);
    }
  })
   next()
  } else {
    res.sendStatus(403)
  }
},

login: async (req, res) => {
  try {
    const person = await Person.findOne({
      'info.personal.username': req.body.username, 
      'info.personal.password': req.body.password 
    })
  if(person) {
    jwt.sign({person}, 'secretKey', (err, token) => {
      res.send({token:`Bearer ${token}`, person})
    })


  //   bcrypt.compare(req.body.password, person.info.personal.password, (err, isMatch) => {
  //     if(err) {
  //       res.status(400).send('Invalid credentials');
  //     } else {}
  //      if (isMatch) {
  //       console.log(isMatch);
  //       jwt.sign({person}, 'secretKey', (err, token) => {
  //         res.send({token:`Bearer ${token}`, person})
  //     })
  //   } else {
  //     res.status(400).send('Invalid credentials');
  //   }
    
  // })
  } else {
      res.status(400).send('Invalid credentials');
  }
} catch(e) {
    throw e
  }
  
},

getClient: async (req, res) => {
  try {
    const client  = await Client.findById(req.user.info.official.hospital)
    .populate('staffs').exec()
    const depts = await Department.find()
    res.send({client: client, departments: depts})
  }
  catch(e) {
    throw e
  }
},


updateClient: async (req, res) => {
  try {
      const client = await Client.findByIdAndUpdate(req.user.info.official.hospital, {
      info: req.body.info,
      departments: req.body.departments,
      inventory: req.body.inventory
    },{new: true}
    )
    res.send(client);
  }
 catch(e) {
    throw e
  } 
},
updateDept: async (req, res) => {
  try {
      const client = await Client.findByIdAndUpdate(req.user.info.official.hospital)
      client.departments.unshift(req.body)
      client.save()
      res.send(req.body);
  }
 catch(e) {
    throw e
  } 
},




updateInfo: async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.body.id, {
      info: req.body.info
    }, {new: true})
    res.send(person.info);
  }
  catch(e) {
    throw e
  } 
},
updateRecord: async (req, res) => {
  try {
    await Suggestion.insertMany(req.body.items);
    const person = await Person.findByIdAndUpdate(
      req.body.patient._id, {
        record: req.body.patient.record
      },{new: true}
      )
   res.send(person);
  }
  catch(e) {
    throw e
  } 
},

getHistory: async (req, res) => {
  try {
    const s = await Suggestion.find({category: {$ne:'name'}})
    const patient = await Person.findById(req.params.id)
    .populate({
      path:'record.notes.meta.addedBy', 
      select:'info'
    })
    .populate({
      path:'record.conditions.meta.addedBy', 
      select:'info'
    })
    .populate({
      path:'record.tests',
      populate: {path: 'report.meta.addedBy',
       select: 'info'
       }
    })
    .exec()
    res.send({patient, s}) 
  }
  catch(e){
    throw e
  }
   
},
updateHistory: async(req, res) => {
  try {
   const c = await Suggestion.insertMany(req.body.suggestions);
    const person = await Person.findByIdAndUpdate(
      req.body.patient._id, {
        record: req.body.patient.record
      }, {new: true}
    )
     const patient = await Person.findById(req.body.patient._id)
      .populate({path: 'record.notes.meta.addedBy', select: 'info'})
      .exec()
      res.send(patient);
  }
  catch(e) {
    throw e
  } 
},


updateNote: (req, res) => {
  Person.findOne({ _id:req.body.id} ,(e, doc) => {
     if(!e){
      doc.record.notes.push(req.body.note)
      doc.save((e,p) => {
        if(!e){
          res.send(p)
        }
        else {
          console.log(e)
        }
      })
  } else {console.log(e)}
  })
},
getNotifications: async (req, res)=>{
 try {
   const notes = await Notification.find()
   res.send(notes);
 } catch (error) {
   console.log(error)
 }
},
addNotifications: async(req, res)=>{
 try {
   const note = await new Notification(req.body.note).save()
   res.send(note);
 } catch (error) {
   console.log(error)
 }
},



addProduct: async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.user.info.official.hospital, { 
      $push: {
        inventory: {
          $each: req.body.products
        }
      }
    }, {new: true} 
    )
    let cart = client.inventory.splice(client.inventory.length - req.body.products.length, req.body.products.length)
    res.send(cart)
}
  catch(e)  {
    throw e
  }
},


getProducts: async (req, res) => {
  try {
    let {inventory} = await Client.findById(mongoose.Types.ObjectId(req.user.info.official.hospital))
    let patients = await Person.find({
      "record.invoices": {
        $elemMatch: {
          $elemMatch: {
            paid: true, 
            datePaid: new Date().toLocaleDateString()
          }
        }
      }
    })
    patients.forEach(p => {
      p.record.invoices = p.record.invoices
      .map(i => i.filter(invoice => invoice.paid && invoice.datePaid === new Date().toLocaleDateString()))
      .filter(i => i.length > 0)
    })
    res.send({inventory, patients})
  }
  catch(e)  {
    throw e
  }
},

getTransactions: async (req, res) => {
  try {
    let patients = await Person.find({
      "record.invoices": {
        $elemMatch: {
          $elemMatch: {
            paid: true, 
            datePaid: new Date(req.params.date).toLocaleDateString()
          }
        }
      }
    })
    patients.forEach(p => {
      p.record.invoices = p.record.invoices
      .map(i => i.filter(invoice => invoice.paid && invoice.datePaid === new Date(req.params.date).toLocaleDateString()))
      .filter(i => i.length > 0)
    })
    res.send(patients);
  }
  catch(e)  {
    throw e
  }
},

updateStocks: async (req, res) => {
  try {
    let client = await Client.findById(req.user.info.official.hospital).lean()
    let {inventory} = client;
    switch(req.body.action) {
      case 'add':
        inventory = [...req.body.stocks,...inventory];
      break;
      case 'edit':
        req.body.stocks.forEach(newStock => {
          inventory = inventory
          .map(oldStock => (oldStock._id.equals(newStock._id)) ? newStock : oldStock);
      })
      break;
      case 'delete':
        req.body.stocks.forEach(newStock => {
          inventory = inventory.filter(oldStock => !oldStock._id.equals(newStock._id))
      })
      break;
      default:
      break
    }
    // client.inventory = inventory
    client = await Client.findByIdAndUpdate(mongoose.Types.ObjectId(req.user.info.official.hospital), {inventory: inventory}, {new: true}, (e,doc) => {
      if(e) {
        console.log(e)
      }
    })
    if(req.body.action === 'add') {
        let newStocks = client.inventory.slice(0, req.body.stocks.length)
        res.send(newStocks);
    } else {
      res.send([])
    }
  }
 catch (e) {
   throw e
  }
}


}