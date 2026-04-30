export const typeDefs = `#graphql
  enum RiskLevel {
    LEVEL_1
    LEVEL_2
    LEVEL_3
  }

  enum ReviewStatus {
    PENDING
    CONFIRMED
    FALSE_POSITIVE
    RECHECK
    DISPATCHED
  }

  type BBox {
    x: Float!
    y: Float!
    w: Float!
    h: Float!
  }

  type ReviewLog {
    id: ID!
    defectId: ID!
    reviewer: String!
    action: String!
    comment: String
    timestamp: String!
  }

  type Defect {
    id: ID!
    line: String!
    section: String!
    poleNumber: String!
    component: String!
    defectType: String!
    confidence: Float!
    riskLevel: RiskLevel!
    status: ReviewStatus!
    detectedAt: String!
    imageUrl: String!
    bbox: BBox!
    reviewLogs: [ReviewLog!]!
  }

  type RiskCount {
    level: RiskLevel!
    count: Int!
  }

  type DashboardStats {
    totalDetected: Int!
    pendingReview: Int!
    confirmed: Int!
    falsePositive: Int!
    falsePositiveRate: Float!
    riskDistribution: [RiskCount!]!
  }

  type Query {
    defects(riskLevel: RiskLevel, status: ReviewStatus): [Defect!]!
    defect(id: ID!): Defect
    dashboardStats: DashboardStats!
  }

  type Mutation {
    reviewDefect(id: ID!, action: ReviewStatus!, comment: String): Defect!
    dispatchDefect(id: ID!): Defect!
  }
`;
