var mongoose = require('../db');
const Schema = mongoose.Schema;
const personSchema = new Schema({
    info: {
        status: String,
        online: Boolean,
        lastLogin: Date,
        personal: {
            firstName: String,
            lastName: String,
            gender: String,
            dob: Date,
            avatar: String,
            cardType: String,
            cardNum: Number,
            bio: String,
            occupation: String,
            religion: String,
            tribe: String,
            mstatus: String,
            username: String,
            password: String,
            status: String
        },
        contact: {
            me: {
                mobile: String,
                email: String,
                kinName: String,
                kinMobile: String,
                state: String,
                lga: String,
                address: String
            },
            emergency: {
                name: String,
                mobile: String,
                email: String,
                rel: String,
                occupation: String,
                address: String
            }
        },
        insurance: {
            rel: String,
            idNo: String,
            groupNo: String,
            subscriber: String,
            employer: String,
            ssn: String 
        },
        official: {
            hospital: {
                type: Schema.Types.ObjectId,
                ref: 'Client'
            },
            id: String,
            department: String,
            role: String
        },
        stamp: {
            addedBy: {
                type: Schema.Types.ObjectId,
                ref: 'Person'
            },
            facility: {
                type: Schema.Types.ObjectId,
                ref: 'Client'
            },
            selected: Boolean,
            dateAdded: Date
        }
    },
    connections: {
        type: Schema.Types.ObjectId,
        ref: 'Connection'
    },
    
    record: {
        complains: [
            [{
                complain: String,
                duration: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        histories: [
            [{
                condition: String,
                duration: Number,
                bearer: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        notes: [{
            note: String,
            noteType: String,
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        vitals: {
            bp: [{
                systolic: Number,
                dystolic: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            resp: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            pulse: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            height: [{
                value: Number,
                dateAdded: Date
            }],
            weight: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            tempreture: [{
                value: Number,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }],
            bloodGl: [{
                value: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        },
        conditions: [
            [{
                name: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        allegies: [{
            allegy: String,
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        visits: [
            [{
                hospital: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                dept: String,
                status: String,
                visitedOn: Date,
                addmittedOn: Date,
                dischargedOn: Date,
                diedOn: Date,
                wardNo: Number,
                bedNo: Number
            }]
        ],

        cards: [{
            category: String,
            pin: String,
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        appointments: [{
            title: String,
            setOn: Date,
            date: Date,
            time: String,
            attended: Boolean,
            stamp: {
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                facility: {
                    type: Schema.Types.ObjectId,
                    ref: 'Client'
                },
                selected: Boolean,
                dateAdded: Date
            }
        }],
        medications: [
            [{
                product: {
                    name: String,
                    size: Number,
                    unit: String,
                },
                priscription: {
                    intake: Number,
                    freq: String,
                    piriod: Number,
                    extend: String
                },
                lastTaken: Date,
                paused: Boolean,
                pausedOn: Date,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        scans: [
            [{
                name: String,
                dept: String,
                treated: Boolean,
                bodyPart: String,
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                },
                report: {
                    comment: String,
                    attachments: [],
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    },
                }
            }]
        ],
        tests: [
            [{
                name: String,
                dept: String,
                treated: Boolean,
                report: {
                    comment: String,
                    attachments: [],
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                },
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
        surgeries: [
            [{
                name: String,
                dept: String,
                treated: Boolean,
                report: {
                    comment: String,
                    attachments: [],
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                },
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ],
      
        immunization: {
            vaccins: [
                [{
                    name: String,
                    stamp: {
                        addedBy: {
                            type: Schema.Types.ObjectId,
                            ref: 'Person'
                        },
                        facility: {
                            type: Schema.Types.ObjectId,
                            ref: 'Client'
                        },
                        selected: Boolean,
                        dateAdded: Date
                    }
                }]
            ],
            questionaire: {}
        },
        invoices: [
            [{
                desc: String,
                kind: String,
                price: Number,
                quantity: Number,
                paid: Boolean,
                credit: Boolean,
                processed: Boolean,
                datePaid: String,
                paymentComfirmer: {
                    type: Schema.Types.ObjectId,
                    ref: 'Person'
                },
                stamp: {
                    addedBy: {
                        type: Schema.Types.ObjectId,
                        ref: 'Person'
                    },
                    facility: {
                        type: Schema.Types.ObjectId,
                        ref: 'Client'
                    },
                    selected: Boolean,
                    dateAdded: Date
                }
            }]
        ]
    },
    messages: [{
        contactId: String,
        chats: [
            [
                {
                    message: String,
                    sender: String,
                    reciever: String,
                    delivered: Boolean,
                    read: Boolean,
                    sendOn: Date
                }
            ]
        ]
    }
  ]
});



    

const Person = mongoose.model('Person', personSchema);
module.exports = Person;