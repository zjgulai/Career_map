---
name: "refactor"
title: "代码重构"
description: "在不改变外部行为的前提下按坏味道清单做外科式重构：提函数、拆大类、去重复、引入类型与设计模式。触发词：代码重构、refactor、在不改变外部行为的前提下按坏味道清单做外科式重构：提函数、拆大类、去重复、引入类型与设计模式。"
enabled: "true"
disable-model-invocation: false
user-invocable: true
---

# 重构

## 概述

在不改变外部行为的前提下改进代码结构与可读性。重构是渐进演化，不是革命。用它来改进既有代码，而不是从零重写。

## 何时使用

在以下情形使用本技能：

- 代码难以理解或维护
- 函数/类过大
- 代码坏味道需要处理
- 因为代码结构问题导致加功能很困难
- 用户说「清理一下这段代码」「重构它」「改进它」

---

## 重构原则

### 黄金法则

1. **行为保持不变** - 重构不改变代码做什么，只改变怎么做
2. **小步走** - 每次改动都很小，每改一次就测一次
3. **版本控制是你的朋友** - 在每个安全状态前后都提交
4. **测试是必需的** - 没有测试，你就不是在重构，你是在改代码
5. **一次只做一件事** - 不要把重构与功能改动混在一起

### 何时不该重构

```
- 能正常工作且不会再改的代码（没坏就别修……）
- 没有测试的关键生产代码（先补测试）
- 你正赶一个很紧的截止期
- 「就是顺手」——需要明确的目的
```

---

## 常见代码坏味道与修法

### 1. 过长的方法/函数

```diff
# BAD: 200-line function that does everything
- async function processOrder(orderId) {
-   // 50 lines: fetch order
-   // 30 lines: validate order
-   // 40 lines: calculate pricing
-   // 30 lines: update inventory
-   // 20 lines: create shipment
-   // 30 lines: send notifications
- }

# GOOD: Broken into focused functions
+ async function processOrder(orderId) {
+   const order = await fetchOrder(orderId);
+   validateOrder(order);
+   const pricing = calculatePricing(order);
+   await updateInventory(order);
+   const shipment = await createShipment(order);
+   await sendNotifications(order, pricing, shipment);
+   return { order, pricing, shipment };
+ }
```

### 2. 重复代码

```diff
# BAD: Same logic in multiple places
- function calculateUserDiscount(user) {
-   if (user.membership === 'gold') return user.total * 0.2;
-   if (user.membership === 'silver') return user.total * 0.1;
-   return 0;
- }
-
- function calculateOrderDiscount(order) {
-   if (order.user.membership === 'gold') return order.total * 0.2;
-   if (order.user.membership === 'silver') return order.total * 0.1;
-   return 0;
- }

# GOOD: Extract common logic
+ function getMembershipDiscountRate(membership) {
+   const rates = { gold: 0.2, silver: 0.1 };
+   return rates[membership] || 0;
+ }
+
+ function calculateUserDiscount(user) {
+   return user.total * getMembershipDiscountRate(user.membership);
+ }
+
+ function calculateOrderDiscount(order) {
+   return order.total * getMembershipDiscountRate(order.user.membership);
+ }
```

### 3. 过大的类/模块

```diff
# BAD: God object that knows too much
- class UserManager {
-   createUser() { /* ... */ }
-   updateUser() { /* ... */ }
-   deleteUser() { /* ... */ }
-   sendEmail() { /* ... */ }
-   generateReport() { /* ... */ }
-   handlePayment() { /* ... */ }
-   validateAddress() { /* ... */ }
-   // 50 more methods...
- }

# GOOD: Single responsibility per class
+ class UserService {
+   create(data) { /* ... */ }
+   update(id, data) { /* ... */ }
+   delete(id) { /* ... */ }
+ }
+
+ class EmailService {
+   send(to, subject, body) { /* ... */ }
+ }
+
+ class ReportService {
+   generate(type, params) { /* ... */ }
+ }
+
+ class PaymentService {
+   process(amount, method) { /* ... */ }
+ }
```

### 4. 过长的参数列表

