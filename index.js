const { ApolloServer } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

// typeDefs are where we set our Schema Definition. 
// It's just a String. All Queries will be backed by a resolver fn() of the same name.
const typeDefs = `
    scalar DateTime
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }
    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }
    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos: [Photo!]!

    }
    type Photo {
        """
        An image that is uploaded by a user, containing an Id, url, name, and optional description
        """
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
        created: DateTime!
    }
    type Query {
        totalPhotos: Int!
        allPhotos(after: DateTime): [Photo!]!
    }
    type Mutation {
        postPhoto (input: PostPhotoInput!): Photo!
    }
`
var _id = 0
var users = [
    { "githubLogin": "waterswv", "name": "Bryan Mierke" },
    { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
    { "githubLogin": "gPlake", "name": "Glen Plake" },
    { "githubLogin": "sSchmidt", "name": "Scot Schmidt" },
]
var photos = [
    {
        "id": "1",
        "name": "Dropping the Heart Chute",
        "description": "The heart chute is one of my favorite chutes",
        "category": "ACTION",
        "githubUser": "gPlake",
        "created": "3-28-1977"
    },
    {
        "id": "2",
        "name": "Enjoying the sunshine",
        "category": "SELFIE",
        "githubUser": "sSchmidt",
        "created": "1-2-1985"
    },
    {
        "id": "3",
        "name": "Gunbarrel 25",
        "description": "25 laps on gunbarrel today",
        "category": "LANDSCAPE",
        "githubUser": "sSchmidt",
        "created": "2018-04-15T19:09:57.308Z"
    },
]
var tags = [
    {"photoID": "1", "userID": "gPlake"},
    {"photoID": "2", "userID": "gPlake"},
    {"photoID": "2", "userID": "sSchmidt"},
    {"photoID": "2", "userID": "mHattrup"}
]
const resolvers = {
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: (parent, args) => {
            args.after
            console.log(photos);
            
            return photos.filter(photo => new Date(args.after) < new Date(photo.created))
        },
    },
    Mutation: {
        postPhoto(parent, args) {
            var newPhoto = {
                id: _id++,
                ...args.input,
                created: new Date()
            }
            photos.push(newPhoto)
            return newPhoto
        }
    },
    Photo: {
        url: parent => `http://yoursite.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return users.find(u => u.githubLogin === parent.githubUser)
        },
        taggedUsers: parent => tags
            // Returns an array of tags tha tonly contain th ecurrent photo
            .filter(tag => tag.photoID === parent.id)

            // Converts the array of tags into an array of userIDS
            .map(tag => tag.userID)

            .map(userID => users.find(user => user.githubLogin === userID))
    },
    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === parent.githubLogin)
        },
        inPhotos: parent => tags
            // Returns an array of tags that only contain current user.
            .filter(tag => tag.userID === parent.id)

            // Converts the array of tags into an array of photoIds
            .map(tag => tag.photoID)

            // Converts the array of photoIDs into an array of of photo objects
            .map(photoID => photos.find(photo => photo.id === photoID))
    },
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value.',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server
    .listen()
    .then(({url}) => console.log(`GraphQL Service running on ${url}`))
    