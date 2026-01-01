// confetti.js --- 紙吹雪
// Author: katahiromz
// License: MIT
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
