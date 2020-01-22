// const { error } require 'util'
const mongoose = require ('mongoose')
const Person = require('../models/schemas/person')
const Client = require ('../models/schemas/client')
const escpos = require('escpos')
const Capture = require ('../models/schemas/capture')
const Department = require ('../models/schemas/department')
const multer = require ('multer')
const path = require('path');
const  truncate  = require ('fs');
const Notification = require('../models/schemas/noteschema')
const Connection = require('../models/schemas/connection')
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
// var Messages = require('../models/schemas/messageschema')
let name = null
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
    let con = null
    let  person
    if(data.info.official.hospital){
      con = await new Connection().save()
       person = await new Person({
        info: data.info, 
        record: data.record,                                                                                   
        connections:  con._id
      }).save() 
    } else {
      person = await new Person({
        info: data.info, 
        record: data.record,                                                                                   
      }).save() 
    }
    if(con) {
        await Client.findOneAndUpdate({
        _id: person.info.official.hospital
      },{ 
        $push: {staffs: person._id }
      }
    )
  } else {}
  return person
} catch (e)  {
  throw e
  }
}


module.exports = {
uploadFile: (req, res) => {
  upload(req, res, (err) => {
    if(err) {
     return res.status(501).jason({error:err})
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
// postReport: (req, res) => {
//   console.log(req.body)
//   uploads(req, res, (err) => {
//     if(err) {
//      return res.status(501).jason({error: err})
//     } else {
//       console.log(req.files)
//     for (const file of req.files) {
//        req.body.patient.record.tests[req.body.fileindex.i][req.body.index.j].push(file.filename)
//     }
//     console.log(req.files)
//      this.updateRecord(req, res)
//     }
//   })
// },
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
  const exist = await Person.findOne({
    'info.contact.me.mobile': req.body.info.contact.me.mobile
  })
  res.send(await createPerson({
    info: req.body.info,
    record: req.body.record
   })
  )
  // if(exist) {
  //     res.status(400).send(exist)
  //   } else {
  //     res.send(await createPerson({
  //      info: req.body.info,
  //      record: req.body.record
  //     })
  //    )
  //   }
  }
catch (e) {
  throw e
}
  
},

getPatients: async (req, res) => {

  try {



    
    // console.log('printPaper! start')
    // const device = new escpos.USB();
    // const device = new escpos.Serial('COM10');
    // const device  = new escpos.Network('localhost');
    // const options = {encoding: "GB18030" /* default */}
    // const printer = new escpos.Printer(device, options);
    // device.open(function () {
    //     printer
    //         .font('a')
    //         .align('ct')
    //         .style('bu')
    //         .size(1, 1)
    //         .text('Hello world!')
    //         .text('Welcome to the Awesome-land!!!')
    //         .cut()
    //         .close();
    // })
   
    // console.log('printPaper! end')
    const {info: {official}} = await Person.findById(req.cookies.i).select('info');
    let patients = await Person.find()
    patients = Array.from(patients).filter(person => person.info.official.department === null);
    //record transformation
  //   patients = Array.from(patients).map(p => p.toJSON()).map(patient => {
  //     let {record} = patient
  //     delete record.famHist
  //     return ({
  //       ...patient, record: {
  //         ...record, histories: []
  //     }
  //   }) 
  // })
  // for (p of patients) {
  //     Person.findByIdAndUpdate( mongoose.Types.ObjectId(p._id),{"record": p.record}, {new: true}, (e, data) => {
  //       if(e) {
  //         console.log(e)
  //       }
       
  //     })
  // }

    
    switch(official.role) {
      case 'Doctor':
        patients = patients.filter(patient => patient.record.visits[0][0].status === req.params.type && patient.record.visits[0][0].dept === official.department);
         res.send(patients) 
      break;
      case 'Nurse':
        patients = patients.filter(patient => patient.record.visits[0][0].status === req.params.type && patient.record.visits[0][0].dept === official.department);
        res.send(patients) 
      break;
      case 'Pharmacist':
        patients = patients.filter(patient => patient.record.medications.length > 0);
        res.send(patients) 
      case 'Lab Scientist':
          patients = patients.filter(patient => patient.record.tests
            .some(t => t.dept === official.dept) || patient.record.scans.some(t => t.dept === official.dept));
            res.send(patients) 
      break;
      case 'Cashier':
        patients = patients.filter(patient => patient.record.invoices.length > 0);
         res.send(patients) 
      break;
      case 'Admin':
        patients = (req.params.type) ? patients.filter(patient => patient.record.visits[0][0].status === req.params.type) : patients.filter(patient => patient.record.medications.length) ;
         res.send(patients) 
      break;
      default:
      if(req.params.type === 'out') {
        console.log('default')
        patients = patients.filter(patient => patient.record.visits[0][0].status === 'out' || !patient.record.visits[0][0].status);
      } else {
         patients = patients.filter(patient => patient.record.visits[0][0].status === req.params.type);
      }
        res.send(patients) 
      break
      // res.send(patients) 
    }
    
    // if (patients.length >= (Number(req.params.page) * 9) + 9 ) {
    //    patients = patients.slice(Number(req.params.page) * 9, 9);
    // } else {
    //   patients = patients.slice(Number(req.params.page) * 9);
    // }
    
    
  }
  catch(e){
    throw e
  }
   
},


addClient: async (req, res) => {
  try {
    const exist = await Person.findOne({ $or: [{
      'info.contact.me.email': req.body.info.email}, {
        'info.contact.me.mobile': req.body.info.mobile
      }]
    })
    if(exist) {
        res.status(400).send(exist)
      } else {
        const client = await new Client(req.body).save()
            let data = {
              info: {
                personal: {
                  firstName: 'Admin',
                  lastName: '',
                  username: 'admin',
                  password: req.body.info.password,
                  avatar:'avatar.jpg'
                },
                contact: {
                  me: {
                    email: req.body.info.email,
                    mobile: req.body.info.mobile
                  }
                },
                official: {
                  hospital: client._id,
                  department:'Admin',
                  role: 'admin'
                }
              }
            }
            const person  = await createPerson(data)
            res.send(person)
          }
         
        }
  catch(e) {
      throw e
    }
 
},
getConnections: (req, res) => {
  
  //   .populate('people.person')
  //   .exec((err, con) => {
  //     if (err) {
  //       console.log(err)
  //     } else {
  //       res.send(con)
  //     }
  // })
},

getMyAccount: async (req, res) => {
  try {
    const me  = await Person.findById(req.cookies.i,'_id info connections')
    me.connections = await Connection.findById(me.connections)
    .populate({path:'people.person', select:'_id info'})
    .exec()
    res.send(me)
  } 
  catch (e) {
   console.log(e)
  }
 
 },






updateMessages: (data)=>{
Connection.findOneAndUpdate({'people.person': data.sender},{"people.$.messages": data.convs},(e, me)=>{
    if(!e){
      Connection.findOneAndUpdate({'people.person': data.reciever},{"people.$.messages": data.convs},(e, myconn) => {
        if(!e){
          console.log(myconn)// res.send(myconn);
        }else{
          console.log(e)
        }
      })
    } else {
      console.log(e)
    }
  })

},

explore: async (req, res) => {
  try {
    const people = await Person.find({'info.official.hospital': req.cookies.h},'info' )
    res.send(people);
  }
  catch(e) {
    throw e
  }
},
runTransaction: async (req, res) => {
  try {
     let client = await Client.findByIdAndUpdate(req.cookies.h)
     req.body.cart.forEach(product => {
      client.inventory[client.inventory.findIndex(pro => pro._id.toString() === product._id)] = product;
    });
    const person = await Person.findByIdAndUpdate( req.body.id, {
      'record': req.body.record
     }, {new: true})
    await client.save()
    res.send(person)
  }
  catch(e) {
    throw e
  }      
 
},

login: async (req, res) => {
  try {
    const person = await Person.findOne({ $or: [{
      'info.contact.me.email':req.body.username,
      'info.personal.password': req.body.password
    },
    {
      'info.personal.username': req.body.username,
      'info.personal.password': req.body.password
    },
    {
      'info.personal.mobile': req.body.username,
      'info.personal.password': req.body.password
    }
  ]
})

  if(person) {
    res.send(person)
  } else {
      res.status(400).send('Invalid credentials');
  }
} catch(e) {
    throw e
  }
  
},
  
getClient: async (req, res)=> {
  try {
    const client  = await Client.findById(req.cookies.h)
    .populate('staffs').exec()
    const depts = await Department.find()
    res.send({client: client, departments: depts})
  }
  catch(e) {
    throw e
  }
},

deleteStaff: (req, res)=>{
  //     Client.findOneAndUpdate({
  //       _id:req.body.hosId
  //     },{
  //       $pull: {
  //         staffs:req.body._id
  //       }
  //     })
  //     res.send(docs)
    
  // })

},
updateClient: async (req, res) => {
  try {
      const client = await Client.findByIdAndUpdate(req.cookies.h, {
      info: req.body.info,
      departments: req.body.departments,
      inventory: req.body.inventory
    },{new: true})
    res.send(client);
  }

  
 catch(e) {
    throw e
  } 
},
getInPatients: (req, res)=>{
    Person.find({'record.visits.status':'admitted'},(e, patients)=>{
    if(!e){
 
      res.send(patients)
    }
    else{
      console.log(e)
    }
  })
},
getOrders: (req, res)=>{
 Person.find({},(e,patients)=>{
    if(!e){
     
      res.send(patients)
    }
    else{
      console.log(e)
    }
  })
},

updateBed: (req, res)=>{
  Client.findOneAndUpdate({
    _id: req.body.client._id,
 },{departments:req.body.client.departments},{ new: true},(e,client) => {
   if(!e) {
      Person.findOneAndUpdate({_id:req.body.patient._id},
        {record:req.body.patient.record},{new:true},(e,patient) => {
          if(!e){
            res.send({patient:patient,client:client})
          } else {
            console.log(e)
          }
        })
   } else {
     console.log(e)
   }
 })

},
updateInfo: async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(req.body.id,{
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
    await Capture.insertMany(req.body.items);
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
addCard: async (req, res) => {
  try {
    let patient = null;
    const person = await Person.findOne({'info.personal.cardNum': req.body.card.pin})
    if(person) {
      if (person.info.persnal.cardType === 'Family' && req.body.card.category === 'Family') {
        if(!req.body.patient.record.cards.some(c => c.pin === req.body.card.pin)) {
          req.body.patient.record.cards.unshift(req.body.card)
          req.body.patient.info.personal.cardType = req.body.card.category
          req.body.patient.info.personal.cardNum = req.body.card.pin
          req.body.patient.record.invoices.unshift({
            ...req.body.invoice, 
            name: 'Consultation', 
            desc: req.body.card.category,
            kind: req.body.card.pin
          })
        } else {
          req.body.patient.info.personal.cardType = req.body.card.category
          req.body.patient.info.personal.cardNum = req.body.card.pin
        }
      } else {
        res.status(400).send('Error validating card');
      }
    } else {
      req.body.patient.record.cards.unshift(req.body.card)
      req.body.patient.info.personal.cardType = req.body.card.category
      req.body.patient.info.personal.cardNum = req.body.card.pin
      req.body.patient.record.invoices.unshift({
        ...req.body.invoice,
         name: 'Card', 
         desc: req.body.card.category,
         kind: req.body.card.pin
        })
    }
     patient = await Person.findByIdAndUpdate(
      req.body.patient._id, req.body.patient, {new: true}
      )
    res.send(patient);
  } catch (error) {
    res.status(400).send('Error validating card');
  }
},
getHistory: async (req, res) => {
  try {
    const captures = await Capture.find()
    const patient = await Person.findById(req.params.id)
    .populate({
      path:'record.notes.meta.addedBy', select:'info'
    })
    .populate({
      path:'record.conditions.meta.addedBy', select:'info'
    })
    .populate({
      path:'record.tests',
      populate: {path: 'report.meta.addedBy', select: 'info'}
    })
    .exec()
    res.send({patient, captures}) 
  }
  catch(e){
    throw e
  }
   
},
updateHistory: async(req, res) => {
  try {
     console.log(req.body)
   const c = await Capture.insertMany(req.body.captures);
   console.log(c)
    const person = await Person.findByIdAndUpdate(
      req.body.patient._id, {
        record: req.body.patient.record
      },{new: true}
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


updateNote: (req, res)=>{
  Person.findOne({ _id:req.body.id} ,(e, doc) => {
     if(!e){
      doc.record.notes.push(req.body.note)
      doc.save((e,p)=>{
        if(!e){
          res.send(p)
        }
        else{
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

updateMedication: async (req, res) => {
  try {
  let {record:{medications}} = await Person.findByIdAndUpdate(req.cookies.i,{"record.medications": req.body.medications}, {new: true})
   res.send(medications)
  } catch(e) {
    throw e
  }

 
//   Person.findOneAndUpdate({_id:req.body.id },
//      {
//        'record.medications': req.body.medication
//      },{new:true},(e, patient) => {
//     if(!e){
//       res.send(patient)
//   } else {
//     console.log(e)
//   }
// })

},

// const mycon = await Connection.findByIdAndUpdate(
//   me.connections,{ $push: {people: {
//       person: person._id,
//       follower: false,
//       following: true,
//       blocked: false,
//       messages: []
//   }},
//  })

addProduct: async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.cookies.h, { $push: {inventory: { $each: req.body.products}}}, {new: true} )
    // req.body.items = req.body.items.map(item => ({...item, type: 'drug'}))
    // await Item.insertMany(req.body.items)
    let cart = client.inventory.splice(client.inventory.length - req.body.products.length, req.body.products.length)
    res.send(cart)
}
  catch(e)  {
    throw e
  }
},
getProducts: async (req, res) => {
  try {
    let {inventory} = await Client.findById(req.cookies.h)
  //    client.inventory = Array.from(client.inventory).map(o => o.toJSON()).map(product => ({...product, type:'Products'}))
  //  client = await client.save()
      res.send({inventory})
  }
  catch(e)  {
    throw e
  }
      
},

updateProducts: async (req, res) => {
  try {
       let client = await Client.findByIdAndUpdate(req.cookies.h)
       req.body.forEach(product => {
        client.inventory[client.inventory.findIndex(pro => pro._id.toString() === product._id)] = product;
      });
      await client.save()
      res.send()
 }
 catch (e) {
   throw e
 }
},
// },

deleteProducts: async (req, res) => {
  try {
    let client = await Client.findByIdAndUpdate(req.cookies.h)
    req.body.forEach(product => {
      client.inventory.splice(client.inventory.findIndex(pro => pro._id.toString() === product._id),1) 
    });
    await client.save()
    res.send()
 }
 catch (e) {
   throw e
 }
},





// checkSession: (req, res) => {
//   if (req.cookies.q) {
//     res.status(200).send('in session')
//   } else {
//     res.status(403).send('out of session')
//   }
// },

getPerson: function (req, res) {
  User.findOne({username: req.params.username}, (err, person) => {
    if (!err) {
      res.send(person)
    } else { console.log(err) }
  })
},
getMessages: function (req, res) {
  Messages.find({parties: {$in: [req.params.username, req.cookies.username]}}, 'chats', (err, chats) => {
    if (!err) {
      console.log(chats)
      res.send(chats)
    } else {}
  })
},

// getNotifications: function (req, res) {
//   Notifications.updateMany({to: req.cookies.username}, {$set: {seen: true}}, (err, note) => {
//     if (err) {
//       console.log(err)
//     } else {
//       console.log(note)
//     }
//   })
//   Notifications.find({to: req.cookies.username}).populate('require', 'name username dp _id').exec((err, notes) => {
//     if (!err) {
      
//       res.send(notes)
//     } else { console.log(err) }
//   })
// },
// getNewNotifications: function (req, res) {
//   Notifications.find({to: req.cookies.username, seen: false}, (err, notes) => {
//     if (!err) {
    
//       res.send(notes)
//     } else { console.log(err) }
//   })
// },
getProfile: function (req, res) {
  User.find({username: req.cookies.username}, (err, prof) => {
    if (!err) {
  
      res.send(prof)
    } else { console.log(err) }
  })
},
comments: function (req, res) {
  res.render('comments')
},
getPeople: function (req, res) {
  User.find({}, 'name username dp address _id', (err, ppl) => {
    if (!err) {
      // console.log(ppl)
      res.send(ppl)
    } else {
       console.log(err)
       }
  })
},

index: function (req, res) {
  res.render('index')
  if (req.cookies.login === true) {

  }
  res.redirect(304, 'login')
}

}
