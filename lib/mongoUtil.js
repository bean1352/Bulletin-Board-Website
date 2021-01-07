const { MongoClient } = require('mongodb');
const Users = require('../models/User')
const Posts = require('../models/Post');

require('dotenv').config();

class MongoUtil {
  constructor() {
    const url = process.env.URL;
    this.client = new MongoClient(url, {useUnifiedTopology: true});
  }
  async init() {
    await this.client.connect().catch((err)=> {  
        console.log(err);
    });
  
    console.log('connected');
    this.db = this.client.db(process.env.DB);
    this.Users = new Users(this.db);
    this.Posts = new Posts(this.db)
  }

  async createIndex(collection) {
    this.Users.createIndex({"name": 1})
    //CREATE MESSAGE INDEXES
    // collection.createIndex({"contact.name": 1, "contact.number": 1})
    // collection.createIndex({message: "text"})
  //  collection.createIndex({"name": 1, "number": 1})
  //   collection.createIndex({message: "text"})

  }
}

module.exports = new MongoUtil();