const { gql, ApolloServer } = require("apollo-server");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");
const { events, locations, participants, users } = require("./data.json");

const typeDefs = gql`
  # User

  type User {
    id: ID!
    username: String!
    email: String!
    events:[Event!]!
  }

  input CreateUserInput {
    username:String!
    email:String!
  }

  input UpdateUserInput {
    username:String
    email:String
  }

  # Participant

  type Participant {
    id: ID!
    user_id: ID!
    event_id: ID!
  }

  input CreateParticipantInput {
    user_id:ID!
    event_id:ID!
  }

  input UpdateParticipantInput {
    user_id:ID
    event_id:ID
  }

  # Location

  type Location {
    id: ID!
    name: String!
    desc: String!
    lat: Float!
    lng: Float!
  }

  input CreateLocationInput {
    name: String!
    desc: String!
    lat: Float!
    lng: Float!
  }

  input UpdateLocationInput {
    name: String
    desc: String
    lat: Float
    lng: Float
  }


  # Event

  type Event {
    id: ID!
    title: String!
    desc: String!
    date:String!
    from:String!
    to:String!
    location_id:ID!
    user_id:ID!
    user:User!
    location:Location!
    participants:[Participant!]!
  }

  input CreateEventInput {
    title: String!
    desc: String!
    date:String!
    from:String!
    to:String!
    location_id:ID!
    user_id:ID!
  }

  input UpdateEventInput {
    title: String
    desc: String
    date:String
    from:String
    to:String
    location_id:ID
    user_id:ID
  }

  # DeleteAll

  type DeleteAllOutput {
    count:Int!
  }

  # Query

  type Query {
    user(id:ID!):User
    users:[User!]!

    event(id:ID!):Event
    events:[Event!]!

    location(id:ID!):Location
    locations:[Location!]!

    participant(id:ID!):Participant
    participants:[Participant!]!
  }

  # Mutation

  type Mutation {
    # User
    createUser(data:CreateUserInput!):User!
    updateUser(id:ID!,data:UpdateUserInput!):User!
    deleteUser(id:ID!):User!
    deleteAllUsers:DeleteAllOutput!

    # Participant
    createParticipant(data:CreateParticipantInput!):Participant!
    updateParticipant(id:ID!,data:UpdateParticipantInput!):Participant!
    deleteParticipant(id:ID!):Participant!
    deleteAllParticipants:DeleteAllOutput!

    # Location
    createLocation(data:CreateLocationInput!):Location!
    updateLocation(id:ID!,data:UpdateLocationInput!):Location!
    deleteLocation(id:ID!):Location!
    deleteAllLocations:DeleteAllOutput!

    # Event
    createEvent(data:CreateEventInput!):Event!
    updateEvent(id:ID!,data:UpdateEventInput!):Event!
    deleteEvent(id:ID!):Event!
    deleteAllEvents:DeleteAllOutput!
  }
`;

const createMutation = (elements, data) => {
  const newElement = { id: elements.length + 1, ...data };
  elements.push(newElement);
  return newElement;
};

const updateMutation = (elements, id, data, name) => {
  const element_index = elements.findIndex(el => el.id === +id);
  if (element_index === -1) {
    throw new Error(`${name} not found`);
  }
  elements[element_index] = {
    ...elements[element_index],
    ...data
  };

  return elements[element_index];
};

const deleteMutation = (elements, id, name) => {
  const element_index = elements.findIndex(el => el.id === +id);
  if (element_index === -1) {
    throw new Error(`${name} not found`);
  }

  const deletedElement = elements.splice(element_index, 1)[0];
  return deletedElement;

};

const deleteAllMutation = (elements) => {
  const count = elements.length;
  elements.length = 0;
  return { count };
};

const resolvers = {
  Mutation: {
    // User
    createUser: (_, { data }) => createMutation(users, data),
    updateUser: (_, { id, data }) => updateMutation(users, id, data, 'User'),
    deleteUser: (_, { id }) => deleteMutation(users, id, 'User'),
    deleteAllUsers: () => deleteAllMutation(users),

    // Participant
    createParticipant: (_, { data }) => createMutation(participants, data),
    updateParticipant: (_, { id, data }) => updateMutation(participants, id, data, 'Participant'),
    deleteParticipant: (_, { id }) => deleteMutation(participants, id, 'Participant'),
    deleteAllParticipants: () => deleteAllMutation(participants),

    // Location
    createLocation: (_, { data }) => createMutation(locations, data),
    updateLocation: (_, { id, data }) => updateMutation(locations, id, data, 'Location'),
    deleteLocation: (_, { id }) => deleteMutation(locations, id, 'Location'),
    deleteAllLocations: () => deleteAllMutation(locations),

    // Event
    createEvent: (_, { data }) => createMutation(events, data),
    updateEvent: (_, { id, data }) => updateMutation(events, id, data, 'Event'),
    deleteEvent: (_, { id }) => deleteMutation(events, id, 'Event'),
    deleteAllEvents: () => deleteAllMutation(events),
  },
  Query: {
    user: (_, args) => users.find(u => u.id === +args.id),
    users: () => users,

    event: (_, args) => events.find(e => e.id === +args.id),
    events: () => events,

    location: (_, args) => locations.find(l => l.id === +args.id),
    locations: () => locations,

    participant: (_, args) => participants.find(p => p.id === +args.id),
    participants: () => participants
  },
  User: {
    events: (parent) => events.filter(e => e.user_id === parent.id)
  },
  Event: {
    user: (parent) => users.find(u => u.id === parent.user_id),
    location: (parent) => locations.find(l => l.id === parent.location_id),
    participants: (parent) => participants.filter(p => p.event_id === parent.id)
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
});

server.listen().then(({ url }) => console.log(`Listening on  ${url}`));
