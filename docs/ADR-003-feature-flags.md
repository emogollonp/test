# ADR-003: Feature Flags and Experiments System

**Date**: 2024-01-15  
**Related**: ADR-002 (Tracking Architecture)

## Context

Mesa247 needs a scalable, production-ready system for:

1. **A/B Testing**: Test different UI designs and features
2. **Feature Flags**: Control feature rollouts (gradual, targeted)
3. **Experiments**: Run controlled experiments with variants
4. **Rollbacks**: Quickly disable features without deployment

### Requirements

- Random assignment on first exposure
- Persistent assignment across sessions
- Automatic exposure tracking (for analysis)
- Type-safe variants (prevent runtime errors)
- Extensible to multiple experiments
- Platform-specific (web + mobile, no shared code)
- No server dependency (client-side only)
- Works offline

### Current Use Case

**Experiment**: `restaurant_card_variant`

- **Variant A (compact)**: Original compact design
- **Variant B (extended)**: Enhanced design with more information
- **Split**: 50/50

## Decision

We will implement a **client-side, local-storage-based feature flags system** with:

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (RestaurantCard Component)             │
└──────────────┬──────────────────────────┘
               │ getExperiment()
               ↓
┌─────────────────────────────────────────┐
│       Experiments Core                  │
│  - Random assignment                    │
│  - Variant distribution                 │
│  - Exposure tracking                    │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        ↓             ↓
┌──────────────┐  ┌─────────────┐
│   Storage    │  │  Tracking   │
│ localStorage │  │   System    │
│ AsyncStorage │  │             │
└──────────────┘  └─────────────┘
```

### Core Principles

1. **Client-Side Assignment**
    - Random assignment on first access
    - Deterministic (same user = same variant)
    - No server required

2. **Persistent Storage**
    - **Web**: localStorage
    - **Mobile**: AsyncStorage
    - Version-controlled schema

3. **Automatic Tracking**
    - Tracks `ExperimentExposed` event
    - Once per session (deduplicated)
    - Sent to analytics provider

4. **Type Safety**
    - All variants strongly typed
    - Compile-time errors for invalid variants
    - IntelliSense support

5. **Platform Separation**
    - No shared code between web/mobile
    - Each optimized for its platform

## Implementation Details

### Web (`/web/src/lib/experiments/`)

```typescript
// Synchronous API (localStorage is sync)
const variant = getExperiment('restaurant_card_variant');
// Returns: 'compact' | 'extended'

// Force variant (testing)
setExperimentVariant('restaurant_card_variant', 'extended');

// Clear all assignments
clearAssignments();
```

**Storage**: `localStorage['mesa247_experiments']`

### Mobile (`/mobile/src/lib/experiments/`)

```typescript
// Asynchronous API (AsyncStorage is async)
const variant = await getExperiment('restaurant_card_variant');
// Returns: Promise<'compact' | 'extended'>

// Force variant (testing)
await setExperimentVariant('restaurant_card_variant', 'extended');

// Clear all assignments
await clearAssignments();
```

**Storage**: `AsyncStorage['mesa247_experiments']`

### Assignment Algorithm

```typescript
function assignVariant(config: ExperimentConfig) {
    const { variants, weights } = config;

    // Weighted random selection
    const random = Math.random(); // 0.0 to 1.0
    let cumulativeWeight = 0;

    for (let i = 0; i < variants.length; i++) {
        cumulativeWeight += weights[i];
        if (random <= cumulativeWeight) {
            return variants[i];
        }
    }

    // Fallback to first variant
    return variants[0];
}
```

**Example**: 50/50 split

- Random 0.0-0.5 → Variant A (compact)
- Random 0.5-1.0 → Variant B (extended)

### Storage Schema

```json
{
    "version": "1.0.0",
    "assignments": {
        "restaurant_card_variant": {
            "name": "restaurant_card_variant",
            "variant": "extended",
            "assignedAt": "2024-01-15T10:30:00.000Z"
        },
        "new_checkout": {
            "name": "new_checkout",
            "variant": "on",
            "assignedAt": "2024-01-16T14:20:00.000Z"
        }
    }
}
```

**Version Control**: Storage version checked on load. Mismatch = clear all assignments (breaking changes).

### Tracking Integration

When `getExperiment()` is called:

```typescript
// 1. Load or assign variant
const variant = await getExperiment('restaurant_card_variant');

