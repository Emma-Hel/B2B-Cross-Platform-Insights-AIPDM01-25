# Mock Data 原型資料字典（暫定，非研究核准版）

本字典只供使用者授權的展示原型使用。資料為合成資料，映射名稱是示範欄位，並非平台已核實 API 欄位。研究負責人核准 SAP/資料字典前，不得用於正式研究或客戶決策。

## 共通週資料模型

| 欄位 | 型別 | 原型定義 | 品質規則 |
| --- | --- | --- | --- |
| `platform` | string | `amazon_ads`、`alibaba_com`、`brand_site` | 必須有來源標籤 |
| `periodStart`, `periodEnd` | ISO date | 該週起訖日 | 起日不得晚於迄日 |
| `sessions` | integer or null | 示意訪問數 | 缺值不補零；不得為負 |
| `orders` | integer or null | 示意訂單數 | 缺值不補零；不得為負 |
| `adSpend` | number or null | 示意廣告支出（USD） | 缺值不補零；不得為負 |
| `newCustomers` | integer or null | 示意來源平台新客數 | 不代表跨平台不重複客戶；缺值不補零 |
| `source` | string | 合成來源欄位/報表名稱 | 必須可追溯至平台映射 |
| `syncStatus` | enum | `success`、`delayed`、`partial`、`failed` | UI 顯示狀態，不嘗試連線 |
| `lastUpdated` | ISO datetime or null | 最近成功同步時間 | 失敗時保留前次時間 |
| `completeness` | enum | `complete`、`partial`、`missing` | 非完整資料不得假裝為完整總計 |
| `comparisonStatus` | enum | `comparable`、`review`、`unverified` | 需同週、同幣別和一致示意口徑 |
| `dedupStatus` | enum | `unverified` | 原型無跨平台識別資料；彙總 CAC 不可用 |

## 示範平台映射（非 API 欄位承諾）

| 平台 | 示範來源 | 共通映射 |
| --- | --- | --- |
| Amazon Ads | Sponsored Ads weekly report（合成） | `sessions` ← 示意 detail-page visits；`orders` ← 示意 attributed orders；`adSpend` ← 示意 spend；`newCustomers` ← 示意 new-to-brand customers |
| Alibaba.com | Open Platform marketing summary（合成） | `sessions` ← 示意 visits；`orders` ← 示意 orders；`adSpend` ← 示意 spend；`newCustomers` ← 示意 new buyers |
| 品牌官網 | GA4 sample report（合成） | `sessions` ← 示意 sessions；`orders` ← 示意 transactions；`adSpend` ← 示意 advertiser ad cost；`newCustomers` ← 示意 new users |

上列平台指標在真實服務中可能有不同定義；本映射只為展示報表與品質提示，不宣稱實際欄位可取得或可比較。

## 暫定計算

- 分平台 CVR = `orders / sessions`，僅在兩欄均有效且大於零時顯示。
- 分平台 CAC = `adSpend / newCustomers`，僅在兩欄均有效且新客數大於零時顯示。
- 跨平台 CVR 僅在三平台資料完整、週期相同、比較狀態均為 `comparable` 且欄位有效時，以總訂單 / 總訪問示意；否則標示不完整或不可比較。
- 跨平台 CAC 固定顯示「不可用：跨平台去重未核准」。不加總來源新客數、不估算不重複人數。

## 合成驗收案例

原型提供正常、部分缺漏、同步失敗三種情境。正常情境驗證分平台計算及完整平台覆蓋；部分缺漏情境驗證缺值保留為未知且停用受影響彙總；同步失敗情境驗證錯誤狀態及最近成功時間仍可檢視。這些情境不構成研究 SAP 或正式驗收樣本。
