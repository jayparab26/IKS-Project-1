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
const tCtx = timeCanvas ? timeCanvas.getContext('2d') : null;
const fCtx = freqCanvas ? freqCanvas.getContext('2d') : null;

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
  const soundSelect = document.getElementById('soundSource');
  const imgElem = document.getElementById('instrumentImg');
  if (!soundSelect || !imgElem) return;

  const selectedType = soundSelect.value;
  imgElem.src = images[selectedType];

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.innerText = 'Play Sound';
  }
}

function toggleAudio() {
  // 1. Initialize audio graph safely
  setupAudioPipeline();

  const playBtn = document.getElementById('playBtn');

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    if (playBtn) playBtn.innerText = 'Play Sound';
  } else {
    const selectedType = document.getElementById('soundSource').value;

    // Set file path
    audioElement.src = soundSources[selectedType];
    audioElement.load();

    // Play sound and trigger visualizer loop
    audioElement.play().then(() => {
      isPlaying = true;
      if (playBtn) playBtn.innerText = 'Stop Sound';

      drawVisualizers();
    }).catch(err => {
      console.error("Playback Error:", err);
      alert("Error playing file: Make sure the .mp3 file exists in your project root.");
    });
  }
}

audioElement.onended = () => {
  isPlaying = false;
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.innerText = 'Play Sound';
};

function drawVisualizers() {
  if (!isPlaying) return;

  requestAnimationFrame(drawVisualizers);

  // --- 1. Get Real Frequency Data from Analyser ---
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqData);

  // --- 2. Dynamic FFT Peak Detection ---
  let maxIndex = 0;
  let maxValue = 0;
  for (let i = 0; i < freqData.length; i++) {
    if (freqData[i] > maxValue) {
      maxValue = freqData[i];
      maxIndex = i;
    }
  }

  // Calculate actual observed frequency in Hz
  const sampleRate = audioCtx.sampleRate;
  const observedHz = (maxIndex * sampleRate / analyser.fftSize);

  // Update dynamic frequency display on screen if active volume is detected
  if (maxValue > 10) {
    const f0Display = document.getElementById('f0Display');
    const ratioF0 = document.getElementById('ratioF0');
    const ratioF1 = document.getElementById('ratioF1');
    const ratioF2 = document.getElementById('ratioF2');

    if (f0Display) f0Display.innerText = `~${observedHz.toFixed(1)} Hz (Observed Peak Frequency)`;
    if (ratioF0) ratioF0.innerText = `${observedHz.toFixed(1)} Hz (1.0x Base)`;
    if (ratioF1) ratioF1.innerText = `${(observedHz * 1.5).toFixed(1)} Hz (1.5x - Pa)`;
    if (ratioF2) ratioF2.innerText = `${(observedHz * 2.0).toFixed(1)} Hz (2.0x - Higher Sa)`;
  }

  // --- 3. Time-Domain Waveform x(t) Rendering ---
  if (tCtx && timeCanvas) {
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
  }

  // --- 4. Frequency Spectrum Canvas Bars Rendering ---
  if (fCtx && freqCanvas) {
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
}

// Automatically sync image and audio source when page loads or reloads
window.addEventListener('DOMContentLoaded', () => {
  updateInstrumentInfo();
});
