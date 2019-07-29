const Rr = {
    status: 'stoped',
    map: new Map(),
    ts: new Map(),
    /**
     * 调用它，起搏
     */
    beat() {
        const ______ = this;
        setInterval(function () {
            if (______.status === 'stoped')
                return;
            for (let _ of ______.map.entries()) {
                let v = undefined;
                if (!!(v = ______.ts.get(_[0]))) {
                    const exc = () => {
                        v.c = 0;
                        ______.ts.set(_[0], v);
                        setTimeout(() => {
                            if (_[1]) _[1]({name: _[0]})
                        }, 1)
                    };

                    const add = () => {
                        v.c = v.c + 1;
                        ______.ts.set(_[0], v)
                    };

                    const doEx = _ => {
                        if (_ === v.c) {
                            exc()
                        } else {
                            add()
                        }
                    };

                    if (v.t === 'ms') {
                        doEx(v.x)
                    }

                    if (v.t === 's') {
                        doEx(v.x * 10)
                    }
                }

            }
        }, 99)
    },
    /**
     * 100ms级触发任务
     * @param n 任务编号（推荐英文和下划线和数字）
     * @param x 定时时间（基于100ms的基准时钟信号）
     * @param c 回调执行函数
     */
    runxms(n, x, c) {
        if (typeof n !== 'string') {
            console.error('n 任务编号（推荐英文和下划线和数字）', n);
            return;
        }
        if (typeof x !== 'number') {
            console.error('x 是时间值，必须是数字，如果是浮点，自动格式成int', x);
            return;
        }
        if (typeof c !== 'function') {
            console.error('c 是任务函数', c);
            return;
        }
        x = parseInt(x);
        this.map.set(n, c);
        this.ts.set(n, {t: 'ms', x: x, c: 0});
        this.status = 'running'
    },
    /**
     * 秒级触发任务
     * @param n 名称编号（推荐英文和下划线和数字）
     * @param x 定时时间（基于100ms的基准时钟信号）
     * @param c 回调执行函数
     */
    runxs(n, x, c) {
        if (typeof n !== 'string') {
            console.error('n 任务编号（推荐英文和下划线和数字）', n);
            return;
        }
        if (typeof x !== 'number') {
            console.error('x 是时间值，必须是数字，如果是浮点，自动格式成int', x);
            return;
        }
        if (typeof c !== 'function') {
            console.error('c 是任务函数', c);
            return;
        }
        x = parseInt(x);
        this.map.set(n, c);
        this.ts.set(n, {t: 's', x: x, c: 0});
        this.status = 'running'
    }
};

Rr.beat();