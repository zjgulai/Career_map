---
id: SKL-multipart-MULTIPARTUPLOAD
name: Multipart Upload
description: Multipart upload allows you to upload a single object as a set of parts.
  Each part is a contiguous portion of object's data. You can upload these object
  parts independently and in any order. If transm
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

# Multipart Upload

## Skill Profile
*(Select at least one profile to enable specific modules)*
- [ ] **DevOps**
- [x] **Backend**
- [ ] **Frontend**
- [ ] **AI-RAG**
- [ ] **Security Critical**

## Overview
Multipart upload allows you to upload a single object as a set of parts. Each part is a contiguous portion of object's data. You can upload these object parts independently and in any order. If transmission of any part fails, you can retransmit that part without affecting other parts.

## Why This Matters
Multipart upload is essential for handling large file uploads efficiently. It provides:
- **Network Resilience**: Retry failed parts without restarting entire upload
- **Parallel Uploads**: Upload multiple parts simultaneously for faster uploads
- **Pause/Resume**: Pause and resume uploads at any time
- **Bandwidth Optimization**: Better utilize available bandwidth
- **Cost Efficiency**: Only pay for successful part uploads

This skill provides comprehensive patterns for implementing multipart upload with S3, including chunking strategies, progress tracking, error handling, and resume capability.

---

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

## Quick Start / Implementation Example

1. Review requirements and constraints
2. Set up development environment
3. Implement core functionality following patterns
4. Write tests for critical paths
5. Run tests and fix issues
6. Document any deviations or decisions

```python
# Example implementation following best practices
def example_function():
    # Your implementation here
    pass
```


## Assumptions
- AWS S3 is the storage backend
- Sufficient bandwidth for parallel uploads
- Client supports File API and ArrayBuffer
- Browser supports Promise and async/await

## Compatibility
- S3 Multipart Upload: AWS S3 only
- File API: Modern browsers (IE10+)
- Promise: Modern browsers (IE11+ with polyfill)

---

## Test Scenario Matrix
| Scenario | Test Case | Expected Result |
|----------|-----------|----------------|
| Large File Upload | Upload 500MB file | Upload completes successfully |
| Network Interruption | Disconnect during upload | Upload resumes on reconnect |
| Failed Part | Part upload fails | Part is retried |
| Parallel Uploads | Upload with 3 parallel parts | Upload completes faster |
| Resume | Resume interrupted upload | Upload continues from last part |

---

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
- Always use minimum 5MB chunk size (except last part)
- Implement exponential backoff for retries
- Track upload state for resume capability
- Clean up incomplete uploads
- Monitor upload progress

## Definition of Done (DoD) Checklist

- [ ] Tests passed + coverage met
- [ ] Lint/Typecheck passed
- [ ] Logging/Metrics/Trace implemented
- [ ] Security checks passed
- [ ] Documentation/Changelog updated
- [ ] Accessibility/Performance requirements met (if frontend)


## Anti-patterns
1. **Too small chunks**: Use minimum 5MB chunk size
2. **Too many parallel uploads**: Limit to 3-5 parallel uploads
3. **Not sorting parts**: Parts must be sorted before completion
4. **Not aborting failed uploads**: Always clean up incomplete uploads
5. **Not implementing retry**: Use exponential backoff for retries

## Reference Links & Examples

* Internal documentation and examples
* Official documentation and best practices
* Community resources and discussions


## Versioning & Changelog

* **Version**: 1.0.0
* **Changelog**:
  - 2026-02-22: Initial version with complete template structure