// 2. Track exposure (automatically)
track({
    name: 'ExperimentExposed',
    properties: {
        experimentName: 'restaurant_card_variant',
        variant: 'extended',
        exposedAt: '2024-01-15T10:30:00.000Z',
    },
});

// 3. Return variant
return variant;
```

**Deduplication**: Tracked once per session per experiment+variant (prevents duplicate events).

## Alternatives Considered

### 1. Server-Side Assignment

**Pros**:

- Centralized control
- Can target specific users
- Can change assignments dynamically

**Cons**:

- Requires backend infrastructure
- Network latency (slower)
- Doesn't work offline
- More complex (DB, API, auth)
- Costs money (hosting, DB)

**Verdict**: Rejected (overkill for current needs)

### 2. Cookie-Based Storage

**Pros**:

- Persistent across domains
- Can be read by server

**Cons**:

- Size limit (4KB)
- Sent with every request (overhead)
- Privacy concerns (GDPR)
- Mobile doesn't have cookies

**Verdict**: Rejected (not mobile-friendly)

### 3. URL Query Parameters

**Pros**:

- Easy to test (just add ?variant=extended)
- Shareable (can send link)

**Cons**:

- Not persistent
- Pollutes URL
- Easy to manipulate
- Not suitable for random assignment

**Verdict**: Rejected (not persistent)

### 4. Third-Party Services (LaunchDarkly, Optimizely, Split.io)

**Pros**:

- Feature-rich (targeting, scheduling, metrics)
- Managed service (no maintenance)
- Advanced features (multivariate, bandits)

**Cons**:

- Costs money ($$$)
- Vendor lock-in
- External dependency
- Privacy concerns (data sent to 3rd party)
- Requires SDK integration
- Network required

**Verdict**: Rejected (too expensive, over-engineered for current needs)

### 5. IndexedDB (Web)

**Pros**:

- Large storage capacity
- Structured data

**Cons**:

- More complex API
- Async (slower for simple reads)
- Not available in all contexts (workers)

**Verdict**: Rejected (localStorage is sufficient)

## Consequences

### Positive

**Zero Server Cost**: No backend required  
 **Fast**: Synchronous on web, local on mobile  
 **Offline Support**: Works without network  
 **Type Safety**: Compile-time checks prevent errors  
 **Simple**: Easy to understand and maintain  
 **Extensible**: Easy to add new experiments  
 **Automatic Tracking**: No manual tracking needed  
 **Privacy-Friendly**: Data stays on device  
 **Platform-Optimized**: Each platform uses best practices

### Negative

**No Centralized Control**: Can't change assignments remotely  
**No User Targeting**: Can't target specific users/segments  
**No Dynamic Weights**: Can't adjust weights without code change  
**Client-Side Only**: Can't use for backend features  
**Clear Storage = New Assignment**: User can reset by clearing browser data

### Mitigations

1. **No Centralized Control**
    - Mitigation: Use gradual rollout (10% → 50% → 100%)
    - Acceptable: Most experiments don't need real-time control

2. **No User Targeting**
    - Mitigation: Use multiple experiments for different scenarios
    - Future: Add user properties to assignment logic if needed

3. **No Dynamic Weights**
    - Mitigation: Deploy new weights via code (fast with CI/CD)
    - Acceptable: Weight changes are rare

4. **Clear Storage = New Assignment**
    - Mitigation: Track `assignedAt` to detect re-assignments
    - Acceptable: Small % of users, won't skew results significantly

## Production Readiness

### Rollout Strategy

1. **Phase 1: Single Experiment** (Current)
    - Experiment: `restaurant_card_variant`
    - Split: 50/50
    - Duration: 2 weeks
    - Metrics: View rate, click rate, conversion

2. **Phase 2: Gradual Rollout**
    - Start: 10% traffic
    - Increment: +10% every 2 days
    - Monitor: Error rates, performance
    - Rollback: If errors > 1%

3. **Phase 3: Multiple Experiments**
    - Add new experiments as needed
    - Max 5 concurrent experiments
    - Document each in code + Notion

### Monitoring

1. **Exposure Tracking**
    - Dashboard: Amplitude/Mixpanel
    - Alert: If exposure rate < 90%
    - Review: Weekly

2. **Assignment Distribution**
    - Expected: 50/50 split
    - Alert: If deviation > 5%
    - Check: Daily

3. **Error Tracking**
    - Monitor: Sentry
    - Alert: If errors mention "experiment"
    - Review: Real-time

### Experimentation Workflow

```
1. Define Experiment
   ↓ (Add to types.ts + index.ts)
