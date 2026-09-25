---
id: SKL-data-DATAVALIDATIONRULES
name: Data Validation Rules
description: "Data Validation Rules are constraints and checks that ensure data meets\
  \ quality standards before being stored or processed. Validation should happen at\
  \ multiple layers\u2014database, application, API, and "
version: 1.0.0
status: active
owner: '@cerebra-team'
last_updated: '2026-02-22'
category: Backend
tags:
- api
- backend
- server
- database
stack:
- Python
- Node.js
- REST API
- GraphQL
difficulty: Intermediate
---

# Data Validation Rules

## Skill Profile
*(Select at least one profile to enable specific modules)*
- [ ] **DevOps**
- [x] **Backend**
- [ ] **Frontend**
- [ ] **AI-RAG**
- [ ] **Security Critical**

## Overview
Data Validation Rules are constraints and checks that ensure data meets quality standards before being stored or processed. Validation should happen at multiple layers—database, application, API, and pipeline—to create defense in depth.

**Core Principle**: "Validate early, validate often. Never trust user input or upstream data."

This skill provides comprehensive guidance on implementing validation rules across all layers of the data stack.

## Why This Matters
- **<Benefit>**: <short explanation>
- **<Benefit>**: <short explanation>
- **<Benefit>**: <short explanation>

## Core Concepts & Rules

### 1. Core Principles
- Follow established patterns and conventions
- Maintain consistency across codebase
- Document decisions and trade-offs

### 2. Implementation Guidelines
- Start with the simplest viable solution
- Iterate based on feedback and requirements
- Test thoroughly before deployment


## Inputs / Outputs / Contracts
* **Inputs**:
  - <e.g., env vars, request payload, file paths, schema>
* **Entry Conditions**:
  - <Pre-requisites: e.g., Repo initialized, DB running, specific branch checked out>
* **Outputs**:
  - <e.g., artifacts (PR diff, docs, tests, dashboard JSON)>
* **Artifacts Required (Deliverables)**:
  - <e.g., Code Diff, Unit Tests, Migration Script, API Docs>
* **Acceptance Evidence**:
  - <e.g., Test Report (screenshot/log), Benchmark Result, Security Scan Report>
* **Success Criteria**:
  - <e.g., p95 < 300ms, coverage ≥ 80%>

## Skill Composition
* **Depends on**: None
* **Compatible with**: None
* **Conflicts with**: None
* **Related Skills**: None

## Quick Start
#

## Assumptions
- Validation rules can be defined declaratively
- Team has capacity to maintain validation logic
- Performance requirements allow for validation overhead
- Error messages can be made user-friendly

## Compatibility
- Works with any programming language
- Compatible with all major databases
- Framework-agnostic approach
- Adaptable to different validation libraries

## Test Scenario Matrix
| Scenario | Test Case | Expected Outcome |
|----------|-----------|------------------|
| Required field | Submit without required field | Validation error with clear message |
| Type mismatch | Submit string for number field | Validation error |
| Invalid format | Submit invalid email | Validation error |
| Out of range | Submit age = 200 | Validation error |
| Invalid enum | Submit invalid status | Validation error |
| Cross-field | End date before start date | Validation error |

## Technical Guardrails & Security Threat Model

### 1. Security & Privacy (Threat Model)
* **Top Threats**: Injection attacks, authentication bypass, data exposure
- [ ] **Data Handling**: Sanitize all user inputs to prevent Injection attacks. Never log raw PII
- [ ] **Secrets Management**: No hardcoded API keys. Use Env Vars/Secrets Manager
- [ ] **Authorization**: Validate user permissions before state changes

### 2. Performance & Resources
- [ ] **Execution Efficiency**: Consider time complexity for algorithms
- [ ] **Memory Management**: Use streams/pagination for large data
- [ ] **Resource Cleanup**: Close DB connections/file handlers in finally blocks

### 3. Architecture & Scalability
- [ ] **Design Pattern**: Follow SOLID principles, use Dependency Injection
- [ ] **Modularity**: Decouple logic from UI/Frameworks

### 4. Observability & Reliability
- [ ] **Logging Standards**: Structured JSON, include trace IDs `request_id`
- [ ] **Metrics**: Track `error_rate`, `latency`, `queue_depth`
- [ ] **Error Handling**: Standardized error codes, no bare except
- [ ] **Observability Artifacts**:
    - **Log Fields**: timestamp, level, message, request_id
    - **Metrics**: request_count, error_count, response_time
    - **Dashboards/Alerts**: High Error Rate > 5%


## Agent Directives
1. **Validate everywhere** - At database, application, API, and pipeline
2. **Fail fast** - Reject invalid data as early as possible
3. **Meaningful errors** - Provide clear, actionable error messages
4. **Test validation** - Validation rules need testing too
5. **Document rules** - Make validation visible to all

## Definition of Done
Data validation implementation is complete when:

- [ ] Validation rules defined for all data types
- [ ] Validation implemented at all layers (DB, app, API, pipeline)
- [ ] Error messages are clear and actionable
- [ ] Validation rules are tested
- [ ] Performance is optimized for batch operations
- [ ] Documentation is complete
- [ ] API consumers are informed of validation rules
- [ ] Monitoring is in place for validation failures
- [ ] Regular review schedule established
- [ ] Team trained on validation procedures

## Anti-patterns
1. **Validating only at one layer** - Need defense in depth
2. **Silent failures** - Always return validation errors
3. **Generic error messages** - Be specific about what's wrong
4. **Trusting upstream data** - Validate everything
5. **Complex validation logic** - Keep it simple and maintainable

## Reference Links
#

## Versioning
This skill follows semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes to procedures or standards
- **MINOR**: New validation methods or significant enhancements
- **PATCH**: Bug fixes or documentation updates
