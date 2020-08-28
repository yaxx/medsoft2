let {inventory} = await Client.findById(req.cookies.h).lean()
        let stocks = [];
        let services = [];
        inventory = Array.from(inventory).map(i => {
          if(i.type === 'Products') {
            stocks.push({
              product: {
                name: i.item.name.split(' ')[0],
                conc: null,
                size: null,
                unit: null,
                expiry: null,
                category: null
            },
            stockInfo: {
              expiry: null,
              price: null,
              expired: false,
              status: false,
              quantity: null,
              inStock: null 
            }
            })
          } else if (i.type ==='Services') {
            services.push({
              name: i.item.name.split(' ')[0],
              engagements: null,
              category:null
            })
          } else {}
            return i;
        })
        let i = {stocks: stocks, services: services}
        await Client.findOneAndUpdate({'info.city':null}, {inventory: i})




        
    let {inventory} = await Client.findById(req.cookies.h).lean()
    inventory.stocks = inventory.stocks.map(i => ({
        product: {
          name: i.product.name,
          size: null,
          unit: null
        },
        stockInfo: {
          expiry: null,
          price: 0,
          sold: 0,
          category: null,         
          quantity: null
        },
        stamp: {
          addedBy: null,
          facility: null,
          selected: false,
          dateAdded: new Date()
      }
    }))
    inventory.services = inventory.services.map(s => ({
        product: {
          name: s.name,
        },
        stockInfo: {
          expiry: null,
          price: 0,
          sold: 0,
          category: null,         
          quantity: null
        },
        stamp: {
          addedBy: null,
          facility: null,
          selected: false,
          dateAdded: new Date()
      }
    }))
    await Client.findOneAndUpdate({'info.city': null}, {inventory: inventory})



    let client = await Client.findById(req.cookies.h).lean()
    let {inventory} = client;
 
    inventory = inventory.map(s => ({
      ...s,
      category: 'Products'
    }))

    await Client.findByIdAndUpdate(mongoose.Types.ObjectId(req.cookies.h), {inventory: inventory})




    // let {inventory} = await Client.findOne({'info.city': null}).lean()
    // let meds = []
    // inventory.forEach(stock => {
    //   if(!meds.some(n => n.name === stock.stockItem.name)) {
    //     meds.push(new Suggestion({
    //       name: stock.stockItem.name,
    //       category: 'medication' 
    //    }))
    //  }
    // })
    // await Suggestion.deleteMany({'category':'medication'},(e, doc)=>{
    //   if(e) {
    //     console.log(e)
    //   }
    //   console.log(doc)
    // })
    // await Suggestion.insertMany(meds,{ordered: false}, (e,doc) => {
    //   if(!e) {
    //     console.log(doc)
    //   } 
    //   console.log(e)
    // })
addCard: async (req, res) => {
  try {
    let patient = null;
    const person = await Person.findOne({'info.personal.cardNum': req.body.card.pin})
    if(person) {
      if (person.info.persnal.cardType === 'Family' && req.body.card.category === 'Family') {
        if(!req.body.patient.record.cards.some(c => c.pin === req.body.card.pin)) {
          req.body.patient.record.cards.unshift(req.body.card)
        } else {
          
        }
        req.body.patient.record.invoices.unshift({
          ...req.body.invoice, 
          name: 'Consultation', 
          desc: req.body.card.category,
          kind: req.body.card.pin
        })
        req.body.patient.info.personal.cardType = req.body.card.category
        req.body.patient.info.personal.cardNum = req.body.card.pin
      } else {
        res.status(400).send('Error validating card');
      }
    } else {
      req.body.patient.record.cards.unshift(req.body.card)
      req.body.patient.info.personal.cardType = req.body.card.category
      req.body.patient.info.personal.cardNum = req.body.card.pin
      if (req.body.entry === 'new') {
        req.body.patient.record.invoices.unshift([
          {
            ...req.body.invoice,
            name: 'Card', 
            desc: req.body.card.category,
            kind: req.body.card.pin
          }, {
            ...req.body.invoice,
            name: 'Consultation', 
            desc: req.body.card.category,
            kind: req.body.card.pin
          }]
        )
      } else {
        req.body.patient.record.invoices.unshift({
          ...req.body.invoice,
           name: 'Consultation', 
           desc: req.body.card.category,
           kind: req.body.card.pin
          })
       }
      }
      patient = await Person.findByIdAndUpdate(
        req.body.patient._id, req.body.patient, {new: true}
      )
      res.send(patient);
    
  } catch (error) {
    res.status(400).send('Error validating card');
  }
},