```diff
# BAD: Too many parameters
- function createUser(email, password, name, age, address, city, country, phone) {
-   /* ... */
- }

# GOOD: Group related parameters
+ interface UserData {
+   email: string;
+   [REDACTED]
+   name: string;
+   age?: number;
+   address?: Address;
+   phone?: string;
+ }
+
+ function createUser(data: UserData) {
+   /* ... */
+ }

# EVEN BETTER: Use builder pattern for complex construction
+ const user = UserBuilder
+   .email('test@example.com')
+   .password('secure123')
+   .name('Test User')
+   .address(address)
+   .build();
```

### 5. 依恋情结

```diff
# BAD: Method that uses another object's data more than its own
- class Order {
-   calculateDiscount(user) {
-     if (user.membershipLevel === 'gold') {
+       return this.total * 0.2;
+     }
+     if (user.accountAge > 365) {
+       return this.total * 0.1;
+     }
+     return 0;
+   }
+ }

# GOOD: Move logic to the object that owns the data
+ class User {
+   getDiscountRate(orderTotal) {
+     if (this.membershipLevel === 'gold') return 0.2;
+     if (this.accountAge > 365) return 0.1;
+     return 0;
+   }
+ }
+
+ class Order {
+   calculateDiscount(user) {
+     return this.total * user.getDiscountRate(this.total);
+   }
+ }
```

### 6. 基本类型偏执

```diff
# BAD: Using primitives for domain concepts
- function sendEmail(to, subject, body) { /* ... */ }
- sendEmail('user@example.com', 'Hello', '...');

- function createPhone(country, number) {
-   return `${country}-${number}`;
- }

# GOOD: Use domain types
+ class Email {
+   private constructor(public readonly value: string) {
+     if (!Email.isValid(value)) throw new Error('Invalid email');
+   }
+   static create(value: string) { return new Email(value); }
+   static isValid(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
+ }
+
+ class PhoneNumber {
+   constructor(
+     public readonly country: string,
+     public readonly number: string
+   ) {
+     if (!PhoneNumber.isValid(country, number)) throw new Error('Invalid phone');
+   }
+   toString() { return `${this.country}-${this.number}`; }
+   static isValid(country: string, number: string) { /* ... */ }
+ }
+
+ // Usage
+ const email = Email.create('user@example.com');
+ const phone = new PhoneNumber('1', '555-1234');
```

### 7. 魔法数字/字符串

```diff
# BAD: Unexplained values
- if (user.status === 2) { /* ... */ }
- const discount = total * 0.15;
- setTimeout(callback, 86400000);

# GOOD: Named constants
+ const UserStatus = {
+   ACTIVE: 1,
+   INACTIVE: 2,
+   SUSPENDED: 3
+ } as const;
+
+ const DISCOUNT_RATES = {
+   STANDARD: 0.1,
+   PREMIUM: 0.15,
+   VIP: 0.2
+ } as const;
+
+ const ONE_DAY_MS = 24 * 60 * 60 * 1000;
+
+ if (user.status === UserStatus.INACTIVE) { /* ... */ }
+ const discount = total * DISCOUNT_RATES.PREMIUM;
+ setTimeout(callback, ONE_DAY_MS);
```

### 8. 嵌套条件

```diff
# BAD: Arrow code
- function process(order) {
-   if (order) {
-     if (order.user) {
-       if (order.user.isActive) {
-         if (order.total > 0) {
-           return processOrder(order);
+         } else {
+           return { error: 'Invalid total' };
+         }
+       } else {
+         return { error: 'User inactive' };
+       }
+     } else {
+       return { error: 'No user' };
+     }
+   } else {
+     return { error: 'No order' };
+   }
+ }

# GOOD: Guard clauses / early returns
+ function process(order) {
+   if (!order) return { error: 'No order' };
+   if (!order.user) return { error: 'No user' };
+   if (!order.user.isActive) return { error: 'User inactive' };
+   if (order.total <= 0) return { error: 'Invalid total' };
+   return processOrder(order);
+ }

# EVEN BETTER: Using Result type
+ function process(order): Result<ProcessedOrder, Error> {
+   return Result.combine([
+     validateOrderExists(order),
+     validateUserExists(order),
+     validateUserActive(order.user),
+     validateOrderTotal(order)
+   ]).flatMap(() => processOrder(order));
+ }
```

### 9. 死代码

```diff
# BAD: Unused code lingers
- function oldImplementation() { /* ... */ }
- const DEPRECATED_VALUE = 5;
- import { unusedThing } from './somewhere';
- // Commented out code
- // function oldCode() { /* ... */ }

# GOOD: Remove it
+ // Delete unused functions, imports, and commented code
+ // If you need it again, git history has it
```

