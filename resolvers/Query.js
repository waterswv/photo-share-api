const { ObjectID } = require('mongodb')

module.exports = {
    
    me: (parent, args, { currentUser }) => currentUser,
    
    totalPhotos: (parent, args, { db }) => 
      db.collection('photos')
        .estimatedDocumentCount(),

    allPhotos: (parent, args, { db }) =>
      db.collection('photos')
        .find()
        .toArray(),
    
    Photo: (parent, args, { db }) => 
      db.collection('photos')
        .findOne({ _id: ObjectID(args.id) }),    

    totalUsers: (parent, args, { db }) =>
      db.collection('users')
        .estimatedDocumentCount(),

    allUsers: (parent, args, { db }) =>
      db.collection('users')
        .find()
        .toArray(),

    User: (parent, args, { db }) => 
      db.collection('users')
        .findOne({ githubLogin: args.login }),

    Winery: (parent, args, { db }) =>
      db.collection('wineries')
        .findOne({_id: ObjectID(args.id)}),

    allWineries: (parent, args, { db }) =>
      db.collection('wineries')
        .find()
        .toArray(),
    totalWineries: (parent, args, { db }) =>
      db.collection('wineries')
        .estimatedDocumentCount()
}