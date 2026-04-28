export const DEMO_RESUME = `Alex Rivera
alex.rivera@email.com | San Francisco, CA
Senior Software Engineer

SUMMARY
Product-minded engineer with 6+ years building data-intensive web apps. Led platform migrations, mentored 4 engineers, and shipped A/B tested features to millions of users.

EXPERIENCE
FinScale - Senior Software Engineer (2021-Present)
- Own the payments and ledger microservices (Node.js, TypeScript, PostgreSQL, Redis, Kafka)
- Cut p99 latency 38% by redesigning read paths, adding read-through caches, and backpressure
- Introduced SLOs, error budgets, and on-call playbooks; reduced P1 pages 40% YoY
- Cross-functional with product and design; ran incident reviews and postmortems

DataCraft - Software Engineer (2018-2021)
- React + GraphQL + Python services; built internal admin tools and ETL for analytics
- Migrated a monolith module to a modular service, improving testability and release cadence

SKILLS
TypeScript, Node.js, React, PostgreSQL, Redis, Kafka, system design, reliability, testing (Jest, k6)
`;

export const DEMO_JD = `Job: Senior Software Engineer, Platform
Location: Remote (US)

About the role
We are looking for a senior backend-leaning full stack engineer to evolve our event-driven platform. You will design APIs, improve reliability, and partner with product on customer-facing features.

You will
- Build and own services in TypeScript/Node, with clear contracts and observability
- Work with Kafka and PostgreSQL; improve performance and data integrity
- Collaborate in a fast team; participate in on-call and incident response
- Mentor others and raise the bar for code quality and testing

Requirements
- 5+ years of professional experience with web services
- Strong TypeScript and API design; async systems and distributed systems concepts
- Experience with message queues and SQL at scale
- Clear communication; owner mindset

Nice to have
- React for internal tools, prior work on billing or payments, experience with SRE practices
`;

/** Short, credible replies for judge autoplay (6 turns). */
export const DEMO_CANDIDATE_REPLIES = [
  'At FinScale the highest-leverage work was the ledger read path. I own the TypeScript services around PostgreSQL and Redis, and I reduced p99 by fixing N+1 patterns, adding a hot cache in Redis, and backpressure in the consumer. Outcome: fewer failed card retries and a measurable drop in support tickets.',
  'For the API, I would version routes, design idempotency keys for money movement, and document error contracts. I would load-test with k6 on representative traffic shapes and add circuit breakers where downstreams are bursty. I would validate invariants in the DB and add tracing for each hop.',
  'Kafka is our log of record for outbox events. I care about at-least-once handling with idempotent consumers, and I use consumer lag plus broker metrics for alerts. If lag spikes, I would check slow consumers and payload size, not just "restart everything".',
  'On reliability I run with SLOs: target availability and p99 for payment reads. I keep error budgets and if we burn too fast, we stop feature work and pay down risk. I also run blameless postmortems and track action items to completion.',
  'I mentor by pairing on design docs and code review. I also run small internal workshops on testing and performance. I try to make feedback specific and link it to user impact, not style-only comments.',
  'I am strongest in TypeScript service design, SQL performance, and event-driven systems. I want to deepen distributed consensus edge cases and large-scale data modeling for multi-tenant billing in the next year.',
];
