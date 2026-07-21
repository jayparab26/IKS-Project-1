# Acoustic Signal Analysis & Harmonic Ratio Study (IKS Project)

An interactive web application designed to analyze acoustic signals and evaluate pitch overtones against traditional Indian Knowledge Systems (IKS) tuning ratios (**Just Intonation**) and modern Western scale tuning (**Equal Temperament / 12-TET**).

The application features live time-domain waveform rendering, Fast Fourier Transform (FFT) frequency spectrum visualization, and harmonic ratio comparison across pre-loaded instruments.

Project Github link:- https://jayparab26.github.io/IKS-Project-1/

---

## 🛠️ Project Structure

```text
IKS-Project-2/
├── index.html       # Primary UI & application layout
├── style.css        # Dashboard layout and visual styling
├── script.js       # Web Audio API pipeline, FFT processing, and Canvas rendering
├── logic.js        # Additional acoustic analysis helper functions
├── Templebell.jpg   # Display image for Temple Bell (Ghanta)
├── Templebell.mp3   # Audio sample for Temple Bell
├── shell.jpg        # Display image for Shankha / Conch
├── shell.mp3        # Audio sample for Shankha / Conch
├── tanpura.jpg      # Display image for Tanpura
└── tanpura.mp3      # Audio sample for Tanpura / Base Sa
```

✨ Features & Functionality
Preset Sound Selection: Switch seamlessly between acoustic sources (Temple Bell / Ghanta, Shankha / Conch, and Tanpura / Base Sa) via the dropdown menu.
Real-time Web Audio API Pipeline:Time-Domain Waveform $x(t)$: Visualized dynamically using HTML5 Canvas.
Frequency Spectrum $X(f)$: Real-time FFT frequency spectrum analysis.
Harmonic & Ratio Analysis Table:Automatically calculates theoretical pitch intervals for Base Pitch ($Sa$), Perfect Fifth ($Pa$), and Octave ($Taar\ Sa$).
Compares Just Intonation (JI) natural integer ratios ($1:1$, $3:2$, $2:1$) with Equal Temperament (12-TET) values against the observed signal frequencies.
Highlights the inharmonic overtone behavior of metallic bell instruments compared to harmonic string drones.
