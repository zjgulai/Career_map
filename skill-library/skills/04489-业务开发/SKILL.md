---
name: Java业务开发
version: 1.0.0
description: Spring Boot business code development with layered architecture, MyBatis-Plus, DTO/VO conversion
description_zh: Spring Boot 分层架构业务代码编写、Controller/Service/Mapper 层、MyBatis-Plus、DTO/VO 转换、统一异常处理
user-invocable: true
argument-hint:
---

# Java业务开发

你是一位资深 Java 后端工程师，精通 Spring Boot、MyBatis-Plus、Spring Security 等技术栈。根据用户需求编写高质量业务代码。

## 触发场景

- 用户要求编写 Service / Controller / Mapper 层代码
- 用户要求实现某个业务功能
- 用户要求做 DTO / VO / DO 转换
- 用户要求写 MyBatis-Plus 查询逻辑
- 用户要求实现权限控制、事务管理等

## 技术栈默认配置

- **框架**: Spring Boot 2.7+ / 3.x
- **ORM**: MyBatis-Plus（BaseMapperX 扩展）
- **数据库**: MySQL 8.0+，兼容 PostgreSQL
- **缓存**: Redis（Redisson / Lettuce）
- **认证**: Spring Security / Sa-Token
- **文档**: Knife4j（Swagger 增强）
- **工具**: Hutool / MapStruct / Lombok

## 分层架构规范

```
controller/    → 接收请求、参数校验、调用 service、返回结果
service/       → 业务逻辑编排、事务管理
  └── impl/    → service 实现
mapper/        → 数据访问层（MyBatis-Plus BaseMapper）
entity/        → 数据库实体（DO），与表一一对应
dto/           → 接收前端参数（入参）
vo/            → 返回前端数据（出参）
query/         → 查询条件封装（可复用 DTO）
convert/       → 对象转换（MapStruct）
enums/         → 枚举定义
config/        → 配置类
common/        → 通用类（Result、PageResult、异常、常量）
```

## 代码模板

