const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType,
  GraphQLString, GraphQLList, GraphQLInt,
  GraphQLNonNull } = require('graphql');
// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'HelloGraphQL', // no space as name
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         resolve: () => 'hello world'
//       }
//     })
//   })}
// );
const authors = [
  {id: 1, name: 'Washington'},
  {id: 2, name: 'Jackson'},
  {id: 3, name: 'JFK'},
];
const books = [
  {id: 1, name: 'book 1', authorId: 1},
  {id: 2, name: 'book 2', authorId: 1},
  {id: 3, name: 'book 3', authorId: 2},
  {id: 4, name: 'book 4', authorId: 3},
  {id: 5, name: 'book 5', authorId: 3},
  {id: 6, name: 'book 6', authorId: 3},
];
const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This means a book by author',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString)},
    authorId: { type: new GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find(a => a.id === book.authorId)
    }}
  })
});
const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This means an author of book',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString)},
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(b => b.authorId === author.id);
      }
    }
  })
});
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      description: 'add a book',
      args: {
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)}
      },
      resolve: (parent, args) => {
        const book = {id: books.length +1, name: args.name, authorId: args.authorId };
        books.push(book);
        return book;
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'add an author',
      args: {
        name: {type: GraphQLNonNull(GraphQLString)},
      },
      resolve: (parent, args) => {
        const author = { id: authors.length +1, name: args.name };
        authors.push(author);
        return author;
      }
    }
  })
});
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'a book',
      args: { id: { type:  GraphQLInt}},
      resolve: (parent, args) => books.find(b => b.id === args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'an author',
      args: { id: { type:  GraphQLInt}},
      resolve: (parent, args) => authors.find(a => a.id === args.id)
    }
  })
});
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});
app.get('/', (req, res) => res.send('Hello World!'));
app.use('/graphql', expressGraphQL({
  schema: schema, graphiql: true
}));
app.listen(5000, () => console.log(` app is running`))
