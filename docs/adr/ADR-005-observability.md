# ADR-004: Telemetry and Observability

**Date**: 2026-02-18  
**Status**: Accepted  
**Decision Makers**: Engineering Team  
**Related**: ADR-002 (State Management), ADR-003 (Feature Flags), ADR-004 (Tracking - Legacy)

## Context

Mesa247 needs comprehensive observability to:

1. **Monitor Production Health**: Detect and respond to issues quickly
2. **Measure Performance**: Understand user experience at scale
3. **Track Errors**: Catch and fix bugs before they impact users
4. **Optimize Business Metrics**: Make data-driven product decisions
5. **Meet SLOs**: Maintain service level objectives

### Requirements

- ✅ Structured logging with levels and context
- ✅ Error tracking with rich context (stack traces, user data, device info)
- ✅ Performance metrics (API latency, render time, web vitals)
- ✅ Business metrics (views, clicks, conversions)
- ✅ Perceived latency measurement (user-centric)
- ✅ Platform-specific implementations (web/mobile no shared code)
- ✅ Production-ready integrations (Sentry, Crashlytics)
- ✅ Dashboards and alerts

## Decision

We will implement a **comprehensive telemetry module** with three core interfaces: **Logger**, **Error Tracker**, and **Metrics Tracker**.

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Application Layer                 │
│  (Components, Screens, Hooks, API calls)    │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌──────────────────────────────────────────────┐
│         Telemetry Module                     │
│  ┌────────────┬────────────┬─────────────┐   │
│  │  Logger    │  Errors    │  Metrics    │   │
│  │  (info,    │  (capture  │  (timing,   │   │
│  │   warn,    │   exception│   counter,  │   │
│  │   error)   │   message) │   gauge)    │   │
│  └────────────┴────────────┴─────────────┘   │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┬───────────┐
        ↓                     ↓           ↓
┌──────────────┐    ┌──────────────┐  ┌─────────┐
│  Production  │    │  Production  │  │   Dev   │
│   Services   │    │   Services   │  │ Console │
│              │    │              │  │         │
│  Web:        │    │  Mobile:     │  │ Logs    │
│  - Sentry    │    │  - Firebase  │  │ Errors  │
│  - Datadog   │    │    Crashlytics│ │ Metrics │
│              │    │  - Firebase  │  │         │
│              │    │    Analytics │  │         │
└──────────────┘    └──────────────┘  └─────────┘
```

### Core Principles

1. **Three-Interface Design**
    - `Logger`: Structured logging with levels
    - `ErrorTracker`: Exception and crash reporting
    - `MetricsTracker`: Performance and business metrics

2. **Platform-Specific Implementations**
    - **Web**: Sentry + Datadog RUM
    - **Mobile**: Firebase Crashlytics + Firebase Performance

3. **User-Centric Metrics**
    - **Perceived Latency**: Time from user action to visible results
    - **Error-Free Sessions**: Percentage of sessions without errors
    - **Core Vitals**: LCP, FID, CLS (web) / App Start, Screen Load (mobile)

4. **Production-Ready**
    - Environment-aware (development vs production)
    - Error boundaries (web) and global handlers (mobile)
    - Automatic crash reporting
    - Rich context collection

5. **No Shared Code**
    - Web and mobile have separate implementations
    - Optimized for each platform's tools and constraints

## Implementation Details

### Web (`/web/src/lib/telemetry/`)

**Files**:

- `types.ts`: TypeScript interfaces
- `logger.ts`: Console logger with structured output
- `errors.ts`: Sentry integration
- `metrics.ts`: Datadog RUM integration
- `index.ts`: Unified exports

**Production Setup**:

```typescript
import * as Sentry from '@sentry/react';
import { datadogRum } from '@datadog/browser-rum';

// Sentry for errors
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});

// Datadog for metrics
datadogRum.init({
    applicationId: import.meta.env.VITE_DATADOG_APP_ID,
    clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
    trackUserInteractions: true,
    trackResources: true,
});
```

**ErrorBoundary**:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Mobile (`/mobile/src/lib/telemetry/`)

**Files**:

- `types.ts`: TypeScript interfaces (same as web)
- `logger.ts`: Async logger with AsyncStorage session management
- `errors.ts`: Firebase Crashlytics integration
- `metrics.ts`: Firebase Performance + Analytics integration
- `index.ts`: Unified exports

**Production Setup**:

```typescript
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';
import perf from '@react-native-firebase/perf';

