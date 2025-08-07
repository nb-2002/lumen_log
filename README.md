# 目的と範囲

ルーメンログ（LumenLog）は、IoTセンサーのハードウェア、データ処理パイプライン、ウェブベースの可視化機能を組み合わせ、時間の経過とともに周囲の光の照度レベルをリアルタイムで観察するシステムです。
このシステムは照明の状態変化を自動的に検出し、グラフィカルな表示とコマンドラインインターフェースの両方を通じて履歴分析を提供します。

この文書は、システム全体のアーキテクチャ、データフローのパターン、主要なコンポーネントの概要を示しています。
特定のサブシステムの詳細な実装については、以下のリンクを参照してください。

- IoTセンサーのハードウェア：[IoT Sensor Hardware](placeholder) (TODO)

- データ処理パイプライン：[Data Processing Pipeline](placeholder) (TODO)

- Firebaseバックエンドサービス：[Firebase Backend Services](placeholder) (TODO)

# システムアーキテクチャの概要

ルーメンログシステムは、データ収集、処理、保存、表示の各層が明確に分かれている、典型的なIoTアーキテクチャのパターンに従っています。

## コンポーネントアーキテクチャ
<img width="1305" height="935" alt="image" src="https://github.com/user-attachments/assets/fde48675-04b5-4288-a2d2-07861f639c2c" />

## データフローのアーキテクチャ
<img width="916" height="931" alt="image" src="https://github.com/user-attachments/assets/f98de3f5-4275-4a41-bfc3-8aae5904ba5f" />

# 主要コンポーネントのマッピング
## ハードウェアからコードへのエンティティマッピング

| ハードウェアコンポーネント | コードエンティティ | 機能/目的 |
|:----------------------|:----------------|:---------|
| M5Atom ESP32 | M5.begin(), client.loop() | デバイスの初期化とMQTT接続管理 |
| BH1750センサー | lightMeter.readLightLevel() | I2Cによる照度測定 |
| WiFiモジュール | setupWifi(), WiFi.begin() | ネットワーク接続 |
| タイマインタラプト | tickerMeasure.attach_ms(1000) | 1秒ごとの測定間隔 |

## データ処理エンティティマッピング

| 処理段階 | NODE-RED関数 | FIREBASEパス | 目的  |
|:-------|:-------------|:------------|:----|
| 生データの保存 | setFormat | /lux | 時系列センサーデータ |
| イベント検出 | analyze | /stat | 照明のオン/オフ状態変化 |
| データ保持 | trim | /lux | 最大500エントリの保持 |

## フロントエンドエンティティマッピング

| UIコンポーネント | JAVASCRIPT関数 | FIREBASEリファレンス| 目的 |
|:--|:--|:--|:--|
| メイングラフ | graphFun() | ref('lux') | リアルタイム可視化 |
| コマンド入力 | com() | refStat | 履歴クエリ |
| テーマトグル | 自動切り替えロジック | 照度しきい値 | 動的UI適応 |
| 履歴表示 | getInfo(), getTotal() | refStat.once('value') | 統計分析 |

# テクノロジースタックの概要

## 通信プロトコル
- MQTT: atom01/luxトピックでの軽量メッセージ公開
- WebSocket: Firebaseリアルタイムデータベースの同期
- I2C: ハードウェアセンサーの通信プロトコル
## データ保存スキーマ
- Firebaseパス /lux: {timestamp: lux_value} のキーと値のペア
- Firebaseパス /stat: {timestamp: "open"|"close"} の状態変化
- 保持ポリシー: 最新の500エントリに自動的にトリム

## 主要なしきい値と定数
- 照度しきい値: 50ルクス (analyze関数とフロントエンドで定義)
- 測定間隔: 1000ミリ秒 (tickerMeasure.attach_ms()で定義)
- データ保持: 最大500エントリ (trim関数で定義)
- グラフ表示範囲: 過去10分
