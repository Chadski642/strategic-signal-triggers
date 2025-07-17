# Strategic Signal Triggers

This repository contains signal detection patterns and implementations for the StrategicSignal product. These signals help identify business opportunities and insights from website analysis.

## Repository Structure

- `/signals` - Contains all signal detectors organized by signal ID
  - Each signal has its own directory with:
    - `spec.md` - Signal specification and research
    - `detector.js` - Implementation of the detection algorithm
    - `tests/` - Testing files for the detector
- `triggers-database.md` - Master database of all signals by category
- `implementation-tracking.md` - Current implementation status of all signals

## Recently Added Signals

### CONTENT_PERSONALIZATION_GAP
**Category**: Marketing Technology Signals  
**Description**: Identifies websites with user login/accounts that collect user data but lack personalized content delivery.  
**Added**: 2025-07-17

## Implementation Status

See `implementation-tracking.md` for the current status of all signals.

## Running Tests

```
npm test
```

Or test a specific signal:

```
npm test -- --signal=CONTENT_PERSONALIZATION_GAP
```

## License

Propietary - All rights reserved