2. Implement Variants
   ↓ (Create variant components)
3. Deploy to Production
   ↓ (Via CI/CD)
4. Monitor Exposure
   ↓ (Check analytics)
5. Analyze Results
   ↓ (After 2 weeks)
6. Make Decision
   ↓ (Keep winner, remove loser)
7. Clean Up Code
   ↓ (Remove experiment code)
```

### Testing

1. **Unit Tests**
    - Test assignment algorithm
    - Test storage read/write
    - Test tracking integration

2. **Integration Tests**
    - Test full experiment flow
    - Test variant rendering
    - Test storage persistence

3. **Manual Testing**
    - Force each variant
    - Check tracking events
    - Verify storage format

### Documentation

- README in `/web/src/lib/experiments/`
- README in `/mobile/src/lib/experiments/`
- ADR-003 (this document)
- Inline code comments
- TypeScript types (self-documenting)

## Future Improvements

### Short-Term (1-3 months)

1. **User Properties**
    - Add `userId` to assignment logic
    - Consistent assignment per user (not just per device)

2. **Experiment Dashboard**
    - Show all active experiments
    - Display current variant
    - Quick toggle for testing

3. **Remote Config**
    - Fetch experiment configs from CDN
    - Update weights without code deploy
    - Still client-side assignment

### Long-Term (6-12 months)

1. **Server-Side Flags** (if needed)
    - For backend features
    - For sensitive experiments
    - Separate from client-side system

2. **Advanced Targeting**
    - Target by user segment
    - Target by geography
    - Target by device type

3. **Multi-Armed Bandits**
    - Automatically optimize towards winner
    - Reduce traffic to losers
    - Faster convergence

4. **Staged Rollouts**
    - Automatic gradual rollout (10% → 20% → ... → 100%)
    - Automatic rollback on errors
    - Integration with CI/CD

## References

- [Flippers: From Flags to Features](https://engineering.atspotify.com/2023/11/flippers-from-flags-to-features/)
- [How Airbnb Standardized Metric Computation](https://medium.com/airbnb-engineering/airbnb-metric-computation-framework-dc9c607d0f83)
- [Stripe's A/B Testing Infrastructure](https://stripe.com/blog/how-we-built-our-experimentation-platform)
- [Google's HEART Framework](https://www.dtelepathy.com/blog/business/google-s-heart-framework-for-measuring-ux)

## Appendix: Code Locations

### Web

- Types: `/web/src/lib/experiments/types.ts`
- Storage: `/web/src/lib/experiments/storage.ts`
- Core: `/web/src/lib/experiments/index.ts`
- Usage: `/web/src/components/restaurants/RestaurantCard.tsx`

### Mobile

- Types: `/mobile/src/lib/experiments/types.ts`
- Storage: `/mobile/src/lib/experiments/storage.ts`
- Core: `/mobile/src/lib/experiments/index.ts`
- Usage: `/mobile/src/components/restaurants/RestaurantCard.tsx`

### Tracking

- Web: `/web/src/lib/tracking/types.ts` (ExperimentExposed event)
- Mobile: `/mobile/src/lib/tracking/types.ts` (ExperimentExposed event)

---

**Decision**: Approved  
**Implementation**: Complete  
**Status**: 🚀 Production Ready
