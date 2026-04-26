# WordBook 模块解析

以 `apps/server/src/word-book/` 为例，讲清两件事：

1. 跨前后端共享的类型 `WordQuery` 是怎么从 `@en/common/word` 流到 controller / service 里的；
2. NestJS 三件套 `module / controller / service` 各自的职责与协作流程。

---

## 一、`WordQuery` 的来源链

`WordQuery` 来自 **`@en/common/word`** —— 也就是 monorepo 里 `packages/common/word/index.ts` 这个共享类型包。整条链是这样接起来的：

### 1. 类型本身在哪里定义

`packages/common/word/index.ts`：

```ts
export interface WordQuery {
  page: number
  pageSize: number
  word?: string
  gk?: boolean
  zk?: boolean
  gre?: boolean
  toefl?: boolean
  ielts?: boolean
  cet6?: boolean
  cet4?: boolean
  ky?: boolean
}
```

这是**前端发给后端的查询条件**：分页参数 + 关键字 + 8 个考试标签。同文件还导出 `Word` 与 `WordList`，对应单词实体与列表响应。

### 2. 通过 pnpm workspace 暴露成 `@en/common/word`

`packages/common/package.json`：

```json
{
  "name": "@en/common",
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./word": "./word/index.ts"
  }
}
```

- `name` = `@en/common`；
- `exports` 中的 `"./word": "./word/index.ts"` 是关键，把 `@en/common/word` 这个子路径映射到具体文件；
- `pnpm-workspace.yaml` 里 `packages/*` 已经是工作区，pnpm 会用 symlink 把它链到任何 `dependencies` 写了 `"@en/common": "workspace:*"` 的子项目。

### 3. server 端把它装进自己依赖

`server/package.json`：

```json
"dependencies": {
  "@en/common": "workspace:*"
}
```

装进来之后，server 里就能用 `@en/common/word` 这个 specifier 拿类型。

### 4. 后端用它做参数声明

```ts
// apps/server/src/word-book/word-book.controller.ts
import type { WordQuery } from '@en/common/word'
@Controller('word-book')
export class WordBookController {
  @Get()
  findAll(@Query() query: WordQuery) {            //  query 形状由 WordQuery 约束
    return this.wordBookService.findAll(query)
  }
}

// apps/server/src/word-book/word-book.service.ts
import type { WordQuery } from '@en/common/word'
async findAll(query: WordQuery) { ... }           //  这里就是要解析的那个
```

> 注意是 `import type`：只在编译期使用，运行时无任何副作用、不增加 bundle，也**不会做运行期校验**。运行期校验请用 `class-validator` + DTO。

### 5. 前端**用同一个类型**发请求

```ts
// apps/web/src/views/WordBook/index.vue
import type { WordQuery, WordList } from '@en/common/word'
const query = ref<WordQuery>({ page: 1, pageSize: 12, word: '', ... })

// apps/web/src/apis/word-book/index.ts
export const getWordBookList = (params: WordQuery): Promise<Response<WordList>> => {
  return serverApi.get('/word-book', { params })
}
```

### 6. monorepo 在这里的核心价值

整条数据流类型守恒：

```
packages/common/word/index.ts (WordQuery)
        │
        ├──► apps/web    (前端构造 query, axios.get)
        │
        └──► server      (controller @Query() → service findAll)
```

后端某天往 `WordQuery` 里加个 `level?: number`，前端 `tsc` 一跑就能立刻提示哪些表单/调用点需要补字段，**不会出现「后端加了字段但前端忘了传」这种 bug**。

### 顺手一个潜在坑

`WordQuery` 里 `page: number / pageSize: number` 是 number，但 HTTP query string 一律是字符串，到后端 `query.page` 实际是 `"1"`。这就是 service 里写：

```ts
skip: (Number(page) - 1) * Number(pageSize),
take: Number(pageSize),
```

而不是直接用 `(page - 1) * pageSize` 的原因 —— **TypeScript 类型只在编译期生效，运行时还得自己 `Number()`**。如果想类型与运行时都对得上，可以把 `WordQuery` 中 `page/pageSize` 改成 `string | number`，或在后端单独写一个 `WordQueryDto`，用 `class-transformer` 的 `@Type(() => Number)` 做强制转换。

---

## 二、`module / controller / service` 三件套

NestJS 的核心思想是 **MVC + 依赖注入（DI）**。一个功能领域（这里是「单词本」）会被拆成 3 个文件，各自负责一段职责。

### 1. `word-book.module.ts` — 装配清单

```ts
@Module({
  controllers: [WordBookController],
  providers: [WordBookService],
})
export class WordBookModule {}
```

**作用：告诉 Nest 这个领域有哪些组件、它们之间的依赖关系**。

类比：把它想成 IKEA 装家具的「物料清单 + 装配图」：
- `controllers` 注册要暴露的 HTTP 入口；
- `providers` 注册可以被注入（`constructor` 拿到）的服务；
- 如果别人也要用 `WordBookService`，再加 `exports: [WordBookService]`；
- 如果它要用别的模块的服务，加 `imports: [...]`。

为什么必须有它？因为 NestJS 启动时只认 `AppModule` 这棵「模块树」。`AppModule` 里 `imports: [..., WordBookModule, ...]`，Nest 才会扫描 module 里声明的 controller / provider 并实例化。**单独写一个 controller/service 但没在 module 里登记 = Nest 完全不知道它存在**（先前数据查不到的根因之一就是 `AppModule` 没 import `WordBookModule`）。

