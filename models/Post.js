const ObjectID = require('mongodb').ObjectID
//model for mongodb
class Post {
  constructor(db) {
    this.collection = db.collection('Posts');
  }
  async addPost(post) {
    const newPost = await this.collection.insertOne(post);
    return newPost;
  }

  async updatePost(id, update) {
    const objId = new ObjectID(id);
    const updatedPost = await this.collection.updateOne({_id: objId}, update);
    return updatedPost;
  }

  async findPost(post) {
    const foundPost = await this.collection.findOne(post);
    return foundPost;
  }

  async findPosts(filter) {
    const foundPosts = await this.collection.find(filter).toArray();
    return foundPosts;
  }
 
  async findById(id) {
    var objId = new ObjectID(id);
    const foundPost = await this.collection.findOne({_id: objId});
    return foundPost;
  }

  async deletePost(id) {
    var objId = new ObjectID(id);
    const foundPost = await this.collection.deleteOne({_id: objId});
    return foundPost;
  }




}
module.exports = Post;