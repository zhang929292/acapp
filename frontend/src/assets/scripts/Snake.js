import { AcGameObject } from './AcGameObject';
import { Cell } from './Cell';

export class Snake extends AcGameObject {
    constructor(ctx, gamemap) {
        super();
        this.ctx = ctx;
        this.gamemap = gamemap;

        this.cells = [];
        this.color = "#4876EC";
        this.dirs = [
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: -1, y: 0},
        ];
        this.direction = 2;
        this.eps = 1e-1;
        this.speed = 7;  // 每秒钟走几格
        this.apple_cell = new Cell(-1, -1);
        this.apple_img = new Image();
        this.apple_img.src = "https://app2468.acapp.acwing.com.cn/static/images/apple.png";
        this.eating = false;
        this.tail_cell = null;
    }

    start() {
        this.cells.push(new Cell(4, 7));
        for (let i = 4; i >= 1; i -- ) {
            this.cells.push(new Cell(i, 7));
        }

        this.put_an_apple();
    }

    put_an_apple() {
        const positions = new Set();
        for (let i = 0; i < 17; i ++ ) {
            for (let j = 0; j < 15; j ++ ) {
                positions.add(`${i}-${j}`);
            }
        }

        for (let cell of this.cells) {
            positions.delete(`${cell.i}-${cell.j}`);
        }

        const items = Array.from(positions);
        if (items.length === 0) this.gamemap.win();
        else {
            let [x, y] = items[Math.floor(Math.random() * items.length)].split('-');
            x = parseInt(x), y = parseInt(y);
            this.apple_cell = new Cell(x, y);
        }
    }

    get_direction(a, b) {
        if (Math.abs(a.x - b.x) < this.eps && Math.abs(a.y - b.y) < this.eps)
            return -1;
        if (Math.abs(a.x - b.x) < this.eps) {
            if (b.y < a.y) return 0;
            return 2;
        }
        if (b.x > a.x) return 1;
        return 3;
    }

    check_die() {
        const head = this.cells[0];
        if (head.i < 0 || head.i >= 17 || head.j < 0 || head.j >= 15)
            return true;
        
        for (let i = 2; i < this.cells.length; i ++ ) {
            if (head.i === this.cells[i].i && head.j === this.cells[i].j) {
                return true;
            }
        }

        return false;
    }

    update_body() {
        const k = this.cells.length - 1;
        const d = this.get_direction(this.cells[k], this.cells[k - 1]);
        if (d >= 0) {
            const distance = this.speed * this.timedelta / 1000;
            this.cells[k].x += this.dirs[d].x * distance;
            this.cells[k].y += this.dirs[d].y * distance;
            this.cells[0].x += this.dirs[this.direction].x * distance;
            this.cells[0].y += this.dirs[this.direction].y * distance;
        } else {
            const new_cells = [];
            const headi = this.cells[1].i + this.dirs[this.direction].x;
            const headj = this.cells[1].j + this.dirs[this.direction].y;
            new_cells.push(new Cell(headi, headj));
            new_cells.push(new Cell(headi, headj));
            for (let i = 1; i < k; i ++ ) {
                new_cells.push(this.cells[i]);
            }
            this.cells = new_cells;

            if (this.eating) {
                this.cells.push(this.tail_cell);
                this.eating = false;
                this.tail_cell = null;
            }

            const ds = this.gamemap.directions;
            while (ds.length > 0 && (ds[0] === this.direction || ds[0] === (this.direction ^ 2)))
                ds.splice(0, 1);
            
            if (ds.length > 0) {
                this.direction = ds[0];
                ds.splice(0, 1);
            }

            if (this.check_die()) {
                this.gamemap.lose();
            }

            if (headi === this.apple_cell.i && headj === this.apple_cell.j) {
                this.eating = true;
                const cell = this.cells[this.cells.length - 1];
                this.tail_cell = new Cell(cell.i, cell.j);
                this.put_an_apple();
                const score = this.gamemap.store.state.score + 1;
                this.gamemap.store.commit('updateScore', score);
                this.gamemap.store.commit('updateRecord', score);
            }
        }
    }

    update() {
        if (this.gamemap.status === "playing") {
            this.update_body();
        }
        this.render();
    }

    render() {
        const L = this.gamemap.L;

        if (this.eating) {
            this.cells.push(this.tail_cell);
        }

        this.ctx.drawImage(this.apple_img, this.apple_cell.i * L, this.apple_cell.j * L, L, L);

        this.ctx.fillStyle = this.color;
        for (let cell of this.cells) {
            this.ctx.beginPath();
            this.ctx.arc(cell.x * L, cell.y * L, L / 2 * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        }

        for (let i = 1; i < this.cells.length; i ++ ) {
            const a = this.cells[i - 1], b = this.cells[i];
            if (Math.abs(a.x - b.x) < this.eps && Math.abs(a.y - b.y) < this.eps) {
                continue;
            }
            if (Math.abs(a.x - b.x) < this.eps) {
                this.ctx.fillRect((a.x - 0.5 + 0.1) * L, Math.min(a.y, b.y) * L, L * 0.8, Math.abs(a.y - b.y) * L);
            } else {
                this.ctx.fillRect(Math.min(a.x, b.x) * L, (a.y - 0.5 + 0.1) * L, Math.abs(a.x - b.x) * L, L * 0.8);
            }
        }

        if (this.eating) {
            this.cells.pop();
        }
    }
}