/**
 * GraphQL Schema Definition
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

    """
    Get detailed usage metrics with limits and warnings
    """
    usageMetrics: UsageMetrics!

    """
    Get tier limits and current usage percentages
    """
    tierLimits: TierLimits!

    """
    Get event metrics for a time range
    """
    eventMetrics(timeRange: TimeRangeInput!): EventMetrics!

    """
    Get flow metrics and completion analysis
    """
    flowMetrics(flowId: ID!, timeRange: TimeRangeInput!): FlowMetricsDetailed!

    """
    Get session metrics and patterns
    """
    sessionMetrics(timeRange: TimeRangeInput!): SessionMetrics!

    """
    Get component usage analytics
    """
    componentAnalytics(component: String!, timeRange: TimeRangeInput!): ComponentAnalytics!

    """
    Get trend analysis for a metric
    """
    trendAnalysis(metric: MetricType!, timeRange: TimeRangeInput!, groupBy: GroupByPeriod): TrendData!
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

  type UsageMetrics {
    usage: Usage!
    limits: UsageLimits!
    warnings: UsageWarnings!
    percentages: UsagePercentages!
  }

  type UsageLimits {
    eventsPerMonth: Int!
    maxFlows: Int!
    aiRequestsPerMonth: Int!
  }

  type UsageWarnings {
    events: WarningLevel!
    flows: WarningLevel!
    aiRequests: WarningLevel!
  }

  type UsagePercentages {
    events: Float!
    flows: Float!
    aiRequests: Float!
  }

  enum WarningLevel {
    OK
    WARNING
    CRITICAL
    EXCEEDED
  }

  type TierLimits {
    tier: UserTier!
    limits: UsageLimits!
    features: TierFeatures!
    dataRetentionDays: Int!
  }

  type TierFeatures {
    basicMetrics: Boolean!
    advancedAnalytics: Boolean!
    aiInsights: Boolean!
    customDashboards: Boolean!
    dataExport: Boolean!
    realTimeAnalytics: Boolean!
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

  input TimeRangeInput {
    start: String!
    end: String!
  }

  enum MetricType {
    EVENTS
    SESSIONS
    FLOWS
  }

  enum GroupByPeriod {
    HOUR
    DAY
    WEEK
    MONTH
  }

  type EventMetrics {
    totalEvents: Int!
    uniqueSessions: Int!
    uniqueUsers: Int!
    eventsByType: [EventTypeCount!]!
    eventsByComponent: [ComponentCount!]!
    trend: [TrendPoint!]!
  }

  type EventTypeCount {
    event: String!
    count: Int!
  }

  type ComponentCount {
    component: String!
    count: Int!
  }

  type TrendPoint {
    date: String!
    count: Int!
  }

  type FlowMetricsDetailed {
    flowId: ID!
    totalSessions: Int!
    completedSessions: Int!
    completionRate: Float!
    averageDuration: Float!
    dropoffPoints: [DropoffPointDetailed!]!
  }

  type DropoffPointDetailed {
    stepId: String!
    stepName: String!
    dropoffCount: Int!
    dropoffRate: Float!
  }

  type SessionMetrics {
    totalSessions: Int!
    averageSessionDuration: Float!
    averageEventsPerSession: Float!
    sessionsByHour: [HourlyCount!]!
    topFlows: [FlowCount!]!
  }

  type HourlyCount {
    hour: Int!
    count: Int!
  }

  type FlowCount {
    flowId: String!
    sessionCount: Int!
  }

  type ComponentAnalytics {
    component: String!
    totalUsage: Int!
    uniqueUsers: Int!
    averageInteractionsPerUser: Float!
    topEvents: [EventTypeCount!]!
  }

  type TrendData {
    metric: String!
    groupBy: String!
    data: [TrendDataPoint!]!
  }

  type TrendDataPoint {
    timestamp: String!
    value: Float!
  }

  scalar JSON
`;
