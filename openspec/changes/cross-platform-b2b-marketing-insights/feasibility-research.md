# 初步平台可行性研究

## 審查範圍與狀態

本文件整理截至 2026-11-10 可取得的公開官方文件，作為 Task 1.1 的初步桌面研究。這不是關卡一核准紀錄，也沒有使用任何客戶帳戶、API 憑證或平台沙箱。以下「可行」僅代表公開文件顯示存在相關 API 能力，不代表本產品已取得存取權或欄位足以支持核定指標。

## 逐平台可行性矩陣

| 來源 | 權限與申請 | 公開可確認欄位／能力 | 歷史與更新限制 | 成本 | 初步判定與待確認事項 |
| --- | --- | --- | --- | --- | --- |
| Amazon Ads | 需註冊應用並經 Amazon 審核；直接廣告主和第三方應用走不同申請途徑。 | Ads API 支援廣告管理與報告；產品包含 Sponsored Ads、Amazon Marketing Cloud、Marketing Stream 等。實際報表欄位須依廣告產品、區域及帳戶權限逐項核對。 | 公開總覽未確認本需求的歷史回溯期間、各報表更新延遲、速率限制或所需欄位組合；須在獲准帳戶下核驗。 | Amazon 說明 API 本身無額外費用；廣告活動費及標準賣家帳戶費仍適用。第三方開發和維運成本未計。 | **有條件可行。** 須確認目標市場/廣告產品、申請主體、帳戶授權、訪問/訂單/新客欄位、報表延遲及歷史範圍。 |
| Alibaba | 「Alibaba」尚未具體指明 Alibaba.com（國際站）、1688、淘寶/天貓或其他服務。Alibaba.com Open Platform 要求開發者註冊、應用審核/API 權限申請，並需賣家授權。 | Alibaba.com Open Platform 公開文件顯示電商業務 API；文件列出商品、訂單等相關能力，但未能確認符合本案所需的廣告支出、訪問、訂單歸因及新增不重複客戶欄位。 | 目標 API 的歷史回溯、更新頻率、呼叫限制及市場/帳戶適用性均未核實。 | API 可能免費或收費，依 API 類型及呼叫方式而異；正式費率需查目標 API 清單或詢價。 | **未定。** 先確認具體 Alibaba 產品、國家/站點和廣告服務，再向該產品文件/帳戶核驗數據欄位、權限、限制及費率。 |
| 品牌官網 | 官網分析/廣告資料來源未指定。若採 GA4，需客戶提供 GA4 Property 授權及可用服務帳戶/OAuth 權限；若用 Shopify、其他電商平台或廣告服務，權限流程不同。 | Google Analytics Data API 可按日期範圍查詢報表，提供 sessions、transactions、newUsers、advertiserAdCost 等指標；新客定義為首次互動用戶，並不等於跨平台新增不重複客戶。purchase/轉換和廣告成本依追蹤設定、匯入/連結來源而定。 | GA4 公開文件說明報表受處理及彙總影響；具體回溯、資料保留、延遲、API 配額取決於屬性/方案與查詢方式，尚未針對客戶屬性核驗。 | 本次公開文件未核定 API/方案/資料倉儲費用；需核實 GA4 屬性方案、BigQuery 等額外選項及實際使用成本。 | **技術上有條件可行。** 須指定官網分析系統、檢查事件標記/電商追蹤、歸因設定、廣告成本來源和客戶端隱私設定。 |

## 關卡一待決事項

1. 業務負責人確認 Alibaba 的確切產品/站點與「品牌官網」的分析及廣告資料來源。
2. 各平台帳戶管理者提供可核驗的測試帳戶/授權及所需 API 權限，由平台負責人實測欄位、歷史範圍、更新延遲、呼叫限制和商用條款/費率。
3. 研究負責人核准資料字典及 CVR/CAC 的歸因、跨平台去重和資料品質規則；此項亦是 Task 1.2 的輸入。
4. 財務/產品/安全負責人確認商用成本、資料處理限制和資源安排，並留下關卡一決議。

上述決議尚未提供，因此此文件不能作為關卡一通過證據，亦不足以放行 Task 2 的產品建置。

## 使用者授權的 Mock Data 原型範圍（2026-11-10）

使用者明確允許「使用暫定指標定義的 Mock Data 原型」，因此可建立展示與互動驗證用的靜態原型。這項授權只放行合成資料原型，不改變本文件所列平台/API 可行性未核實的狀態，也不核准 Task 1.2 的 SAP/正式資料字典或 Task 1.4 的目標使用者建議規則。不得連接真實平台、匯入客戶資料、將示意建議用於預算決策，或據此放行 5 家探索/正式研究。正式研究仍須先完成 Task 1.2、1.4，並依 Task 4.2、4.3 的研究治理關卡辦理。

## 來源

- Amazon Ads API 概覽、申請與 API 費用 FAQ：https://advertising.amazon.com/en-gb/about-api
- Alibaba.com Open Platform 入門文件：https://openapi.alibaba.com/doc/doc.htm
- Alibaba.com API Reference：https://openapi.alibaba.com/doc/api.htm
- Alibaba.com API Use Agreement（API 權限、免費/收費 API、數據處理責任）：https://terms.alicdn.com/legal-agreement/terms/suit_bu1_b2b/suit_bu1_b2b201911081026_96467.html
- Google Analytics Data API 報表入門：https://developers.google.com/analytics/devguides/reporting/data/v1/basics
- Google Analytics Data API 維度與指標：https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
- Google Analytics 報表資料預期與處理說明：https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations
