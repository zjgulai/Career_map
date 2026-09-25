---
name: javascript
description: JavaScript micro-optimizations and performance patterns. Use when optimizing loops, array operations, caching, or DOM manipulation. Includes Set/Map usage, early returns, and memory-efficient patterns.
---

# JavaScript Performance

> Micro-optimizations for high-performance JavaScript.

## Instructions

### 1. Use Set for Lookups

```typescript
// ❌ Bad - O(n) lookup
const ids = [1, 2, 3, 4, 5];
if (ids.includes(targetId)) { ... }

// ✅ Good - O(1) lookup
const idSet = new Set([1, 2, 3, 4, 5]);
if (idSet.has(targetId)) { ... }
```

### 2. Use Map for Key-Value

```typescript
// ❌ Bad - object for dynamic keys
const cache: { [key: string]: Data } = {};
cache[key] = data;

// ✅ Good - Map for dynamic keys
const cache = new Map<string, Data>();
cache.set(key, data);
```

### 3. Early Returns

```typescript
// ❌ Bad - nested conditions
function process(data) {
  if (data) {
    if (data.isValid) {
      if (data.type === 'user') {
        return handleUser(data);
      }
    }
  }
  return null;
}

// ✅ Good - early returns
function process(data) {
  if (!data) return null;
  if (!data.isValid) return null;
  if (data.type !== 'user') return null;
  return handleUser(data);
}
```

### 4. Avoid Creating Arrays

```typescript
// ❌ Bad - creates intermediate array
const result = items.filter(x => x.active).map(x => x.name)[0];

// ✅ Good - find first match
const result = items.find(x => x.active)?.name;
```

### 5. Batch DOM Updates

```typescript
// ❌ Bad - multiple reflows
items.forEach(item => {
  const el = document.createElement('div');
  el.textContent = item.name;
  container.appendChild(el);
});

// ✅ Good - single reflow
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const el = document.createElement('div');
  el.textContent = item.name;
  fragment.appendChild(el);
});
container.appendChild(fragment);
```

### 6. Passive Event Listeners

```typescript
// ✅ Use passive for scroll/touch events
element.addEventListener('scroll', handler, { passive: true });
element.addEventListener('touchstart', handler, { passive: true });
```

### 7. Caching Expensive Operations

```typescript
// ✅ Memoization
const cache = new Map();

function expensiveCalculation(input: string) {
  if (cache.has(input)) {
    return cache.get(input);
  }
  const result = /* expensive operation */;
  cache.set(input, result);
  return result;
}
```

### 8. Object Spread vs Object.assign

```typescript
// ✅ For small objects - spread is fine
const merged = { ...a, ...b };

// ✅ For large objects - Object.assign is faster
const merged = Object.assign({}, a, b);
```

## References

- [JavaScript Performance](https://developer.mozilla.org/en-US/docs/Learn/Performance)
- [V8 Blog](https://v8.dev/blog)
