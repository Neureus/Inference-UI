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

  # Advanced Analytics (Phase 3)

  """
  Funnel analysis queries
  """
  extend type Query {
    funnel(id: ID!): Funnel
    userFunnels: [Funnel!]!
    analyzeFunnel(funnelId: ID!, timeRange: TimeRangeInput!): FunnelAnalysis!
    funnelInsights(funnelId: ID!, timeRange: TimeRangeInput!): FunnelInsights!
  }

  """
  Cohort analysis queries
  """
  extend type Query {
    cohort(id: ID!): Cohort
    userCohorts: [Cohort!]!
    cohortSize(cohortId: ID!, timeRange: TimeRangeInput): CohortSize!
    cohortRetention(cohortId: ID!, periodType: PeriodType, maxPeriods: Int): CohortRetention!
    compareCohorts(cohortIds: [ID!]!, periodType: PeriodType): CohortComparison!
  }

  """
  Attribution analysis queries
  """
  extend type Query {
    attributionAnalysis(timeRange: TimeRangeInput!, model: AttributionModel, groupBy: AttributionGroupBy): [AttributionResult!]!
    conversionSummary(timeRange: TimeRangeInput!): ConversionSummary!
    topConvertingPaths(timeRange: TimeRangeInput!, limit: Int): [ConvertingPath!]!
    attributionModels: [AttributionModelInfo!]!
  }

  """
  Funnel and cohort mutations
  """
  extend type Mutation {
    createFunnel(input: CreateFunnelInput!): Funnel!
    deleteFunnel(id: ID!): Boolean!
    createCohort(input: CreateCohortInput!): Cohort!
    deleteCohort(id: ID!): Boolean!
    trackConversion(input: TrackConversionInput!): Conversion!
  }

  # Funnel Types

  type Funnel {
    id: ID!
    name: String!
    description: String
    steps: [FunnelStep!]!
    flowId: String
    createdAt: String!
    updatedAt: String!
  }

  type FunnelStep {
    id: ID!
    name: String!
    event: String
    component: String
    orderIndex: Int!
  }

  type FunnelAnalysis {
    funnelId: ID!
    funnelName: String!
    timeRange: TimeRangeOutput!
    totalEntered: Int!
    totalCompleted: Int!
    overallConversion: Float!
    averageCompletionTime: Float!
    steps: [FunnelStepAnalysis!]!
    bottleneckStepId: String
  }

  type FunnelStepAnalysis {
    stepId: ID!
    stepName: String!
    orderIndex: Int!
    totalUsers: Int!
    conversionFromPrevious: Float!
    conversionFromStart: Float!
    dropoffCount: Int!
    dropoffRate: Float!
    averageTimeFromPrevious: Float!
    averageTimeFromStart: Float!
  }

  type FunnelInsights {
    conversionRate: Float!
    dropoffRate: Float!
    bottleneckStep: String
    averageTime: Float!
    totalUsers: Int!
  }

  input CreateFunnelInput {
    name: String!
    description: String
    steps: [FunnelStepInput!]!
    flowId: String
  }

  input FunnelStepInput {
    name: String!
    event: String
    component: String
    orderIndex: Int!
  }

  # Cohort Types

  type Cohort {
    id: ID!
    name: String!
    description: String
    criteria: CohortCriteria!
    createdAt: String!
    updatedAt: String!
  }

  type CohortCriteria {
    type: CohortType!
    startDate: String
    endDate: String
    event: String
    component: String
    properties: JSON
  }

  enum CohortType {
    SIGNUP_DATE
    FIRST_EVENT
    CUSTOM
  }

  type CohortSize {
    total: Int!
    active: Int!
    inactive: Int!
  }

  type CohortRetention {
    cohortId: ID!
    cohortName: String!
    cohortSize: Int!
    periodType: PeriodType!
    startDate: String!
    periods: [RetentionPeriod!]!
    averageRetention: Float!
    lifetimeValue: Float
  }

  type RetentionPeriod {
    periodIndex: Int!
    periodLabel: String!
    retained: Int!
    retentionRate: Float!
    churnedCount: Int!
    churnRate: Float!
  }

  enum PeriodType {
    DAY
    WEEK
    MONTH
  }

  type CohortComparison {
    cohorts: [CohortSummary!]!
    bestPerforming: ID!
    worstPerforming: ID!
  }

  type CohortSummary {
    id: ID!
    name: String!
    size: Int!
    retentionRate: Float!
    churnRate: Float!
  }

  input CreateCohortInput {
    name: String!
    description: String
    criteria: CohortCriteriaInput!
  }

  input CohortCriteriaInput {
    type: CohortType!
    startDate: String
    endDate: String
    event: String
    component: String
    properties: JSON
  }

  # Attribution Types

  type AttributionResult {
    source: String!
    conversions: Int!
    totalValue: Float!
    averageValue: Float!
    attribution: AttributionBreakdown!
  }

  type AttributionBreakdown {
    firstTouch: Float!
    lastTouch: Float!
    linear: Float!
    timeDecay: Float!
  }

  enum AttributionModel {
    FIRST_TOUCH
    LAST_TOUCH
    LINEAR
    TIME_DECAY
    POSITION_BASED
  }

  enum AttributionGroupBy {
    SOURCE
    MEDIUM
    CAMPAIGN
    COMPONENT
  }

  type ConversionSummary {
    totalConversions: Int!
    uniqueConverters: Int!
    totalValue: Float!
    averageValue: Float!
  }

  type ConvertingPath {
    path: String!
    conversions: Int!
    totalValue: Float!
  }

  type Conversion {
    id: ID!
    userId: String!
    sessionId: String!
    event: String!
    value: Float
    timestamp: Float!
    metadata: JSON
  }

  type AttributionModelInfo {
    type: AttributionModel!
    description: String!
  }

  input TrackConversionInput {
    event: String!
    value: Float
    metadata: JSON
  }

  type TimeRangeOutput {
    start: String!
    end: String!
  }
`;
