# Guest Identity：可插拔的匿名资源所有权

Guest Identity 让未登录浏览器安全地创建、查看和修改“自己的”资源。它目前服务于评论和 reaction，也可接入其他匿名资源。

它识别的是一个持有 HTTP-only cookie 的浏览器，不是现实中的人，也不解决跨浏览器、跨设备认领。

## 模块边界

```text
@repo/guest-identity
├── backend   纯策略：解析 creationOwner、ownedByViewer、response effects
├── frontend  纯状态机：确认/清除公开 projection，计算展示所有权
└── shared    header、storage key、PublicOwner wire contract

Hono adapter  读取 session/cookie，提交 Set-Cookie 与 response headers
Feature       持久化 owner，并用 viewer scope 授权
React adapter 在资源进入 query cache 前同步 response headers
```

核心区分：

- `creationOwner`：这次新资源记在谁名下。
- `ownedByViewer`：当前请求可以修改哪些 user/guest owner 的资源。

已登录且保留 guest cookie 时，新资源归 user，但 viewer 同时拥有 user 和当前 guest browser。因此登录不会让刚才的匿名操作“看起来丢了”。

## 两份浏览器状态为什么都需要

| 状态                | 存在哪里                                    | 谁能读取   | 用途                         | 能否授权写入 |
| ------------------- | ------------------------------------------- | ---------- | ---------------------------- | ------------ |
| raw guest key       | HTTP-only cookie、资源 owner 字段           | 后端       | 证明请求来自该 guest browser | 是           |
| projected guest key | response header、公开资源数据、localStorage | JavaScript | 在 UI 中关联公开 owner       | 否           |

Cookie 回答后端问题：“这个请求实际持有什么 guest credential？”它是 HTTP-only，避免脚本或公开 reaction list 读出写权限凭证。

localStorage 回答前端问题：“公开列表里的哪个 guest owner 可以显示成我的？”JavaScript 故意读不到 cookie，所以需要一份公开 projection。它只是缓存；页面启动时为 `unconfirmed`，必须由本次服务端 response 确认后才能显示所有权控件。

当前 adapter 用 MD5 生成 projection。这里的 hash 不是为了让弱凭证变安全，而是为了不公开 raw credential。后端授权只比较 raw cookie 与数据库 owner，永远不接受 projection。未来可以更换投影算法而不改变 feature 接口。

## User Stories 与数据流

### A. 第一次访问：请求中没有 guest key

初始 GET 不创建身份：

```text
Browser ── GET/list（无 cookie、无 owner key） ──> API
Browser <── state: absent + resources ─────────── API
Frontend 先同步 absent、清理旧 projection，再发布 resources
```

第一次成功的匿名写入才创建身份：

```text
Browser ── POST feature data（不含 owner key） ──> Feature route
Route   ── resolve(createGuestIfMissing=true) ───> Guest Identity
Route   <── guest creationOwner + 待提交 effects ─ Guest Identity
Feature ── raw owner + resource ─────────────────> Database
Feature <── success ───────────────────────────── Database
Route   ── commit(scope) ────────────────────────> HTTP adapter
Browser <── Set-Cookie(raw, HttpOnly)
           state: present + projected key
           resource result
Frontend 先同步 identity，再写入 UI cache
```

`resolve` 不会立即设置 cookie。校验失败、目标不存在或数据库写入失败时不调用 `commit`，所以失败请求不会偷偷建立身份。

### B. 之后的请求：浏览器已有 cookie

浏览器自动携带 raw cookie；请求 body 仍只包含 feature data。后端 scope 为：

```text
creationOwner = guest:<raw cookie>
ownedByViewer = [guest:<raw cookie>]
```

创建会复用同一 owner。编辑、删除和取消 reaction 都由后端加载真实资源 owner，再检查它是否属于 `ownedByViewer`。

### C. 匿名用户随后登录

session 与 guest cookie 可以同时存在：

```text
creationOwner = user:<session user>
ownedByViewer = [user:<session user>, guest:<raw cookie>]
```

结果：

- 新评论和 reaction 归登录 user；
- 同一浏览器登录前的 guest 评论仍返回 `ownedByViewer: true`，可编辑/删除；
- 登录前的 guest reaction 仍显示选中，可取消；
- 退出登录后只保留 guest owner 的资源权限；
- 不自动改写历史署名，也不执行不可逆的批量“认领”。

