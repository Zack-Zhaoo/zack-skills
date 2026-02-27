---
name: algo-engineer
description: Algorithm design, system architecture, and software engineering problem-solving. Use when designing algorithms, architecting systems, reviewing code, optimizing performance, or making technical design decisions. Covers data structures, algorithms, distributed systems, API design, and code quality.
---

# Algorithm Engineer

A specialized skill for algorithm design, system architecture, and software engineering excellence.

## Core Capabilities

1. **Algorithm Design**
   - Problem decomposition
   - Complexity analysis (time/space)
   - Trade-off evaluation
   - Edge case handling

2. **System Architecture**
   - Component design
   - Interface/contracts definition
   - Scalability considerations
   - Failure mode analysis

3. **Code Quality**
   - Review and feedback
   - Refactoring strategies
   - Testing approaches
   - Documentation standards

4. **Performance Engineering**
   - Bottleneck identification
   - Optimization strategies
   - Profiling guidance
   - Resource management

## Design Principles

### Algorithm Thinking
1. **Start with constraints**: What are the real requirements?
2. **Naive first**: Understand the baseline
3. **Optimize consciously**: Profile before optimizing
4. **Trade-offs explicitly**: Document why X over Y

### System Design Heuristics
- **Single Responsibility**: One reason to change
- **Interface Segregation**: Minimize surface area
- **Dependency Direction**: Stable depends on unstable
- **Fail Fast**: Errors should be loud and early

### Code Review Checklist
```
□ Correctness: Does it do what it claims?
□ Edge cases: Empty inputs, errors, boundaries
□ Performance: Any obvious inefficiencies?
□ Readability: Will Future You understand this?
□ Test coverage: Critical paths tested?
□ Documentation: Public APIs documented?
```

## Common Patterns

### Algorithm Patterns
- **Two Pointers**: Sorted arrays, palindromes
- **Sliding Window**: Subarray/substring problems
- **Binary Search**: Search space reduction
- **BFS/DFS**: Graph traversal, connected components
- **Dynamic Programming**: Optimal substructure problems
- **Union-Find**: Connectivity, cycles
- **Topological Sort**: Dependency ordering

### System Patterns
- **Producer-Consumer**: Decouple generation from processing
- **Circuit Breaker**: Fail fast under load
- **Rate Limiting**: Protect resources
- **Caching**: Time-space trade-offs
- **CQRS**: Separate read/write models
- **Event Sourcing**: Audit trail, replay capability

### Data Structure Selection
| Use Case | Structure | Why |
|----------|-----------|-----|
| Fast lookup | Hash Map | O(1) average |
| Ordered data | Tree/Skip List | O(log n) operations |
| LRU cache | Linked Hash Map | O(1) get + update order |
| Priority queue | Heap | O(log n) insert/extract |
| Union-find | Disjoint Set | Near O(1) connectivity |
| String search | Trie/Suffix Array | Prefix matching |

## Complexity Analysis

### Big O Reference
- **O(1)**: Constant - hash lookup, array access
- **O(log n)**: Logarithmic - binary search, balanced trees
- **O(n)**: Linear - single pass, two pointers
- **O(n log n)**: Linearithmic - efficient sorts
- **O(n²)**: Quadratic - nested loops
- **O(2ⁿ)**: Exponential - subsets, permutations

### Space Complexity Notes
- Recursion depth counts toward space
- Output space usually not counted
- Auxiliary space is what matters

## Language-Agnostic Guidelines

### Python
- Prefer list comprehensions for simple transforms
- Use generators for large sequences
- `collections` module is your friend
- Type hints for public APIs

### JavaScript/TypeScript
- Prefer `const`, use `let` intentionally
- Understand closure and `this` binding
- Async patterns: promises > callbacks
- Null-safety with optional chaining

### Go
- Error handling is explicit (good!)
- Interfaces are satisfied implicitly
- Channels for coordination
- Avoid premature abstraction

### Rust
- Ownership is the paradigm
- `Result` and `Option` for safety
- Zero-cost abstractions
- Fearless concurrency

## Problem-Solving Framework

1. **Understand**: Restate the problem in your own words
2. **Examples**: Work through 2-3 concrete examples
3. **Brute Force**: Get a working solution first
4. **Analyze**: What's the complexity? Where are bottlenecks?
5. **Optimize**: Apply patterns, trade space for time
6. **Validate**: Test edge cases, prove correctness
7. **Reflect**: What did you learn? What patterns apply?

## Anti-Patterns to Avoid

- **Premature optimization**: Measure first
- **Over-engineering**: Simple > clever
- **Magic numbers**: Named constants
- **God objects**: Split responsibilities
- **Deep nesting**: Early returns, extract functions
- **Copy-paste**: Abstract common patterns
