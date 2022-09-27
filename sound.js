import { hslToRgb } from "./utils";

const WIDTH = 2500;
const HEIGHT = 1000;

const canvas = document.querySelector('canvas');

const ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;
let analyzer;
let bufferLength;

async function getAudio(){
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    const audioCtx = new AudioContext();
    analyzer = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyzer);
    analyzer.fftSize = 2 ** 6;
    bufferLength = analyzer.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);
    drawTimeData(timeData);
    drawFrequency(frequencyData);
}

function drawTimeData(timeData){
    analyzer.getByteTimeDomainData(timeData);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#b7c3f3';
    ctx.beginPath();
    const sliceWidth = WIDTH / bufferLength;
    let x = 0;
    timeData.forEach((data, i) => {
        const v = data / 128;
        const y = (v * HEIGHT) / 2;
    if (i === 0){
        ctx.moveTo(x, y);
    }else{
        ctx.lineTo(x, y);
    }
    x += sliceWidth;
    });

    ctx.stroke();
    requestAnimationFrame(() => drawTimeData(timeData));
}

function drawFrequency(frequencyData){
    analyzer.getByteFrequencyData(frequencyData);
    const barWidth = (WIDTH / bufferLength) * 2;
    let x = 0;
    frequencyData.forEach(amount => {
        const percent = amount / 255;
        const [h, s, l] = [30 / (percent * 360) - 0.5, 0.4, 0.5];
        const barHeight = (HEIGHT * percent) / 2;
        const [r, g, b] = hslToRgb(h, s, l);
        ctx.fillStyle = `rgb(${r},${g},${b}, 0.7)`;
        ctx.fillRect(
            x,
            HEIGHT - barHeight,
            barWidth,
            barHeight
        );
        x += barWidth + 1;
    });

    requestAnimationFrame(() => drawFrequency(frequencyData));
    
}

getAudio();

//adding changes to commit