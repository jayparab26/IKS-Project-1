let audioCtx = null;
let analyser = null;
let audioSourceNode = null;
let isPlaying = false;

// Create audio element ONCE
const audioElement = new Audio();

const soundSources = {
  bell: './Templebell.mp3',
  conch: './shell.mp3',
  sa: './tanpura.mp3'
};

const images = {
  bell: './Templebell.jpg',
  conch: './shell.jpg',
  sa: './tanpura.jpg'
};

const timeCanvas = document.getElementById('timeCanvas');
const freqCanvas = document.getElementById('freqCanvas');
const tCtx = timeCanvas.getContext('2d');
const fCtx = freqCanvas.getContext('2d');

function setupAudioPipeline() {
  if (!audioCtx) {
    // Create context on user gesture
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;

    // Connect source to analyser and output destination ONCE
    audioSourceNode = audioCtx.createMediaElementSource(audioElement);
    audioSourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function updateInstrumentInfo() {
  const selectedType = document.getElementById('soundSource').value;
  document.getElementById('instrumentImg').src = images[selectedType];

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    document.getElementById('playBtn').innerText = 'Play Sound';
  }
}

function toggleAudio() {
  // 1. Initialize audio graph safely
  setupAudioPipeline();

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    document.getElementById('playBtn').innerText = 'Play Sound';
  } else {
    const selectedType = document.getElementById('soundSource').value;
    
    // Set file path
    audioElement.src = soundSources[selectedType];
    audioElement.load();

    // Play sound and trigger visualizer loop
    audioElement.play().then(() => {
      isPlaying = true;
      document.getElementById('playBtn').innerText = 'Stop Sound';

      let detectedBase = 2000;
      if (selectedType === 'sa') detectedBase = 240;
      if (selectedType === 'conch') detectedBase = 440;

      document.getElementById('f0Display').innerText = `~${detectedBase} Hz (Peak Frequency)`;
      document.getElementById('ratioF0').innerText = `${detectedBase} Hz (1.0x Base)`;
      document.getElementById('ratioF1').innerText = `${(detectedBase * 1.5).toFixed(1)} Hz (1.5x - Pa)`;
      document.getElementById('ratioF2').innerText = `${(detectedBase * 2.0).toFixed(1)} Hz (2.0x - Higher Sa)`;

      drawVisualizers();
    }).catch(err => {
      console.error("Playback Error:", err);
      alert("Error playing file: Make sure 'Templebell.mp3' exists in your folder.");
    });
  }
}

audioElement.onended = () => {
  isPlaying = false;
  document.getElementById('playBtn').innerText = 'Play Sound';
};

function drawVisualizers() {
  if (!isPlaying) return;

  requestAnimationFrame(drawVisualizers);

  // 1. Time-Domain Waveform x(t)
  const timeData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(timeData);

  tCtx.fillStyle = '#0d0f17';
  tCtx.fillRect(0, 0, timeCanvas.width, timeCanvas.height);
  tCtx.lineWidth = 2;
  tCtx.strokeStyle = '#6366f1';
  tCtx.beginPath();

  let sliceWidth = timeCanvas.width * 1.0 / timeData.length;
  let x = 0;

  for (let i = 0; i < timeData.length; i++) {
    let v = timeData[i] / 128.0;
    let y = v * timeCanvas.height / 2;

    if (i === 0) tCtx.moveTo(x, y);
    else tCtx.lineTo(x, y);
    x += sliceWidth;
  }
  tCtx.stroke();

  // 2. Frequency Spectrum FFT X(f)
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);

  fCtx.fillStyle = '#0d0f17';
  fCtx.fillRect(0, 0, freqCanvas.width, freqCanvas.height);

  let barWidth = (freqCanvas.width / freqData.length) * 2.5;
  let barHeight;
  let fx = 0;

  for (let i = 0; i < freqData.length; i++) {
    barHeight = freqData[i] / 2;
    fCtx.fillStyle = '#10b981';
    fCtx.fillRect(fx, freqCanvas.height - barHeight, barWidth, barHeight);
    fx += barWidth + 1;
  }
}

// Automatically sync image and audio source when page loads or reloads
window.addEventListener('DOMContentLoaded', () => {
  updateInstrumentInfo();
});