### 2. `word-book.controller.ts` — HTTP 入口

```ts
@Controller('word-book')                                 // 路由前缀: /word-book
export class WordBookController {
  constructor(private readonly wordBookService: WordBookService) {}   // ← DI

  @Get()                                                 // GET /word-book
  findAll(@Query() query: WordQuery) {
    return this.wordBookService.findAll(query)           // 转手交给 service
  }
}
```

**作用：把「HTTP 协议」翻译成「业务方法调用」，再把返回值翻译回 HTTP 响应**。

它只做四件事：
1. **声明路由路径**：`@Controller('word-book')` + `@Get()/@Post()` 等装饰器组合出 `GET /word-book`；叠加 `main.ts` 里的 `setGlobalPrefix('api')` 和 `enableVersioning(...)`，最终路径是 `GET /api/v1/word-book`。
2. **抽取参数**：`@Query() query: WordQuery` 从查询串里取 `?page=1&pageSize=12&...` 组装成对象；类似的还有 `@Param()`、`@Body()`、`@Headers()`、`@Req()` 等。
3. **调用业务**：`this.wordBookService.findAll(query)` —— controller 自己**不写任何业务逻辑**，更不直接访问数据库，纯转发。
4. **返回值**：直接 `return`，Nest 会自动 JSON 序列化；抛 `HttpException` 会被全局 `InterceptorExceptionFilter` 接住统一格式化。

构造器里 `private readonly wordBookService: WordBookService` 就是 **依赖注入**：Nest 看到参数类型，自动从模块 `providers` 里取一个 `WordBookService` 实例塞进来。你不需要 `new WordBookService()`。

### 3. `word-book.service.ts` — 业务逻辑层

```ts
@Injectable()
export class WordBookService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly prismaService: PrismaService,
  ) {}

  async findAll(query: WordQuery) {
    // 1) 解析参数
    const { page = 1, pageSize = 12, word, ...rest } = query
    // 2) 把字符串 'true' 转成 boolean，组合 where 条件
    const tags = Object.fromEntries(
      Object.entries(rest).map(([k, v]) => [k, this.toBoolean(v)])
    )
    const where: Prisma.WordBookWhereInput = {
      word: word ? { contains: word } : undefined,
      ...tags,
    }
    // 3) 并发查 total + list
    const [total = 0, list = []] = await Promise.all([
      this.prismaService.wordBook.count({ where }),
      this.prismaService.wordBook.findMany({
        where,
        skip: (Number(page) - 1) * Number(pageSize),
        take: Number(pageSize),
        orderBy: { frq: 'desc' },
      }),
    ])
    // 4) 用统一的成功响应壳包一下
    return this.responseService.success({ total, list })
  }
}
```

**作用：所有「业务规则 + 数据访问」都在这里**。

它做的事：
1. **参数清洗**：query string 都是字符串，要把 `'true'` 转成 `true`、`Number(page)` 转成数字。
2. **构造数据库查询条件**：用 Prisma 的 `WordBookWhereInput` 类型做模糊搜索 + 标签过滤。
3. **执行查询**：通过注入进来的 `prismaService` 调 Prisma。**Service 是唯一应该写 SQL/ORM 调用的地方**。
4. **返回结构化结果**：通过 `responseService.success()` 套一层统一外壳 `{ data, code, message }`，再被全局拦截器再包一层 `{ timestamp, path, success, ... }`。

`@Injectable()` 装饰器只做一件事：告诉 Nest「这个 class 可以被 DI 容器管理、注入到别处」。

---

## 三、三者的协作流程

一次 `GET /api/v1/word-book?word=hello&page=1&pageSize=12` 的完整路径：

```
浏览器
   │
   ▼
Vite proxy   (/api/v1 → http://localhost:3000)
   │
   ▼
Nest 路由器 ──► WordBookController.findAll(@Query)
                       │
                       ▼
                WordBookService.findAll(query)
                       │
                       ├──► PrismaService.wordBook.count / findMany   (DI 注入)
                       └──► ResponseService.success({ total, list })  (DI 注入)
                       │
                       ▼
   InterceptorInterceptor 包裹成
   { timestamp, path, success, code, data: { total, list }, message }
                       │
                       ▼
                     浏览器
```

`WordBookModule` 自身不出现在请求路径里，但它是把上面这些零件「装在一起」的清单 —— 没有它，controller 和 service 都不会被实例化。

---

## 四、一句话总结

| 文件 | 角色 | 一句话职责 | 不该做什么 |
| --- | --- | --- | --- |
| `*.module.ts`     | 装配清单 | 声明本领域用到的 controller / provider，与外部模块的依赖关系 | 不写业务逻辑 |
| `*.controller.ts` | HTTP 适配层 | 路由 + 参数提取 + 转发给 service | **不查数据库、不写业务规则** |
| `*.service.ts`    | 业务/数据层 | 业务规则 + 通过 ORM 访问数据库 + 返回结构化数据 | 不直接接触 `Request`/`Response` 对象 |

这种分层的最大好处：

- **可测试**：service 不依赖 HTTP，单测里 `new WordBookService(mockResp, mockPrisma)` 直接调用。
- **可复用**：另一个 controller 想拿单词数据时，注入同一个 `WordBookService` 即可。
- **可替换**：哪天把 HTTP 换成 GraphQL/WebSocket，只改 controller，service 完全不动。
