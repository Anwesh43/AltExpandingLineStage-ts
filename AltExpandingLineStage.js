var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var AltExpandingLineStage = (function () {
    function AltExpandingLineStage() {
        this.canvas = document.createElement('canvas');
        this.animator = new Animator();
        this.linkedAEL = new LinkedAEL();
        this.initCanvas();
    }
    AltExpandingLineStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    AltExpandingLineStage.prototype.render = function () {
        this.context.fillStyle = '#BDBDBD';
        this.context.fillRect(0, 0, w, h);
        this.linkedAEL.draw(this.context);
    };
    AltExpandingLineStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.linkedAEL.startUpdating(function () {
                console.log("starting animation");
                _this.animator.start(function () {
                    _this.render();
                    _this.linkedAEL.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    AltExpandingLineStage.init = function () {
        var stage = new AltExpandingLineStage();
        stage.render();
        stage.handleTap();
    };
    return AltExpandingLineStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += this.dir * 0.1;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var AELNode = (function () {
    function AELNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    AELNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new AELNode(this.i + 1);
            this.next.prev = this;
        }
    };
    AELNode.prototype.draw = function (context) {
        context.strokeStyle = '#29B6F6';
        context.lineWidth = Math.min(w, h) / 60;
        context.lineCap = 'round';
        var gap = w / nodes;
        var index = this.i % 2;
        var newScale = (1 - index) * this.state.scale + index * (1 - this.state.scale);
        var newGap = function (i) { return (gap / 3) * (1 - 2 * i) * newScale; };
        context.save();
        context.translate(this.i * gap + gap * this.state.scale, h / 2);
        for (var i = 0; i < 2; i++) {
            context.save();
            context.translate(0, newGap(i));
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(gap, 0);
            context.stroke();
            context.restore();
        }
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    AELNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    AELNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    AELNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return AELNode;
})();
var LinkedAEL = (function () {
    function LinkedAEL() {
        this.curr = new AELNode(0);
        this.dir = 1;
    }
    LinkedAEL.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedAEL.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedAEL.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedAEL;
})();
