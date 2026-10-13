# ChatGPT Intelligent UI

项目说明在 [README.md](README.md)。这篇是 REA 的证据笔记。

静态解包，对象是未登录的 `https://chatgpt.com/`。没有使用账号、cookie 或已登录会话。结论来自 REA 证据；组件名字来自这些包里的静态字符串，没有执行页面脚本。

## 证据

| 记录 | ID | 内容 |
| --- | --- | --- |
| 可见 Chrome 抓取 | `ev_54d20de93bbe15dc54298047942c4ae5820bb819991b6885587b8d2b94bb6171` | 未登录首页，标题为 ChatGPT 首页，210 个脚本响应体 |
| 首页脚本图 | `ev_a09d88dc9bbdc6e05a98c0e3412b95e6ad8ffd3cebc805bfb2f59520d6bec5f1` | 176 个文件，747 个节点，1068 条边 |
| DIL 模块图 | `ev_6d5063e848ef88abe1684372a0c84f6dc05d68f52e72eb262db51a859dab8245` | 图 `jag_eb53b1709c3e6a9505a9e46e5f5579c6674e7d39334c7a01239a68bbb33ec7fb`，80 个文件，881 个节点，1564 条边 |

无头 Chrome 第一次只到达 Cloudflare 的 “Just a moment...” 页（`ev_4783701de22d9e45415d42b0236208e24ff56e5fc8159a3df2ec40cf92642ae0`）。改成可见窗口、空白配置文件后才进入首页。

## 客户端里的名字

这些包里没有出现产品文案 “Intelligent UI”。对应实现叫 **canonical DIL**，版本标记是 `model_dil_v2` / `modelDilV2`。外壳叫 **Octane**（`unauth-mweb`）。

## 一条回复怎么变成界面

1. Octane 的 application presentation runtime 持有应用帧。静态字符串写明：page component 不能替换 application frame；对话记录在 hydration 期间退出时，presentation owner 会 retire。
2. 助手消息用 content reference 和 partial island 往 DOM 里补块。声明式更新模块认这些标记：`data-assistant-content-reference`、`data-partial-island`、`data-streaming-content-reference`、`template[data-assistant-presentation-flush]`。
3. 规范 DIL 的载荷放在 `script[data-canonical-dil-payload][type="application/json"]`。根节点是 `[data-canonical-dil-root]`。流式修订号的信号命名空间是 `canonical-dil-stream-revision`。
4. `registry-BhKJEzU7.js` 按名字懒加载：
   - `assistant-dil`：旧的 DOM 小组件，`statefulContinuity: true`
   - `assistant-canonical-dil`：`loadMode: "interaction"`，同样保持连续性
5. v2 渲染器在 `assistant-canonical-dil-v2-D3Mxms_M.js`。它从 `canonical-dil-snapshot-B4JFWeNe.js` 引入 `CANONICAL_DIL_V2_COMPONENTS`。样式层名叫 `canonical-dil`，根类名是 `_fv0XaG_DilRenderer` 和 `DilResponseRoot`。
6. 流式出现方式写在属性上：`data-d-stream-word`、`data-d-stream-chart-reveal`、`data-d-stream-media`。组件节点用 `data-d-component`。

判定一段内容是不是 v2 的静态条件包括：`contentReferences` 里存在 `type === "client_defined_widget"`，或 metadata 里有 `modelDilV2` / `model_dil_v2`。

## 两套组件

旧的 `assistant-dil` 直接绑 DOM，已看到的选择器：

- clock、currency、weather、schedule
- league standings、bracket
- stock chart、cricket、calculator、location

v2 快照里的基础件名字包括：box、row、col、card、form、grid-item、list-item、carousel-item、table-row、table-cell、html-view、pressable、pie-chart、segmented-control、date-picker、radio-group、loading-block、swipe-stack、popover、shimmer-text。

v2 大包里的产品件字符串包括：天气、股票图、汇率、地图、职位、新闻、测验、抽认卡、作业辅助、实体评价、预订、图片灯箱、语音邀请，以及一批医学计算器名字。这些是字符串出现，不是运行时确认已经挂上的组件。

## 目录

- `capture/`：抓取场景和页面证据
- `unpacked/`：首页导出的脚本
- `ui-modules/`：首页引用、但当时没执行的 DIL 相关公开脚本
- `analysis/app-evidence.json`：首页图，约 60 MB
- `analysis/dil-evidence.json`：DIL 图，约 50 MB

## 还没覆盖的部分

- 没有登录，也没有看一次真实的模型回复，所以没观察到组件实际被流式画出来。
- 首页还引用了大约 324 个未下载的 chunk，其中大量是语言包。
- REA 对若干文件写了关系展开超出结果预算。图覆盖不完整。静态解析没有执行这些文件。
- `octane-shell-shared` 等少数首页依赖在第一次抓取里没有留下响应体，后来按公开 URL 补进 `ui-modules/`。
