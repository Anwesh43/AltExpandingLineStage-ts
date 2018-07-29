const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class AltExpandingLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#BDBDBD'
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : AltExpandingLineStage = new AltExpandingLineStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0

    prevScale : number = 0

    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * 0.1
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 1) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class AELNode {

    next : AELNode

    prev : AELNode

    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new AELNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        context.strokeStyle = '#29B6F6'
        context.lineWidth = Math.min(w, h) / 60
        context.lineCap = 'round'
        const gap = w / nodes
        const index = this.i % 2
        const newScale = (1 - index) * this.state.scale + index * (1 - this.state.scale)
        const newGap = (i) =>  (gap / 3) * (1 - 2 * i) * newScale
        context.save()
        context.translate(this.i * gap, h/2)
        for(var i = 0; i < 2; i++) {
            context.save()
            context.translate(0, newGap(i))
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(gap, 0)
            context.stroke()
            context.restore()
        }
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : AELNode {
        var curr : AELNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}