### 10. 不当的亲密关系

```diff
# BAD: One class reaches deep into another
- class OrderProcessor {
-   process(order) {
-     order.user.profile.address.street;  // Too intimate
-     order.repository.connection.config;  // Breaking encapsulation
+   }
+ }

# GOOD: Ask, don't tell
+ class OrderProcessor {
+   process(order) {
+     order.getShippingAddress();  // Order knows how to get it
+     order.save();  // Order knows how to save itself
+   }
+ }
```

---

## 提取方法重构

### 前与后

```diff
# Before: One long function
- function printReport(users) {
-   console.log('USER REPORT');
-   console.log('============');
-   console.log('');
-   console.log(`Total users: ${users.length}`);
-   console.log('');
-   console.log('ACTIVE USERS');
-   console.log('------------');
-   const active = users.filter(u => u.isActive);
-   active.forEach(u => {
-     console.log(`- ${u.name} (${u.email})`);
-   });
-   console.log('');
-   console.log(`Active: ${active.length}`);
-   console.log('');
-   console.log('INACTIVE USERS');
-   console.log('--------------');
-   const inactive = users.filter(u => !u.isActive);
-   inactive.forEach(u => {
-     console.log(`- ${u.name} (${u.email})`);
-   });
-   console.log('');
-   console.log(`Inactive: ${inactive.length}`);
- }

# After: Extracted methods
+ function printReport(users) {
+   printHeader('USER REPORT');
+   console.log(`Total users: ${users.length}\n`);
+   printUserSection('ACTIVE USERS', users.filter(u => u.isActive));
+   printUserSection('INACTIVE USERS', users.filter(u => !u.isActive));
+ }
+
+ function printHeader(title) {
+   const line = '='.repeat(title.length);
+   console.log(title);
+   console.log(line);
+   console.log('');
+ }
+
+ function printUserSection(title, users) {
+   console.log(title);
+   console.log('-'.repeat(title.length));
+   users.forEach(u => console.log(`- ${u.name} (${u.email})`));
+   console.log('');
+   console.log(`${title.split(' ')[0]}: ${users.length}`);
+   console.log('');
+ }
```

---

## 引入类型安全

### 从无类型到有类型

```diff
# Before: No types
- function calculateDiscount(user, total, membership, date) {
-   if (membership === 'gold' && date.getDay() === 5) {
-     return total * 0.25;
-   }
-   if (membership === 'gold') return total * 0.2;
-   return total * 0.1;
- }

# After: Full type safety
+ type Membership = 'bronze' | 'silver' | 'gold';
+
+ interface User {
+   id: string;
+   name: string;
+   membership: Membership;
+ }
+
+ interface DiscountResult {
+   original: number;
+   discount: number;
+   final: number;
+   rate: number;
+ }
+
+ function calculateDiscount(
+   user: User,
+   total: number,
+   date: Date = new Date()
+ ): DiscountResult {
+   if (total < 0) throw new Error('Total cannot be negative');
+
+   let rate = 0.1; // Default bronze
+
+   if (user.membership === 'gold' && date.getDay() === 5) {
+     rate = 0.25; // Friday bonus for gold
+   } else if (user.membership === 'gold') {
+     rate = 0.2;
+   } else if (user.membership === 'silver') {
+     rate = 0.15;
+   }
+
+   const discount = total * rate;
+
+   return {
+     original: total,
+     discount,
+     final: total - discount,
+     rate
+   };
+ }
```

---

## 用于重构的设计模式

### Strategy 模式

```diff
# Before: Conditional logic
- function calculateShipping(order, method) {
-   if (method === 'standard') {
-     return order.total > 50 ? 0 : 5.99;
-   } else if (method === 'express') {
-     return order.total > 100 ? 9.99 : 14.99;
+   } else if (method === 'overnight') {
+     return 29.99;
+   }
+ }

# After: Strategy pattern
+ interface ShippingStrategy {
+   calculate(order: Order): number;
+ }
+
+ class StandardShipping implements ShippingStrategy {
+   calculate(order: Order) {
+     return order.total > 50 ? 0 : 5.99;
+   }
+ }
+
+ class ExpressShipping implements ShippingStrategy {
+   calculate(order: Order) {
+     return order.total > 100 ? 9.99 : 14.99;
+   }
+ }
+
+ class OvernightShipping implements ShippingStrategy {
+   calculate(order: Order) {
+     return 29.99;
+   }
+ }
+
+ function calculateShipping(order: Order, strategy: ShippingStrategy) {
+   return strategy.calculate(order);
+ }
```

