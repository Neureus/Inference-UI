/**
 * GraphQL Schema Definition
 * Reusable across all deployment platforms
 */

export const schema = `
  type Query {
    """
    Get current user information
    """
    me: User

    """
    Get user flows
    """
    flows(limit: Int, offset: Int): [Flow!]!

    """
    Get flow by ID
    """
    flow(id: ID!): Flow

    """
    Get analytics for a flow
    """
    flowAnalytics(flowId: ID!, timeRange: TimeRange!): FlowAnalytics
  }

  type Mutation {
    """
    Create a new flow
    """
    createFlow(input: CreateFlowInput!): Flow!

    """
    Update an existing flow
    """
    updateFlow(id: ID!, input: UpdateFlowInput!): Flow!

    """
    Delete a flow
    """
    deleteFlow(id: ID!): Boolean!

    """
    Track an event
    """
    trackEvent(input: EventInput!): Boolean!
  }

  type User {
    id: ID!
    email: String!
    tier: UserTier!
    createdAt: String!
    usage: Usage!
  }

  enum UserTier {
    FREE
    DEVELOPER
    BUSINESS
    ENTERPRISE
  }

  type Usage {
    eventsThisMonth: Int!
    flowsCount: Int!
    aiRequestsThisMonth: Int!
  }

  type Flow {
    id: ID!
    name: String!
    steps: [FlowStep!]!
    aiConfig: AIConfig
    createdAt: String!
    updatedAt: String!
  }

  type FlowStep {
    id: ID!
    component: String!
    props: JSON
    next: String
  }

  type AIConfig {
    enabled: Boolean!
    models: [String!]!
    features: [String!]!
  }

  type FlowAnalytics {
    flowId: ID!
    completionRate: Float!
    averageDuration: Float!
    dropoffPoints: [DropoffPoint!]!
    totalSessions: Int!
  }

  type DropoffPoint {
    stepId: String!
    stepName: String!
    dropoffRate: Float!
  }

  input CreateFlowInput {
    name: String!
    steps: [FlowStepInput!]!
    aiConfig: AIConfigInput
  }

  input UpdateFlowInput {
    name: String
    steps: [FlowStepInput!]
    aiConfig: AIConfigInput
  }

  input FlowStepInput {
    id: ID!
    component: String!
    props: JSON
    next: String
  }

  input AIConfigInput {
    enabled: Boolean!
    models: [String!]
    features: [String!]
  }

  input EventInput {
    event: String!
    component: String
    properties: JSON
  }

  input TimeRange {
    start: String!
    end: String!
  }

  scalar JSON
`;
