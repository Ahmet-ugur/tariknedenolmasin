// nedenolmasin.html dosyasından taşınan JavaScript kodları

// --- Geri Sayım ---
const targetDate =
  new Date("2025-08-27T17:30:00").getTime() + 364 * 24 * 60 * 60 * 1000;
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date().getTime();
  let diff = targetDate - now;
  if (diff < 0) diff = 0;

  const sec = Math.floor(diff / 1000);
  const d = Math.floor(sec / (24 * 3600));
  const h = Math.floor((sec % (24 * 3600)) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  daysEl.textContent = d;
  hoursEl.textContent = String(h).padStart(2, "0");
  minutesEl.textContent = String(m).padStart(2, "0");
  secondsEl.textContent = String(s).padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- Harita ve Rota ---
const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
}).setView([37.5, 35], 7);

// Daha güzel harita stili
L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  }
).addTo(map);

// Gaziantep'ten Konya Ereğli'ye rota
const start = L.latLng(37.0662, 37.3833); // Gaziantep
const end = L.latLng(37.5326, 33.5176); // Konya Ereğli

// Başlangıç ve bitiş noktaları için güzel ikonlar
const startIcon = L.divIcon({
  className: "start-marker",
  html: `<div style="background: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
});

const endIcon = L.divIcon({
  className: "end-marker",
  html: `<div style="background: #FF5722; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
});

// Başlangıç ve bitiş noktalarını ekle
L.marker(start, { icon: startIcon })
  .addTo(map)
  .bindPopup("🚗 <b>Gaziantep</b><br>Yolculuk başlangıcı");
L.marker(end, { icon: endIcon })
  .addTo(map)
  .bindPopup("🏁 <b>Konya Ereğli</b><br>Hedef nokta");

// Rota kontrolü
const routeControl = L.Routing.control({
  waypoints: [start, end],
  lineOptions: {
    styles: [
      {
        color: "#ff1493",
        weight: 6,
        opacity: 0.8,
      },
    ],
  },
  addWaypoints: false,
  draggableWaypoints: false,
  fitSelectedRoutes: true,
  createMarker: () => null,
  show: false,
  routeWhileDragging: false,
}).addTo(map);

// Araba animasyonu için güzel SVG ikon
const carIcon = L.divIcon({
  className: "car-icon",
  html: `<svg width="40" height="24" viewBox="0 0 64 32" style="filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));">
  <defs>
    <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff1493;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff69b4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="4" y="12" width="56" height="16" rx="8" fill="url(#carGradient)" stroke="#fff" stroke-width="2"/>
  <rect x="8" y="8" width="48" height="8" rx="4" fill="url(#carGradient)" stroke="#fff" stroke-width="1"/>
  <circle cx="16" cy="28" r="6" fill="#333" stroke="#fff" stroke-width="2"/>
  <circle cx="48" cy="28" r="6" fill="#333" stroke="#fff" stroke-width="2"/>
  <circle cx="16" cy="28" r="3" fill="#fff"/>
  <circle cx="48" cy="28" r="3" fill="#fff"/>
  <rect x="20" y="14" width="24" height="6" rx="2" fill="rgba(255,255,255,0.3)"/>
</svg>`,
  iconSize: [40, 24],
});

const carMarker = L.marker(start, { icon: carIcon }).addTo(map);
let routeCoords = [];
let currentIndex = 0;

routeControl.on("routesfound", function (e) {
  routeCoords = e.routes[0].coordinates;
  currentIndex = 0;
});

// Araba animasyonu
function animateCar() {
  if (routeCoords.length > 0) {
    currentIndex = (currentIndex + 1) % routeCoords.length;
    carMarker.setLatLng(routeCoords[currentIndex]);
  }
  requestAnimationFrame(animateCar);
}

// Rota yüklendikten sonra animasyonu başlat
setTimeout(() => {
  animateCar();
}, 2000);

// Harita yüklendiğinde rota çizimini tetikle
map.whenReady(() => {
  setTimeout(() => {
    routeControl.route();
  }, 1000);
});

// --- Müzik Sistemi ---
const playPauseBtn = document.getElementById("playPauseBtn");
const volumeSlider = document.getElementById("volumeSlider");
const songTitle = document.getElementById("songTitle");
const artist = document.getElementById("artist");

// Tek şarkı - sürekli tekrar
const song = {
  title: "Sensiz Olmaz",
  artist: "Yalın",
  url: "yalin.mp3", // Yerel ses dosyası
};

let isPlaying = false;
let audio = new Audio();

