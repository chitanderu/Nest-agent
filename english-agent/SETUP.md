# English Agent 项目配置总结

本仓库是一个 **pnpm workspaces + Nest 11 monorepo + Vue 3** 的全栈模板，下面按「工具链 → 配置流程 → libs/shared 作用」三块讲清楚。

---

## 一、用到的配置工具

### 1. 包管理 & Monorepo
| 工具 | 用途 |
| --- | --- |
| `pnpm` (10.26.1) | 主包管理器，基于硬链接节省磁盘 |
| `pnpm-workspace.yaml` | 声明 `apps/*`、`server`、`packages/*` 为工作区 |
| `concurrently` | 同时启动 web / server / ai 三个进程 |

### 2. 前端（`apps/web`）
| 工具 | 用途 |
| --- | --- |
| `Vue 3` + `vue-router` + `pinia` | 视图、路由、状态管理 |
| `Vite` (+ `vite-plugin-vue-devtools`) | 开发服务器与构建 |
| `@tailwindcss/vite` | Tailwind 样式 |
| `TypeScript` | 类型 |
| `ESLint` + `Prettier` + `oxlint` | 代码检查与格式化 |
| `@en/config` (workspace) | 读取统一端口（`Config.ports.web`） |

### 3. 后端（`server`）
| 工具 | 用途 |
| --- | --- |
| `@nestjs/cli` (11) | Nest monorepo 脚手架、`nest g` 命令 |
| `@nestjs/common` / `@nestjs/core` / `@nestjs/platform-express` | Nest 核心运行时 |
| `Prisma 7` (`prisma` / `@prisma/client`) | ORM & 迁移工具 |
| `@prisma/adapter-pg` | Prisma 7 新版 pg 直连 adapter（驱动方式从 Prisma 引擎切回 node-postgres）|
| `dotenv` | `.env` → `process.env` |
| `TypeScript`, `ESLint`, `Prettier` | 类型与代码规范 |
| `@en/config` (workspace) | 读取统一端口（`Config.ports.server/ai`） |

### 4. 公共包（`packages/`）
| 包名 | 作用 |
| --- | --- |
| `@en/config` | 导出 `Config.ports`，前后端共享端口号 |
| `@en/common` | 预留前后端共用类型（当前为占位） |

---

## 二、三阶段配置流程

### 阶段一：monorepo 初始化

1. 确定版本（`pnpm 10.26.1`、`node ≥ 22`、`nest 11`）。
2. 建目录：`apps/`、`server/`、`packages/common`、`packages/config`。
3. 写 `pnpm-workspace.yaml`：
   ```yaml
   packages:
     - 'apps/*'
     - 'server'
     - 'packages/*'
   ```
4. 每个子包 `package.json` 的 `name` 都用 `@en/` 前缀（`@en/web`、`@en/server`、`@en/config`、`@en/common`），便于 `pnpm --filter` 精确定位。
5. `apps/` 下用 `npm create vue@latest web -- --ts --router --pinia --eslint --prettier` 生成前端骨架，再把包名改为 `@en/web`。
6. 根目录执行 `nest new server --package-manager pnpm`，再进入 `server/` 执行：
   ```bash
   npx prisma init                       # 生成 prisma/、.env、prisma.config.ts
   nest g app ai                         # 自动切换为 monorepo，生成 apps/server & apps/ai
   nest g lib shared                     # 生成 libs/shared
   nest g res chat --project ai          # 选 REST + CRUD
   nest g res user --project server      # 选 REST + CRUD
   nest g mo prisma --project shared     # libs/shared/src/prisma/prisma.module.ts
   nest g s  prisma --project shared     # libs/shared/src/prisma/prisma.service.ts
   ```
7. 整理：
   - `nest-cli.json` 加 `"generateOptions": { "spec": false }`（不生成单元测试）；
   - `tsconfig.json` 的 `paths` 加 `@libs/shared` 与 `@libs/shared/*` 两条别名；
   - 根 `tsconfig.json` 加 `"ignoreDeprecations": "6.0"` 消除 TS 6 的 `baseUrl` 告警。

### 阶段二：启动命令与本地包联动

1. `pnpm install concurrently -w` 把 concurrently 装到工作区根。
2. 根 `package.json` 增加脚本：
   ```json
   {
     "scripts": {
       "web":    "pnpm --filter @en/web dev",
       "server": "pnpm --filter @en/server start:dev",
       "ai":     "pnpm --filter @en/server start:dev ai",
       "all":    "concurrently \"pnpm run web\" \"pnpm run server\" \"pnpm run ai\""
     }
   }
   ```
   注意 `ai` 不是独立包，它是 Nest monorepo 中的子应用，通过 `nest start ai` 启动，所以仍用 `@en/server` 做 filter。
