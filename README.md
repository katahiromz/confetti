# confetti

## 概要

JavaScriptで紙吹雪のアニメーションを描きます。

<img src="img/screenshot.png" alt="[スクリーンショット]" />

紙吹雪の紙をDOMの`<div>`要素として追加し、追加・移動・削除を繰り返します。


## コード

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>confetti</title>
    <style>
        body {
            position: absolute;
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: #ffffcc;
        }
        .confetti-piece {
            position: absolute;
            width: 15px; height: 5px; /* 短冊みたいな */
            pointer-events: none;
            will-change: transform; /* パフォーマンス向上 */
        }
    </style>
</head>
<body>
    <h1 style="text-align: center;">紙吹雪</h1>

    <script>
        let confettiData = [];
        // 紙吹雪の最大数を制限（多すぎるとDOM操作が重くなるため）
        const confettiCount = 100;
        const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffeb3b', '#e91e63'];

        // パフォーマンス向上のため、Date()ではなくperformance.now()を使用
        let lastTimestamp = performance.now();

        // 紙吹雪を描画する
        const drawConfetti = (currentTimestamp) => {
            // 前回のフレームからの経過時間を計算（ミリ秒）
            const diffTime = currentTimestamp - lastTimestamp;
            lastTimestamp = currentTimestamp;

            // 1. 紙吹雪の生成
            if (confettiData.length < confettiCount && Math.random() < 0.6) {
                const div = document.createElement('div');
                div.className = 'confetti-piece';
                div.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];

                document.body.insertBefore(div, document.body.children[0]);

                confettiData.push({
                    div: div,
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    time: Math.random() * 100, // 開始時間をバラけさせる
                    speed: 2 + Math.random() * 2 // 個別に速度を持たせる
                });
            }

            // 2. 紙吹雪の移動と削除。要素の削除に備えて逆順に走査する
            for (let i = confettiData.length - 1; i >= 0; i--) {
                const item = confettiData[i];

                // 経過時間に基づいた更新
                item.time += diffTime * 0.005;
                item.y += item.speed;
                item.x += 2 + Math.sin(item.time) * 1; // 左右の揺れ

                // 画面外（下）に出たら削除
                if (item.y > window.innerHeight) {
                    item.div.remove(); // モダンな削除方法
                    confettiData.splice(i, 1);
                    continue;
                }

                // 右端に来たら左端に移動
                if (item.x > window.innerWidth - 15) {
                    item.x = 0;
                }

                // 表示位置と回転の更新
                // transformにまとめることで描画負荷を軽減
                const rotate = item.time * 20;
                const scaleY = Math.sin(item.time);
                item.div.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${rotate}deg) scaleY(${scaleY})`;
            }
        };

        const render = (timestamp) => {
            drawConfetti(timestamp);
            window.requestAnimationFrame(render);
        };

        // アニメーション開始
        window.requestAnimationFrame(render);
    </script>
</body>
</html>
```

この紙吹雪をクラス化すると次のようになる：

```js
class Confetti {
    constructor(options = {}) {
        // デフォルト設定
        this.count = options.count || 100;
        this.colors = options.colors || ['#ff0000', '#00ff00', '#0000ff', '#ffeb3b', '#e91e63'];
        this.container = options.container || document.body;

        this.data = [];
        this.lastTimestamp = performance.now();
        this.isRunning = false;
        this.animationId = null;
    }

    // 紙吹雪を1つ生成
    _createPiece() {
        const div = document.createElement('div');
        div.className = 'confetti-piece';
        div.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.container.appendChild(div);
        this.container.insertBefore(div, this.container.children[0]);

        return {
            div: div,
            x: Math.random() * window.innerWidth,
            y: -20,
            time: Math.random() * 100,
            speed: 2 + Math.random() * 2
        };
    }

    // 更新処理
    _update(currentTimestamp) {
        if (!this.isRunning) return;

        const diffTime = currentTimestamp - this.lastTimestamp;
        this.lastTimestamp = currentTimestamp;

        // 生成
        if (this.data.length < this.count && Math.random() < 0.6) {
            this.data.push(this._createPiece());
        }

        // 移動と削除
        for (let i = this.data.length - 1; i >= 0; i--) {
            const item = this.data[i];
            item.time += diffTime * 0.005;
            item.y += item.speed;
            item.x += 2 + Math.sin(item.time) * 1;

            // 画面外（下）に出たら削除
            if (item.y > window.innerHeight) {
                item.div.remove();
                this.data.splice(i, 1);
                continue;
            }

            // 右端から左端へ
            if (item.x > window.innerWidth) {
                item.x = -15;
            }

            const rotate = item.time * 20;
            const scaleY = Math.sin(item.time);
            item.div.style.transform = `translate3d(${item.x}px, ${item.y}px, 0) rotate(${rotate}deg) scaleY(${scaleY})`;
        }

        this.animationId = requestAnimationFrame((ts) => this._update(ts));
    }

    // 開始
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.animationId = requestAnimationFrame((ts) => this._update(ts));
    }

    // 停止
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    // 全削除
    clear() {
        this.stop();
        this.data.forEach(item => item.div.remove());
        this.data = [];
    }
}
```