// Enable in production only
if (!__DEV__) {
    crashlytics().setCrashlyticsCollectionEnabled(true);
    perf().setPerformanceCollectionEnabled(true);
}
```

**Global Error Handler**:

```typescript
ErrorUtils.setGlobalHandler((error, isFatal) => {
    errorTracker.captureException(error, {
        component: 'Global',
        tags: { fatal: String(isFatal) },
    });
});
```

### Perceived Latency Measurement

**Key Innovation**: Track full user-perceived latency, not just API response time.

```typescript
// 1. User initiates action
metrics.startPerceivedLatency('restaurants.list');

// 2. API completes (network time)
metrics.markFetchComplete('restaurants.list');

// 3. UI renders (total perceived time)
metrics.markRenderComplete('restaurants.list');
```

**Why This Matters**:

- API response time: 200ms
- Parsing + React render: 150ms
- **Total perceived latency: 350ms** ← This is what users feel

Traditional monitoring only tracks the 200ms. We track the full 350ms.

## Service Level Objectives (SLOs)

### Web SLOs

| Metric                             | Target (SLO) | Warning  | Critical | Measurement Window |
| ---------------------------------- | ------------ | -------- | -------- | ------------------ |
| **Perceived Latency (p95)**        | < 1000ms     | > 1500ms | > 2500ms | 5 minutes          |
| **Perceived Latency (p50)**        | < 500ms      | > 800ms  | > 1200ms | 5 minutes          |
| **Error Rate**                     | < 1%         | > 2%     | > 5%     | 5 minutes          |
| **Error-Free Sessions**            | > 99.5%      | < 99%    | < 98%    | 24 hours           |
| **API Success Rate**               | > 99%        | < 98%    | < 95%    | 5 minutes          |
| **LCP (Largest Contentful Paint)** | < 2.5s       | > 3s     | > 4s     | 75th percentile    |
| **FID (First Input Delay)**        | < 100ms      | > 200ms  | > 300ms  | 95th percentile    |
| **CLS (Cumulative Layout Shift)**  | < 0.1        | > 0.15   | > 0.25   | 75th percentile    |

### Mobile SLOs

| Metric                         | Target (SLO) | Warning  | Critical | Measurement Window |
| ------------------------------ | ------------ | -------- | -------- | ------------------ |
| **Perceived Latency (p95)**    | < 1500ms     | > 2000ms | > 3000ms | 5 minutes          |
| **Perceived Latency (p50)**    | < 800ms      | > 1200ms | > 1800ms | 5 minutes          |
| **Error Rate**                 | < 1%         | > 2%     | > 5%     | 5 minutes          |
| **Crash-Free Sessions**        | > 99.9%      | < 99.5%  | < 99%    | 24 hours           |
| **Crash-Free Users**           | > 99.9%      | < 99.5%  | < 99%    | 7 days             |
| **API Success Rate**           | > 99%        | < 98%    | < 95%    | 5 minutes          |
| **App Start Time (cold, p95)** | < 3s         | > 4s     | > 6s     | 1 hour             |
| **App Start Time (warm, p95)** | < 1.5s       | > 2s     | > 3s     | 1 hour             |
| **Screen Load Time (p95)**     | < 500ms      | > 1s     | > 2s     | 5 minutes          |

### Why These Numbers?

**Perceived Latency**:

- < 100ms: Instant (imperceptible)
- 100-300ms: Slight delay (acceptable)
- 300-1000ms: Noticeable (still good)
- 1000-3000ms: Slow (frustrating)
- \> 3000ms: Very slow (users abandon)

**Error-Free Sessions**:

- 99.9% = 1 in 1000 sessions has an error
- 99.5% = 5 in 1000 sessions (acceptable)
- 99% = 10 in 1000 sessions (needs attention)
- < 99% = Too many errors (critical)

**Crash-Free Sessions (Mobile)**:

- 99.9% = Industry standard for quality apps
- < 99.5% = Users will leave negative reviews
- < 99% = App may be removed from stores

## Dashboards

### Primary Dashboard (Datadog / Firebase)

**Web** (Datadog RUM):

```
┌────────────────────────────────────────────┐
│ Mesa247 Web - Health Overview              │
├────────────────────────────────────────────┤
│ 🟢 All Systems Operational                 │
│                                            │
│ Last 24 Hours                              │
│ ┌──────────┬──────────┬──────────┬────────┤
│ │ Sessions │ Error    │ Latency  │ Error- │
│ │          │ Rate     │ p95      │ Free   │
│ │ 12,453   │ 0.8%     │ 850ms    │ 99.6%  │
│ │          │ ✅       │ ✅       │ ✅     │
│ └──────────┴──────────┴──────────┴────────┤
│                                            │
│ 📊 Perceived Latency (Last Hour)           │
│ ╭──────────────────────────────────────╮  │
│ │      ●                          ●    │  │
│ │   ●     ●  ●  ●           ●  ●    ● │  │
│ │ ●          ●     ● ● ● ●           ●│  │
│ ╰──────────────────────────────────────╯  │
│   p50: 420ms  p95: 850ms  p99: 1250ms    │
│                                            │
│ ⚠️ Active Alerts (0)                       │
│ No active alerts                           │
└────────────────────────────────────────────┘
```

**Mobile** (Firebase Crashlytics):

```
┌────────────────────────────────────────────┐
│ Mesa247 Mobile - Crashlytics               │
├────────────────────────────────────────────┤
│ 🟢 Stability: Excellent                    │
│                                            │
│ Last 24 Hours                              │
│ ┌──────────┬──────────┬──────────┬────────┤
│ │ Users    │ Crash-   │ Crashes  │ ANRs   │
│ │          │ Free     │          │        │
│ │ 8,234    │ 99.94%   │ 5        │ 2      │
│ │          │ ✅       │ ✅       │ ✅     │
│ └──────────┴──────────┴──────────┴────────┤
│                                            │
│ 🔴 Top Issues                              │
│ 1. Network timeout in RestaurantList      │
│    Impact: 3 users                         │
│ 2. Image loading error                     │
│    Impact: 2 users                         │
└────────────────────────────────────────────┘
```

### Secondary Dashboards

1. **Performance Deep Dive**
    - Perceived latency breakdown by endpoint
    - P50/P95/P99 trends over time
    - Slowest queries
    - API vs render time comparison

2. **Error Analysis**
    - Error count by type
    - Error rate trends
    - Most common errors
    - Error-free session trends

3. **User Experience**
    - Web Vitals (LCP, FID, CLS)
    - Screen load times
    - Navigation performance
    - User flow analysis

4. **Business Metrics**
    - Restaurant views
    - Search queries
    - Filter usage
    - Conversion funnel

## Alerts

### Critical Alerts (PagerDuty)

1. **Perceived Latency Spike**
    - **Condition**: p95 > 2500ms (web) or 3000ms (mobile) for 10 minutes
    - **Action**: Page on-call engineer
    - **Runbook**: Check API health, CDN, database

2. **High Error Rate**
    - **Condition**: Error rate > 5% for 5 minutes
    - **Action**: Page on-call engineer + Slack #incidents
    - **Runbook**: Check recent deployments, API status, third-party services

3. **Crash-Free Sessions Drop**
    - **Condition**: < 99% for 30 minutes (mobile only)
    - **Action**: Page on-call engineer
    - **Runbook**: Check Crashlytics, rollback if needed

### Warning Alerts (Slack)

1. **Perceived Latency Elevated**
    - **Condition**: p95 > 1500ms (web) or 2000ms (mobile) for 15 minutes
    - **Action**: Slack #performance
    - **Runbook**: Monitor, investigate if persists

2. **Error Rate Elevated**
    - **Condition**: Error rate > 2% for 10 minutes
    - **Action**: Slack #quality
    - **Runbook**: Review error types, prepare fix

3. **Error-Free Sessions Below Target**
    - **Condition**: < 99.5% for 1 hour
    - **Action**: Slack #quality
    - **Runbook**: Review top errors, prioritize fixes

## Alternatives Considered

### 1. LogRocket (Web)

**Pros**:

- Session replay built-in
- Good for debugging user issues
- Performance monitoring included

**Cons**:

- ❌ Expensive ($99+/month)
- ❌ Not as mature as Sentry
- ❌ Limited mobile support

**Verdict**: ❌ Rejected (cost, Sentry is industry standard)

### 2. Bugsnag

**Pros**:

- Supports both web and mobile
- Good stability monitoring
- Reasonable pricing

**Cons**:

- ❌ Less feature-rich than Sentry + Firebase
- ❌ Smaller community
- ❌ Limited analytics integration

**Verdict**: ❌ Rejected (prefer specialized tools)

### 3. New Relic

**Pros**:

- Full-stack monitoring
- APM + Browser + Mobile
- Enterprise-grade

**Cons**:

- ❌ Expensive (enterprise pricing)
- ❌ Overkill for frontend-only app
- ❌ Steep learning curve

**Verdict**: ❌ Rejected (too complex, too expensive)

### 4. Roll Your Own

**Pros**:

- Full control
- No vendor lock-in
- Custom exactly what you need

**Cons**:

- ❌ Time-consuming to build
- ❌ Maintenance burden
- ❌ Reinventing the wheel
- ❌ No dashboard/alerting out of box

**Verdict**: ❌ Rejected (not worth the effort)

### 5. Firebase-Only (Web + Mobile)

**Pros**:

- Single platform for both
- Consistent experience
- Good integration

**Cons**:

- ❌ Web support is limited compared to Sentry
- ❌ Less powerful error grouping
- ❌ No session replay for web

**Verdict**: ❌ Rejected (Sentry better for web)

## Consequences

### Positive

✅ **Comprehensive Observability**: Full visibility into production health  
✅ **Early Detection**: Catch issues before they impact many users  
✅ **Data-Driven Decisions**: Make product decisions based on metrics  
✅ **User-Centric Metrics**: Focus on what users actually experience  
✅ **Platform-Optimized**: Best tools for each platform  
✅ **Production-Ready**: Integrates with industry-standard services  
✅ **Actionable Alerts**: Know when to act and what to do  
✅ **Type-Safe**: TypeScript interfaces prevent misuse

### Negative

❌ **Third-Party Costs**: Sentry (~$26/month) + Datadog (~$31/month) + Firebase (free tier, then usage-based)  
❌ **Setup Complexity**: Requires configuration for each service  
❌ **Data Privacy Concerns**: User data sent to third parties (mitigated with PII masking)  
❌ **Vendor Lock-In**: Difficult to switch once invested

### Mitigations

**Costs**:

- Start with free tiers
- Use sampling (10% traces, 10% replays)
- Set usage alerts to avoid surprises
- Budget review quarterly

**Privacy**:

- Mask PII (emails, passwords, credit cards)
- Configure Sentry `beforeSend` to filter sensitive data
- Document data handling in privacy policy
- Offer opt-out mechanism

**Vendor Lock-In**:

- Use abstraction layer (our telemetry module)
- Can swap implementations without changing app code
- Keep logs in structured format for portability

## Migration Plan

### Phase 1: Development Setup (Week 1)

- ✅ Implement telemetry module (web + mobile)
- ✅ Add logger, error tracker, metrics tracker
- ✅ Test in development with console output
- ✅ Document usage

### Phase 2: Staging Integration (Week 2)

- Add Sentry to web (staging environment)
- Add Firebase to mobile (staging environment)
- Configure dashboards
- Test error capturing

### Phase 3: Production Deployment (Week 3)

- Deploy with 10% sampling
- Monitor for issues
- Increase to 100% if stable
- Set up alerts

### Phase 4: Optimization (Ongoing)

- Review dashboards weekly
- Adjust SLO thresholds based on data
- Add custom metrics as needed
- Optimize sampling rates

## Monitoring the Monitors

### Health Checks

1. **Test Errors Weekly**: Manually trigger test errors to verify reporting works
2. **Review Alert Fatigue**: Track alert frequency, reduce noisy alerts
3. **Dashboard Usage**: Monitor who's using dashboards, improve if unused
4. **SLO Review**: Quarterly review of SLOs, adjust based on capability

### Metrics on Metrics

- **Alert Response Time**: How fast do we acknowledge alerts?
- **Alert Resolution Time**: How fast do we fix issues?
- **False Positive Rate**: What % of alerts are actionable?
- **Dashboard Views**: Are people using the dashboards?

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics)
- [Datadog RUM](https://docs.datadoghq.com/real_user_monitoring/)
- [Web Vitals](https://web.dev/vitals/)
- [Google SRE Book - SLOs](https://sre.google/sre-book/service-level-objectives/)

## Appendix: Code Locations

### Web

- Types: `/web/src/lib/telemetry/types.ts`
- Logger: `/web/src/lib/telemetry/logger.ts`
- Errors: `/web/src/lib/telemetry/errors.ts`
- Metrics: `/web/src/lib/telemetry/metrics.ts`
- Index: `/web/src/lib/telemetry/index.ts`
- ErrorBoundary: `/web/src/components/ErrorBoundary.tsx`
- README: `/web/src/lib/telemetry/README.md`

### Mobile

- Types: `/mobile/src/lib/telemetry/types.ts`
- Logger: `/mobile/src/lib/telemetry/logger.ts`
- Errors: `/mobile/src/lib/telemetry/errors.ts`
- Metrics: `/mobile/src/lib/telemetry/metrics.ts`
- Index: `/mobile/src/lib/telemetry/index.ts`
- README: `/mobile/src/lib/telemetry/README.md`

---
