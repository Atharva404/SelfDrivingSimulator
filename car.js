class Car {
    constructor(x, y, width, height, controlType, maxSpeed=4) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed=maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
        }
        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyInteresect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polyInteresect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height)/2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad, 
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad, 
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI + this.angle-alpha)*rad, 
            y:this.y-Math.cos(Math.PI + this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI + this.angle+alpha)*rad, 
            y:this.y-Math.cos(Math.PI + this.angle+alpha)*rad
        });
        return points;
    }

    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }
        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;

            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }
        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
    draw(ctx, color) {
        if (this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();
        if (this.sensor) {
            this.sensor.draw(ctx);
        }
    }
}
function getInteresection(A, B, C, D) {
    const tTop = (D.x-C.x) * (A.y-C.y)-(D.y-C.y) * (A.x-C.x);
    const uTop = (C.y-A.y) * (A.x-B.x)-(C.x-A.x) * (A.y-B.y);
    const bottom = (D.y-C.y) * (B.x-A.x)-(D.x-C.x) * (B.y-A.y);

    if (bottom !=0) {
        const t =tTop/bottom;
        const u=uTop/bottom;
        if (t>=0 && t <=1 && u>=0 &&u<=1) {
            return {
                x:lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            }
        }
    }
    return null;
}

function polyInteresect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            const touch = getInteresection(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if (touch) {
                return true;
            }
        }
    }
    return false;
}