### D. Cookie 与前端缓存不一致

资源 response 明确返回：

```text
x-guest-identity-state: present | absent
x-guest-identity: <projected key>  # 仅 present 时
```

前端状态机：

- `unconfirmed`：缓存不能授予 UI 所有权；
- `confirmed-present`：保存服务端 projection，再发布资源数据；
- `confirmed-absent`：静默清理 stale projection；
- `present` 却缺 projection：协议失败，保持 fail-closed。

因此 cookie 还在但 localStorage 丢失时会静默恢复；cookie 丢失但 localStorage 还在时会静默清除。用户只看到符合真实权限的控件，不需要了解 cookie 或 hash。

### E. 攻击者从 reaction list 复制公开 key

公开 projected key 本来就允许被看见，安全性不依赖它保密。即使攻击者把它放进 localStorage、JSON body 或伪造 header：

1. identity adapter 只从可信 session 和 HTTP-only cookie 建立 scope；
2. body/header 中的 owner key 不参与解析；
3. feature 从数据库读取真实 raw owner；
4. 攻击者的 raw cookie 不匹配，取消或删除失败。

隐藏 UI 不是安全边界；服务端 owner membership 检查才是。

## Feature 接入

### 后端：创建资源

```ts
const identity = c.get("guestIdentity");
const scope = identity.resolve({ createGuestIfMissing: true });

const result = await feature.create({
  owner: scope.creationOwner,
  // feature data only
});

if (result.ok) identity.commit(scope);
```

登录用户不会因为调用 `createGuestIfMissing` 而创建 guest owner；纯策略始终优先选择 session user。

### 后端：查询或修改资源

```ts
const scope = c.get("guestIdentity").resolve(); // 不 mint

const resource = await repository.get(id);
const allowed = scope.ownedByViewer.some((owner) =>
  persistenceOwnerEquals(resource.owner, owner),
);
```

查询可以直接返回服务端计算的 `ownedByViewer`，如评论；需要公开 owner 聚合的集合型 feature 可以返回 `PublicOwner`，如 reaction。Raw key 不进入 JSON。

### 前端：同步后再发布数据

```ts
const response = await fetchResource();
guestIdentity.synchronize(response.headers);
queryCache.set(response.data);
```

React/Jotai/Query 属于 adapter，不进入 `@repo/guest-identity` 的纯状态机。

## Feature policy

Guest Identity 只提供 owner scope；各 feature 仍定义自己的集合行为：

- 评论：独立 `guest_owner_key`，与昵称/邮箱分离；旧评论迁移后为 `NULL`，不可被当前 guest 假认领。
- Reaction：add 用 `creationOwner`；但 scope 中已有同一 vote 时保持原 owner 并视为幂等，避免登录后的重试破坏退出登录后的 guest ownership。Read/remove 用全部 `ownedByViewer`；同一 viewer 的 user/guest 重复 vote 在 UI 中计一次，并由一次 remove 一并清理。
- 管理员权限在 feature 层独立判断，不由 guest scope 替代。

## 安全不变量

1. Raw key 只存在于服务端生成的 HTTP-only cookie 和数据库。
2. 客户端不能在 body/header 中选择 authoritative owner。
3. Projection 和 localStorage 只影响展示，不能扩大写权限。
4. Read、edit、delete、remove 不创建 guest identity。
5. Guest identity 仅在成功的 guest-owned create 后提交。
6. 登录后的 creation owner 是 user，ownership scope 同时保留当前 guest browser。
7. Resource response 在数据进入 UI cache 前确认 present/absent；协议异常 fail-closed。

## 代码位置

- 纯模块：`lib/guest-identity/src/`
- Hono adapter：`app/backend/src/modules/identity/guest-identity-plugin.ts`
- React adapter：`lib/comment/src/lib/hooks/guest-identity.ts`
- 评论接入：`app/backend/src/modules/comments/routes/` 与 `services/ownership.ts`
- Reaction 接入：`app/backend/src/modules/comments/routes/reactions.ts`
- 浏览器合同：`app/comment-e2e/tests/guest-*.spec.ts`
