// Creating the road area on webpage
const canvas = document.getElementById("canvas1");
canvas.width = 200;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width/2, canvas.width * 0.9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50);
car.draw(ctx);

animate();

function animate() {
    car.update();
    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -car.y);

    road.draw(ctx);
    car.draw(ctx);
    //calls animate method over and over again
    ctx.restore();
    requestAnimationFrame(animate);
}