3. 把本地包挂到两端：
   ```bash
   pnpm --filter @en/web    add "@en/config@workspace:*"
   pnpm --filter @en/server add "@en/config@workspace:*"
   ```
4. 代码里读取端口：
   - `apps/web/vite.config.ts` → `server: { port: Config.ports.web }`
   - `apps/server/src/main.ts` → `app.listen(Config.ports.server)`
   - `apps/ai/src/main.ts`     → `app.listen(Config.ports.ai)`

### 阶段三：数据库（Prisma 7 + PostgreSQL）

1. 加依赖：
   ```bash
   pnpm --filter @en/server add @prisma/client @prisma/adapter-pg dotenv
   pnpm --filter @en/server add -D prisma
   ```
2. `server/.env`：
   ```
   DATABASE_URL="postgresql://<user>:<pwd>@localhost:5432/english"
   ```
3. `server/prisma.config.ts`（Prisma 7 必须）：
   ```ts
   import 'dotenv/config';
   import { defineConfig } from 'prisma/config';
   export default defineConfig({
     schema: 'prisma/schema.prisma',
     migrations: { path: 'prisma/migrations' },
     datasource: { url: process.env['DATABASE_URL'] },
   });
   ```
4. `server/prisma/schema.prisma` 的两个关键点（和 Prisma ≤ 6 不一样）：
   - `datasource db` **只写 `provider`**，不再写 `url`（URL 只存 `prisma.config.ts`）；
   - `generator client` 用新版 `"prisma-client"`，把产物输出到 `../libs/shared/src/generated/prisma`，`moduleFormat = "cjs"`。
5. `libs/shared/src/prisma/prisma.service.ts` 继承生成的 `PrismaClient`，构造器里用 `PrismaPg` adapter：
   ```ts
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   super({ adapter });
   ```
6. 生成 client 与表结构：
   ```bash
   pnpm --filter @en/server exec prisma generate
   pnpm --filter @en/server exec prisma migrate dev --name init
   ```

---

## 三、`libs/shared` 干什么用？

`libs/shared` 是 **Nest monorepo 里的内部库**（由 `nest g lib shared` 生成），通过 `tsconfig.json` 的 `paths` 映射到 `@libs/shared` 别名，被 `apps/server` 与 `apps/ai` 共同复用。

当前这个库承担 3 个职责：

1. **集中放「跨应用的基础设施」**
   目前核心是 Prisma：
   ```
   libs/shared/src/
   ├── prisma/
   │   ├── prisma.module.ts        # 只暴露 PrismaService
   │   └── prisma.service.ts       # 继承 PrismaClient + pg adapter
   ├── generated/prisma/           # prisma generate 产物（不手改）
   ├── shared.module.ts            # @Global()，聚合 + 全局暴露
   ├── shared.service.ts
   └── index.ts                    # 统一出口
   ```

2. **做成 `@Global()` 聚合模块，一次导入全站可用**
   `shared.module.ts` 里：
   ```ts
   @Global()
   @Module({
     imports: [PrismaModule],
     providers: [SharedService],
     exports: [SharedService, PrismaModule],
   })
   export class SharedModule {}
   ```
   好处是 `apps/server` 和 `apps/ai` 在根模块里只需 `imports: [SharedModule]`，里面的 `PrismaService` 就能在任何 controller/service 里直接 `constructor(private prisma: PrismaService) {}` 注入，不用在每个业务模块里重复 `imports: [PrismaModule]`。

3. **把 Prisma 生成的 Client 藏在库里**
   因为 `schema.prisma` 的 `output` 写到 `libs/shared/src/generated/prisma`，业务代码永远只接触 `PrismaService`，不会散落 `import { PrismaClient } from '...generated/prisma'` 到各处。未来升 Prisma 或换驱动，只改 `libs/shared/src/prisma/prisma.service.ts` 一个文件即可。

> 一句话：**`apps/*` 放业务，`libs/shared` 放“每个 app 都要用的底座”**；Prisma 之外，后续的响应拦截器、异常过滤器、日志、鉴权守卫、工具函数，也都可以归到这里。

---

## 四、常用命令速查

```bash
# 安装全部依赖
pnpm install

# 前端开发
pnpm run web                        # http://localhost:8080

# 后端开发
pnpm run server                     # http://localhost:3000
pnpm run ai                         # http://localhost:3001

# 一键全起
pnpm run all

# Prisma
pnpm --filter @en/server exec prisma generate
pnpm --filter @en/server exec prisma migrate dev --name <change>
pnpm --filter @en/server exec prisma studio

# 新建资源（Nest monorepo 里必须带 --project）
pnpm --filter @en/server exec nest g res <name> --project server
pnpm --filter @en/server exec nest g res <name> --project ai
```
