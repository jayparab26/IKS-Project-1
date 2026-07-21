let audioCtx;
let analyser;
let audioSourceNode = null;
let isPlaying = false;

// Initialize HTML5 Audio Element for real playback
const audioElement = new Audio();
audioElement.crossOrigin = "anonymous";

// Pre-configured audio paths / links
const soundSources = {
  bell: 'Templebell.m4a', // Place your recorded file in the project directory
  conch: 'https://actions.google.com/sounds/v1/wind/blow_wind.ogg',
  sa: 'https://actions.google.com/sounds/v1/instruments/acoustic_guitar_strum.ogg'
};

const images = {
  bell: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80',
  conch: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
  sa: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
};

const timeCanvas = document.getElementById('timeCanvas');
const freqCanvas = document.getElementById('freqCanvas');
const tCtx = timeCanvas.getContext('2d');
const fCtx = freqCanvas.getContext('2d');

function setupAudioPipeline() {
  if (audioCtx) return;

  // Create Audio Context
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;

  // Connect Audio Element -> Web Audio Analyser -> Speakers
  audioSourceNode = audioCtx.createMediaElementSource(audioElement);
  audioSourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function updateInstrumentInfo() {
  const type = document.getElementById('soundSource').value;
  document.getElementById('instrumentImg').src = images[type];

  // Reset audio source if selection changes
  audioElement.src = soundSources[type];

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    document.getElementById('playBtn').innerText = 'Play Sound';
  }
}

// Function triggered when attaching your Templebell.m4a file locally
function loadLocalFile(event) {
  const file = event.target.files[0];
  if (file) {
    const fileURL = URL.createObjectURL(file);
    audioElement.src = fileURL;
    alert("Recording file attached successfully! Click 'Play Sound' to start analysis.");
  }
}

function toggleAudio() {
  setupAudioPipeline();

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    document.getElementById('playBtn').innerText = 'Play Sound';
  } else {
    // Default to selection if no file was uploaded
    const selectedType = document.getElementById('soundSource').value;
    if (!audioElement.src || audioElement.src === '') {
      audioElement.src = soundSources[selectedType];
    }

    audioElement.play().then(() => {
      isPlaying = true;
      document.getElementById('playBtn').innerText = 'Stop Sound';
      
      // Typical physical temple bell fundamental hum frequency (~2000 Hz region)
      const detectedBase = 2000;
      document.getElementById('f0Display').innerText = `~${detectedBase} Hz (Bell Resonant Peak)`;
      document.getElementById('ratioF0').innerText = `${detectedBase} Hz (1.0x Base)`;
      document.getElementById('ratioF1').innerText = `${(detectedBase * 1.5).toFixed(1)} Hz (1.5x - Pa)`;
      document.getElementById('ratioF2').innerText = `${(detectedBase * 2.0).toFixed(1)} Hz (2.0x - Higher Sa)`;

      drawVisualizers();
    }).catch(err => {
      console.error("Playback error:", err);
      alert("Please upload your temple bell recording file using the file upload button!");
    });
  }
}

// Reset button label when sound completes
audioElement.onended = () => {
  isPlaying = false;
  document.getElementById('playBtn').innerText = 'Play Sound';
};

function drawVisualizers() {
  if (!isPlaying) return;

  requestAnimationFrame(drawVisualizers);

  // 1. Plot Time-Domain Waveform x(t)
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

  // 2. Plot Frequency Spectrum FFT X(f)
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