const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");
const radius = canvas.width / 2;
ctx.translate(radius, radius);

function drawClock() {
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);
    
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();

    drawNumbers();
    drawHand(utcHours % 12, 12, radius * 0.5, "hour");
    drawHand(utcMinutes, 60, radius * 0.8, "minute");
    drawHand(utcSeconds, 60, radius * 0.9, "second");
}

function drawNumbers() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const now = new Date();
    const timeString = now.getUTCHours().toString().padStart(2, "0") + 
                       now.getUTCMinutes().toString().padStart(2, "0") + 
                       now.getUTCSeconds().toString().padStart(2, "0");

    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x = Math.cos(angle) * (radius * 0.85);
        const y = Math.sin(angle) * (radius * 0.85);
        ctx.fillText(timeString[i % timeString.length], x, y);
    }
}

function drawHand(value, max, length, type) {
    const angle = ((value / max) * 2 * Math.PI) - Math.PI / 2;
    ctx.font = type === "hour" ? "20px Arial" : "14px Arial";
    ctx.fillStyle = type === "second" ? "red" : "black";
    
    for (let i = 0; i < 3; i++) {
        const x = Math.cos(angle) * (length - i * 15);
        const y = Math.sin(angle) * (length - i * 15);
        ctx.fillText(value.toString().padStart(2, "0")[i % 2], x, y);
    }
}

setInterval(drawClock, 1000);
