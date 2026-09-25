---
id: SKL-robotics-ROBOTICSROS
name: Robotics Ros
description: Robotics with ROS provides a comprehensive framework for building robotics
  applications using the Robot Operating System (ROS). This skill covers ROS1 (Melodic/Noetic)
  and ROS2 (Humble/Iron/Jazzy) dev
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

# Robotics Ros

## Skill Profile
*(Select at least one profile to enable specific modules)*
- [ ] **DevOps**
- [x] **Backend**
- [ ] **Frontend**
- [ ] **AI-RAG**
- [ ] **Security Critical**

## Overview
Robotics with ROS provides a comprehensive framework for building robotics applications using the Robot Operating System (ROS). This skill covers ROS1 (Melodic/Noetic) and ROS2 (Humble/Iron/Jazzy) development patterns, including node creation, topic communication, action servers, and navigation stacks. Following these standards ensures compatibility with the ROS ecosystem and enables building complex robotic systems.

## Why This Matters
- **Ecosystem Compatibility**: ROS is the de facto standard for robotics with extensive community support
- **Modularity**: ROS architecture enables building complex systems from reusable components
- **Simulation Support**: Gazebo and Rviz integration for testing and visualization
- **Hardware Abstraction**: Unified interface for different sensors and actuators
- **AI Integration**: Easy integration with ML and computer vision libraries

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
  - Robot hardware specifications
  - Sensor data streams
  - Environment maps and configurations
  - Navigation goals and waypoints
  - ROS workspace with packages
* **Entry Conditions**:
  - ROS is installed (ROS1 or ROS2)
  - Build system (Catkin or Colcon) is configured
  - Robot hardware is connected and accessible
  - Workspace is properly structured
* **Outputs**:
  - ROS nodes and launch files
  - Compiled packages and executables
  - Navigation plans and robot trajectories
  - Sensor processing results
* **Artifacts Required (Deliverables)**:
  - ROS package with CMakeLists.txt or package.xml
  - Launch files for robot configuration
  - Node executables and libraries
  - URDF files for robot description
* **Acceptance Evidence**:
  - ROS nodes communicate correctly on topics/services
  - Navigation reaches goals without collision
  - Sensor data is processed and published
  - Robot moves according to planned trajectory
* **Success Criteria**:
  - Node communication latency: <100ms
  - Navigation success rate: ≥95%
  - Sensor processing rate: ≥30Hz
  - Build time: <5min for typical package

## Skill Composition
* **Depends on**: [`embedded-systems`](01-foundations/embedded-systems/SKILL.md), [`computer-vision`](05-ai-ml-core/computer-vision/SKILL.md)
* **Compatible with**: [`sensor-data-processing`](95-embodied-ai-robotics/sensor-data-processing/SKILL.md), [`actuator-control`](95-embodied-ai-robotics/actuator-control/SKILL.md)
* **Conflicts with**: None
* **Related Skills**: [`slam-navigation`](95-embodied-ai-robotics/slam-navigation/SKILL.md), [`robot-simulation`](95-embodied-ai-robotics/robot-simulation/SKILL.md)

---

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


## Assumptions / Constraints / Non-goals

* **Assumptions**:
  - Development environment is properly configured
  - Required dependencies are available
  - Team has basic understanding of domain
* **Constraints**:
  - Must follow existing codebase conventions
  - Time and resource limitations
  - Compatibility requirements
* **Non-goals**:
  - This skill does not cover edge cases outside scope
  - Not a replacement for formal training


## Compatibility & Prerequisites

* **Supported Versions**:
  - Python 3.8+
  - Node.js 16+
  - Modern browsers (Chrome, Firefox, Safari, Edge)
* **Required AI Tools**:
  - Code editor (VS Code recommended)
  - Testing framework appropriate for language
  - Version control (Git)
* **Dependencies**:
  - Language-specific package manager
  - Build tools
  - Testing libraries
* **Environment Setup**:
  - `.env.example` keys: `API_KEY`, `DATABASE_URL` (no values)


## Test Scenario Matrix (QA Strategy)

| Type | Focus Area | Required Scenarios / Mocks |
| :--- | :--- | :--- |
| **Unit** | Core Logic | Must cover primary logic and at least 3 edge/error cases. Target minimum 80% coverage |
| **Integration** | DB / API | All external API calls or database connections must be mocked during unit tests |
| **E2E** | User Journey | Critical user flows to test |
| **Performance** | Latency / Load | Benchmark requirements |
| **Security** | Vuln / Auth | SAST/DAST or dependency audit |
| **Frontend** | UX / A11y | Accessibility checklist (WCAG), Performance Budget (Lighthouse score) |


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


## Agent Directives & Error Recovery
*(ข้อกำหนดสำหรับ AI Agent ในการคิดและแก้ปัญหาเมื่อเกิดข้อผิดพลาด)*

- **Thinking Process**: Analyze root cause before fixing. Do not brute-force.
- **Fallback Strategy**: Stop after 3 failed test attempts. Output root cause and ask for human intervention/clarification.
- **Self-Review**: Check against Guardrails & Anti-patterns before finalizing.
- **Output Constraints**: Output ONLY the modified code block. Do not explain unless asked.


## Definition of Done (DoD) Checklist

- [ ] Tests passed + coverage met
- [ ] Lint/Typecheck passed
- [ ] Logging/Metrics/Trace implemented
- [ ] Security checks passed
- [ ] Documentation/Changelog updated
- [ ] Accessibility/Performance requirements met (if frontend)


## Anti-patterns / Pitfalls

* ⛔ **Don't**: Log PII, catch-all exception, N+1 queries
* ⚠️ **Watch out for**: Common symptoms and quick fixes
* 💡 **Instead**: Use proper error handling, pagination, and logging


## Reference Links & Examples

* Internal documentation and examples
* Official documentation and best practices
* Community resources and discussions


## Versioning & Changelog

* **Version**: 1.0.0
* **Changelog**:
  - 2026-02-22: Initial version with complete template structure

