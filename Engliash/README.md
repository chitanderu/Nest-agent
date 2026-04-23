### 实战项目正式开始

正式学习之前一定要学完前置知识2-11集，否则会一脸懵逼。

### 什么是monorepo?

传统模式是一个项目对应一个仓库，而monorepo是一个仓库对应多个项目。

- pnpm workspaces：轻量高效，基于硬链接节省磁盘空间；
- yarn workspaces：与 yarn 包管理器集成，支持多包管理；
- lerna：专注于多包发布、版本管理，常与 yarn/pnpm 配合使用；
- turbo：专注于构建优化，通过缓存和并行构建提高构建速度；

有什么优势吗？

1. 根项目可以使用共享依赖：例如A B C三个项目都需要使用dayjs只需要在根目录安装一次即可，传统的做法就是每个项目都要安装一次。
2. 子项目间的依赖可以直接引用本地包，实时更新，不需要重复安装依赖。
3. TypeScript管理，前后端共用一份TypeScript类型，后端增加字段，前端同步更新，完美避开了丢失字段的问题。



### 初始化项目

```bash
npm i pnpm -g
```
对其版本号

pnpm 10.26.1
node v24.11.1
nest 11.0.14

1. 新建apps目录，用于存放前端项目
2. 新建server目录，用于存放后端项目
3. 新建packages目录，用于存放公共包
4. 新建子目录packages/common，用于存放公共类型
5. 新建子目录packages/config，用于存放公共配置
6. 创建pnpm-workspace.yaml管理monorepo项目

```yaml
packages:
  - 'apps/*'
  - 'server'
  - 'packages/*'
```

定义package.json name字段 使用@开头

apps执行,初始化vue项目

```bash
npm init vue
```

server执行,初始化nest项目
```json
{
  "webpack":true, //移除这一行代码
  "generateOptions": {
    "spec": false
  }
}
```
```bash
nest new server
cd server
npx prisma init
nest g app ai
nest g lib shared
nest g res chat --project ai
nest g res user --project server
nest g mo prisma --project shared
nest g s  prisma --project shared
```

### 第二阶段配置启动命令

concurrently可以同时启动多个命令

```bash
pnpm install concurrently -w
```

pnpm --filter就是指定包名启动命令

```bash
pnpm --filter @en/server start:dev
pnpm --filter @en/ai start:dev
pnpm --filter @en/web start:dev
```

安装本地模块

```bash
pnpm --filter @en/web add @en/config@workspace:*
pnpm --filter @en/server add @en/config@workspace:*
```

### 第三阶段配置数据库