// Müzik çalma fonksiyonu
function playMusic() {
  try {
    // Ses dosyasının yüklenip yüklenmediğini kontrol et
    if (!audio.src || audio.src === "") {
      audio.src = song.url;
    }

    audio.volume = volumeSlider.value / 100;
    audio.loop = true; // Sürekli tekrar

    // Müzik çalmayı dene
    audio
      .play()
      .then(() => {
        isPlaying = true;
        playPauseBtn.textContent = "⏸️";
        playPauseBtn.classList.add("playing");
        songTitle.textContent = song.title;
        artist.textContent = "Çalıyor...";
      })
      .catch((error) => {
        console.log("Müzik çalma hatası:", error.message);

        // Hata türüne göre farklı mesajlar
        if (error.name === "NotAllowedError") {
          artist.textContent = "Tarayıcı izni gerekli";
        } else if (error.name === "NotSupportedError") {
          artist.textContent = "Dosya formatı desteklenmiyor";
        } else if (error.name === "NetworkError") {
          artist.textContent = "Dosya bulunamadı";
        } else {
          artist.textContent = "Tekrar deneyin";
        }

        songTitle.textContent = song.title;
        playPauseBtn.textContent = "🎵";
        playPauseBtn.classList.remove("playing");
        isPlaying = false;
      });
  } catch (error) {
    console.log("Müzik sistemi hatası:", error.message);
    songTitle.textContent = song.title;
    artist.textContent = "Sistem hatası";
    playPauseBtn.textContent = "🎵";
    playPauseBtn.classList.remove("playing");
    isPlaying = false;
  }
}

// Müzik durdurma fonksiyonu
function pauseMusic() {
  // Ses çalmayı durdur
  if (audio.src) {
    audio.pause();
  }

  isPlaying = false;
  playPauseBtn.textContent = "🎵";
  playPauseBtn.classList.remove("playing");
  artist.textContent = "Duraklatıldı";
}

// Play/Pause butonu tıklama
playPauseBtn.addEventListener("click", () => {
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
});

// Ses kontrolü
volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value / 100;
});

// Müzik bittiğinde otomatik olarak tekrar başlat (ekstra güvenlik)
audio.addEventListener("ended", () => {
  if (isPlaying) {
    audio.play();
  }
});

// Sayfa yüklendiğinde şarkı bilgisini göster
window.addEventListener("load", () => {
  songTitle.textContent = song.title;
  artist.textContent = "Başlatmak için tıklayın";
});

// Müzik başlatma sistemi
let musicInitialized = false;

function initializeMusic() {
  if (musicInitialized) return;
  musicInitialized = true;

  // Müzik sistemini hazırla
  audio.src = song.url;
  audio.volume = volumeSlider.value / 100;
  audio.loop = true;

  // Ses dosyasının yüklenmesini bekle
  audio.addEventListener("canplaythrough", () => {
    songTitle.textContent = song.title;
    artist.textContent = "🎵 Müziği başlat";
    playPauseBtn.textContent = "🎵";
  });

  // Ses dosyası yüklenemezse
  audio.addEventListener("error", (e) => {
    console.log("Ses dosyası yüklenemedi:", e);
    songTitle.textContent = song.title;
    artist.textContent = "Dosya yüklenemedi";
    playPauseBtn.textContent = "❌";
  });

  // Kullanıcıya bilgi ver
  songTitle.textContent = song.title;
  artist.textContent = "Yükleniyor...";
  playPauseBtn.textContent = "⏳";
}

// Sayfa yüklendiğinde müzik sistemini hazırla
window.addEventListener("load", () => {
  setTimeout(initializeMusic, 500);
});

// Kullanıcı etkileşimi ile müziği başlat
function startMusicOnInteraction() {
  if (!isPlaying && audio.readyState >= 2) {
    // HAVE_CURRENT_DATA
    playMusic();
  }
  // Event listener'ları temizle
  document.removeEventListener("click", startMusicOnInteraction);
  document.removeEventListener("keydown", startMusicOnInteraction);
  document.removeEventListener("touchstart", startMusicOnInteraction);
}

// Farklı etkileşim türlerini dinle
document.addEventListener("click", startMusicOnInteraction, {
  once: true,
});
document.addEventListener("keydown", startMusicOnInteraction, {
  once: true,
});
document.addEventListener("touchstart", startMusicOnInteraction, {
  once: true,
});

// Ses dosyası durumunu kontrol et
audio.addEventListener("loadstart", () => {
  artist.textContent = "Yükleniyor...";
  playPauseBtn.textContent = "⏳";
});

audio.addEventListener("loadeddata", () => {
  artist.textContent = "🎵 Müziği başlat";
  playPauseBtn.textContent = "🎵";
});