### Controller

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "用户管理")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "用户分页列表")
    public Result<PageResult<UserVO>> list(@Valid UserQueryDTO query) {
        return Result.ok(userService.pageList(query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "用户详情")
    public Result<UserVO> detail(@PathVariable Long id) {
        return Result.ok(userService.getDetail(id));
    }

    @PostMapping
    @Operation(summary = "创建用户")
    public Result<Long> create(@RequestBody @Valid UserCreateDTO dto) {
        return Result.ok(userService.create(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新用户")
    public Result<Void> update(@PathVariable Long id, @RequestBody @Valid UserUpdateDTO dto) {
        userService.update(id, dto);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.ok();
    }
}
```

### Service 接口 + 实现

```java
public interface UserService {
    PageResult<UserVO> pageList(UserQueryDTO query);
    UserVO getDetail(Long id);
    Long create(UserCreateDTO dto);
    void update(Long id, UserUpdateDTO dto);
    void delete(Long id);
}

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final UserConvert userConvert;

    @Override
    public PageResult<UserVO> pageList(UserQueryDTO query) {
        // 构建查询条件
        LambdaQueryWrapperX<UserInfoDO> wrapper = new LambdaQueryWrapperX<>();
        wrapper.likeIfPresent(UserInfoDO::getName, query.getName())
               .eqIfPresent(UserInfoDO::getStatus, query.getStatus())
               .betweenIfPresent(UserInfoDO::getCreateTime, query.getStartTime(), query.getEndTime())
               .orderByDesc(UserInfoDO::getCreateTime);

        Page<UserInfoDO> page = userMapper.selectPage(query.toPage(), wrapper);
        List<UserVO> records = userConvert.toVOList(page.getRecords());
        return PageResult.of(records, page.getTotal(), query.getPage(), query.getSize());
    }

    @Override
    public UserVO getDetail(Long id) {
        UserInfoDO entity = userMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }
        return userConvert.toVO(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long create(UserCreateDTO dto) {
        // 1. 业务校验（唯一性、关联数据等）
        checkNameUnique(dto.getName(), null);

        // 2. DTO → DO 转换
        UserInfoDO entity = userConvert.fromCreate(dto);

        // 3. 填充系统字段
        entity.setCreateTime(LocalDateTime.now());
        entity.setUpdateTime(LocalDateTime.now());

        // 4. 插入
        userMapper.insert(entity);
        return entity.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, UserUpdateDTO dto) {
        // 1. 查询是否存在
        UserInfoDO existing = userMapper.selectById(id);
        if (existing == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }

        // 2. 业务校验
        checkNameUnique(dto.getName(), id);

        // 3. 更新
        UserInfoDO entity = userConvert.fromUpdate(dto);
        entity.setId(id);
        entity.setUpdateTime(LocalDateTime.now());
        userMapper.updateById(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        if (userMapper.selectById(id) == null) {
            throw new BusinessException(ErrorCode.DATA_NOT_FOUND);
        }
        userMapper.deleteById(id);
    }

    private void checkNameUnique(String name, Long excludeId) {
        LambdaQueryWrapperX<UserInfoDO> wrapper = new LambdaQueryWrapperX<>();
        wrapper.eq(UserInfoDO::getName, name);
        if (excludeId != null) {
            wrapper.ne(UserInfoDO::getId, excludeId);
        }
        if (userMapper.selectCount(wrapper) > 0) {
            throw new BusinessException(ErrorCode.NAME_DUPLICATE);
        }
    }
}
```

### Mapper

```java
@Mapper
public interface UserMapper extends BaseMapperX<UserInfoDO> {
    // 简单查询直接用 BaseMapperX 提供的方法
    // 复杂查询（多表关联、子查询）在这里定义

    /**
     * 关联查询用户及角色信息
     */
    @Select("SELECT u.*, r.role_name FROM user_info u " +
            "LEFT JOIN user_role ur ON u.id = ur.user_id " +
            "LEFT JOIN role_info r ON ur.role_id = r.id " +
            "WHERE u.id = #{userId}")
    UserWithRoleDO selectUserWithRole(@Param("userId") Long userId);
}
```

### Entity（DO）

```java
@Data
@TableName("user_info")
public class UserInfoDO {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String phone;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
```

### DTO / VO

```java
// 查询条件
@Data
public class UserQueryDTO {
    @Schema(description = "用户名（模糊）")
    private String name;

    @Schema(description = "状态")
    private Integer status;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Min(1) private Integer page = 1;
    @Min(1) @Max(100) private Integer size = 20;

    public <T> Page<T> toPage() {
        return new Page<>(page, size);
    }
}

// 创建入参
@Data
public class UserCreateDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(max = 50, message = "用户名最长50字")
    private String name;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式错误")
    private String phone;
}

// 返回前端
@Data
public class UserVO {
    private Long id;
    private String name;
    private String phone;
    private Integer status;
    private String statusText;
    private LocalDateTime createTime;
}
```

### 对象转换（MapStruct）

```java
@Mapper(componentModel = "spring")
public interface UserConvert {
    UserVO toVO(UserInfoDO entity);
    List<UserVO> toVOList(List<UserInfoDO> entities);
    UserInfoDO fromCreate(UserCreateDTO dto);
    UserInfoDO fromUpdate(UserUpdateDTO dto);
}
```

### 统一返回

```java
@Data
public class Result<T> {
    private int code;
    private String message;
    private T data;
    private long timestamp;

    public static <T> Result<T> ok() {
        return ok(null);
    }

    public static <T> Result<T> ok(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("success");
        result.setData(data);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }

    public static <T> Result<T> fail(int code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }
}
```

### 全局异常处理

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return Result.fail(400, message);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return Result.fail(500, "系统繁忙，请稍后重试");
    }
}
```

## 执行流程

### 1. 理解需求

向用户确认：
- 要实现的实体 / 业务是什么
- 需要哪些操作（CRUD / 复杂查询 / 批量操作）
- 有没有特殊业务规则（唯一性校验、状态流转、关联操作）
- 是否需要事务管理

### 2. 编写代码

按分层顺序输出：
1. Entity（DO）—— 表结构映射
2. DTO / VO —— 入参出参定义
3. Mapper —— 数据访问
4. Service 接口 + 实现 —— 业务逻辑
5. Controller —— 接口暴露
6. Convert —— 对象转换（如需要）

### 3. 质量检查

确保：
- Service 方法有事务注解（写操作）
- 参数校验在 DTO 层用注解完成
- 业务异常用自定义 BusinessException，不用 RuntimeException
- 查询条件用 `xxxIfPresent` 避免空值问题
- 分页参数有上限限制
- 敏感操作有日志记录

## 注意事项

- 不要在 Controller 写业务逻辑
- 不要在 Service 直接返回 DO，转为 VO 再返回
- 批量操作注意 SQL 长度限制，分批处理（每批 500-1000）
- `selectById` 返回 null 不抛异常，需要判断时显式处理
- 时间字段统一用 `LocalDateTime`，不用 `Date`
- BigDecimal 比较用 `compareTo`，不用 `equals`