### 责任链

```diff
# Before: Nested validation
- function validate(user) {
-   const errors = [];
-   if (!user.email) errors.push('Email required');
+   else if (!isValidEmail(user.email)) errors.push('Invalid email');
+   if (!user.name) errors.push('Name required');
+   if (user.age < 18) errors.push('Must be 18+');
+   if (user.country === 'blocked') errors.push('Country not supported');
+   return errors;
+ }

# After: Chain of responsibility
+ abstract class Validator {
+   abstract validate(user: User): string | null;
+   setNext(validator: Validator): Validator {
+     this.next = validator;
+     return validator;
+   }
+   validate(user: User): string | null {
+     const error = this.doValidate(user);
+     if (error) return error;
+     return this.next?.validate(user) ?? null;
+   }
+ }
+
+ class EmailRequiredValidator extends Validator {
+   doValidate(user: User) {
+     return !user.email ? 'Email required' : null;
+   }
+ }
+
+ class EmailFormatValidator extends Validator {
+   doValidate(user: User) {
+     return user.email && !isValidEmail(user.email) ? 'Invalid email' : null;
+   }
+ }
+
+ // Build the chain
+ const validator = new EmailRequiredValidator()
+   .setNext(new EmailFormatValidator())
+   .setNext(new NameRequiredValidator())
+   .setNext(new AgeValidator())
+   .setNext(new CountryValidator());
```

---

## 重构步骤

### 安全的重构流程

```
1. PREPARE
   - Ensure tests exist (write them if missing)
   - Commit current state
   - Create feature branch

2. IDENTIFY
   - Find the code smell to address
   - Understand what the code does
   - Plan the refactoring

3. REFACTOR (small steps)
   - Make one small change
   - Run tests
   - Commit if tests pass
   - Repeat

4. VERIFY
   - All tests pass
   - Manual testing if needed
   - Performance unchanged or improved

5. CLEAN UP
   - Update comments
   - Update documentation
   - Final commit
```

---

## 重构检查清单

### 代码质量

- [ ] 函数足够小（< 50 行）
- [ ] 函数只做一件事
- [ ] 没有重复代码
- [ ] 命名有描述性（变量、函数、类）
- [ ] 没有魔法数字/字符串
- [ ] 死代码已删除

### 结构

- [ ] 相关代码放在一起
- [ ] 模块边界清晰
- [ ] 依赖只朝一个方向流动
- [ ] 没有循环依赖

### 类型安全

- [ ] 所有公开 API 都有类型定义
- [ ] 没有无正当理由的 `any` 类型
- [ ] 可空类型都显式标注

### 测试

- [ ] 重构后的代码有测试
- [ ] 测试覆盖边界情况
- [ ] 所有测试通过

---

## 常见重构操作

| 操作                                     | 说明                           |
| --------------------------------------------- | ------------------------------------- |
| Extract Method                                | 把代码片段变成方法        |
| Extract Class                                 | 把行为搬到新类            |
| Extract Interface                             | 从实现中抽出接口  |
| Inline Method                                 | 把方法体搬回调用方       |
| Inline Class                                  | 把类的行为搬到调用方       |
| Pull Up Method                                | 把方法搬到父类             |
| Push Down Method                              | 把方法搬到子类               |
| Rename Method/Variable                        | 提升清晰度                       |
| Introduce Parameter Object                    | 把相关参数归成一组              |
| Replace Conditional with Polymorphism         | 用多态取代 switch/if |
| Replace Magic Number with Constant            | 具名常量                       |
| Decompose Conditional                         | 拆开复杂的条件表达式              |
| Consolidate Conditional                       | 合并重复的条件        |
| Replace Nested Conditional with Guard Clauses | 提前返回                         |
| Introduce Null Object                         | 消除 null 检查                 |
| Replace Type Code with Class/Enum             | 强类型                         |
| Replace Inheritance with Delegation           | 组合优于继承          |
