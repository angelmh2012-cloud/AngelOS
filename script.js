function actualizarTiempo() {
  const textoTiempo = document.querySelector("#Reloj");
  if (textoTiempo) {
    textoTiempo.textContent = new Date().toLocaleString();
  }
}

actualizarTiempo();
setInterval(actualizarTiempo, 1000);

let zIndex = 20;
const dockList = document.getElementById("dockList");

function createDockItem(appId) {
  const desktopIcon = document.querySelector(`.desktop-icon[data-window="${appId}"]`);
  if (!desktopIcon || !dockList) return null;

  const item = document.createElement("li");
  item.className = "dock-item is-visible";
  item.dataset.window = appId;

  const iconContent = desktopIcon.querySelector(".icon-circle")?.cloneNode(true);
  const appLabel = desktopIcon.querySelector("p")?.textContent?.trim() || appId;

  item.innerHTML = `
    <button class="dock-button" data-window="${appId}" type="button">
      <span class="dock-label">${appLabel}</span>
      <span class="dock-icon"></span>
    </button>
  `;

  item.querySelector(".dock-icon").appendChild(iconContent);
  return item;
}

function ensureDockItem(appId) {
  if (!dockList) return;

  if (dockList.querySelector(`.dock-item[data-window="${appId}"]`)) {
    return;
  }

  const dockItem = createDockItem(appId);
  if (dockItem) {
    dockList.appendChild(dockItem);
  }
}

function openWindow(id) {
  const ventana = document.getElementById(`window-${id}`);
  if (!ventana) return;

  ventana.style.display = "flex";
  ventana.style.left = "50%";
  ventana.style.top = "50%";
  ventana.style.transform = "translate(-50%, -50%)";
  ventana.style.zIndex = String(++zIndex);

  ensureDockItem(id);
}



function closeWindow(id) {
  const ventana = document.getElementById(`window-${id}`);
  if (ventana) {
    ventana.style.display = "none";
  }
}

function makeDraggable(element, handle) {
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  handle.addEventListener("mousedown", startDrag);

  function startDrag(event) {
    if (event.target.closest("button")) return;

    const rect = element.getBoundingClientRect();
    element.style.zIndex = String(++zIndex);
    element.style.transform = "none";
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;

    startX = event.clientX;
    startY = event.clientY;
    startLeft = rect.left;
    startTop = rect.top;

    event.preventDefault();
    document.onmouseup = stopDrag;
    document.onmousemove = dragWindow;
  }

  function dragWindow(event) {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    element.style.left = `${startLeft + deltaX}px`;
    element.style.top = `${startTop + deltaY}px`;
  }

  function stopDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("click", () => openWindow(icon.dataset.window));
});

document.querySelectorAll(".window-close").forEach((button) => {
  button.addEventListener("click", () => closeWindow(button.dataset.window));
});

document.querySelectorAll(".window").forEach((windowElement) => {
  const titleBar = windowElement.querySelector(".window-titlebar");
  if (titleBar) {
    makeDraggable(windowElement, titleBar);
  }
});

const musicPlayerRoot = document.getElementById("musicPlayer");

if (musicPlayerRoot) {
  const audio = document.getElementById("musicAudio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progressBar = document.getElementById("progressBar");
  const currentTimeEl = document.getElementById("currentTime");
  const durationTimeEl = document.getElementById("durationTime");
  const currentTitleEl = document.getElementById("currentTitle");
  const currentArtistEl = document.getElementById("currentArtist");
  const albumArtEl = document.getElementById("albumArt");
  const statusPill = document.getElementById("statusPill");

  const tracks = [
    { title: "Devuélveme a mi chica", artist: "Hombres G", src: "Hombres G - Devuélveme a mi chica.MP3.mp3" },
    { title: "Human", artist: "Rag'n'Bone Man", src: "Rag'n'Bone Man - Human (Official Video).MP3.mp3" },
    { title: "Lose Yourself", artist: "Eminem", src: "Eminem - Lose Yourself.MP3.mp3" },
    { title: "A Man Without Love", artist: "Engelbert Humperdinck", src: "A Man Without Love ❤️ Engelbert Humperdinck 🎤 1968 🌙 Moon Knight.MP3.mp3" },
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses", src: "Guns N' Roses - Sweet Child O' Mine (Official Music Video).MP3.mp3" },
    { title: "19-2000", artist: "Gorillaz", src: "Gorillaz - 19-2000 (Official Video).MP3.mp3" },
    { title: "Do I Wanna Know", artist: "Arctic Monkeys", src: "Arctic Monkeys - Do I Wanna Know (Official Video).MP3.mp3" },
    { title: "Creep", artist: "Radiohead", src: "Radiohead - Creep.MP3.mp3" },
    { title: "Without Me", artist: "Eminem", src: "Eminem - Without Me (Official Music Video).MP3.mp3" },
    { title: "Seven Nation Army", artist: "The White Stripes", src: "The White Stripes - Seven Nation Army (Official Music Video).MP3.mp3" },
    { title: "Can't Take My Eyes Off You", artist: "Engelbert Humperdinck", src: "Engelbert Humperdinck - Can't Take My Eyes Off You (Official Lyric Video).MP3.mp3" },
    { title: "My Way", artist: "Frank Sinatra", src: "My Way (2008 Remastered).MP3.mp3" },
    { title: "Believer", artist: "Imagine Dragons", src: "Imagine Dragons - Believer (Official Music Video).MP3.mp3" }
  ];

  let currentTrackIndex = 0;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function updatePlayerUI() {
    const track = tracks[currentTrackIndex];
    if (!track) return;
    currentTitleEl.textContent = track.title;
    currentArtistEl.textContent = track.artist;
    albumArtEl.textContent = "♪";
  }

  function buildTrackSrc(fileName) {
    return `./${encodeURIComponent(fileName)}`;
  }

  function loadTrack(index) {
    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    audio.src = buildTrackSrc(track.src);
    audio.load();
    updatePlayerUI();
    statusPill.textContent = "Cargando…";
  }

  function playCurrentTrack() {
    audio.play().then(() => {
      statusPill.textContent = "Reproduciendo";
      playPauseBtn.textContent = "⏸";
    }).catch(() => {
      statusPill.textContent = "Listo";
    });
  }

  function togglePlayPause() {
    if (audio.paused) {
      playCurrentTrack();
    } else {
      audio.pause();
      statusPill.textContent = "Pausado";
      playPauseBtn.textContent = "▶";
    }
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    playCurrentTrack();
  }

  function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    playCurrentTrack();
  }
  const fondoAnima = document.getElementById("fondo")
  


    setTimeout(function(){
      fondoAnima.style.opacity = "0";
      fondoAnima.style.zIndex = "0";
    }, 2000);

  

  playPauseBtn.addEventListener("click", togglePlayPause);
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextTrack);

  progressBar.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  audio.addEventListener("loadedmetadata", () => {
    durationTimeEl.textContent = formatTime(audio.duration);
    progressBar.max = 100;
  });

  audio.addEventListener("timeupdate", () => {
    if (!Number.isFinite(audio.duration)) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("ended", nextTrack);
  audio.addEventListener("play", () => {
    statusPill.textContent = "Reproduciendo";
    playPauseBtn.textContent = "⏸";
  });
  audio.addEventListener("pause", () => {
    if (!audio.ended) {
      statusPill.textContent = "Pausado";
      playPauseBtn.textContent = "▶";
    }
  });

  loadTrack(0);
  updatePlayerUI();
}

dockList?.addEventListener("click", (event) => {
  const button = event.target.closest(".dock-button");
  if (!button) return;

  openWindow(button.dataset.window);
});

const input = document.getElementById('command-input');
const output = document.getElementById('output');

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const rawInput = input.value.trim();
    if (rawInput !== '') {
      procesarComando(rawInput);
    }
    input.value = '';
  }
});

function imprimirTexto(texto) {
  const linea = document.createElement('div');
  linea.textContent = texto;
  output.appendChild(linea);
  
  const terminal = document.getElementById('terminal');
  terminal.scrollTop = terminal.scrollHeight;
}

const comandos = {
  'gustos': () => `Mis gustos:\n- Programación e IoT\n- Robótica\n- Física Cuántica `,
  'clear': () => { output.innerHTML = ''; return ''; },
  'fastfetch': () => `
                                         
                  -%%%+                         Operative System: AngelOS
                . =%%%* .                       Ram Memory: 2 bytes
             +%%%%     #%%%*                    Kernel: Chromimum based 9.0.0
          %%%%-           :%%%%                 Whoami: you
       %%%%                   %%%%.      
   =%%%%                         #%%%+   
 :%%=  -#                  :::.     -%%+ 
 :%%   @@ @@@@@@          @@@..:     %%+ 
 :%%           .@@*      @@@@@::     %%+ 
 :%%@@*    @. @-  @@      .#.        %%+ 
 :%% -    @    @   @@  @@@           %%+ 
 :%%  @@@  @. @       @@@@%          %%+ 
 :%%    @@@          @@@ @@+         %%+ 
 :%%      :@@@@@@@  @@%  .@@:        %%+ 
 :%%              :@@=    -@@.       %%+ 
 :%%             +@@:      #@@       %%+ 
 :%%            %@@         @:       %%+ 
  %%%%         *@@           @@@   #%%%  
    .%%%%                       %%%%.    
        %%%%-               :%%%%        
           +%%%%         #%%%*           
              .%%%%   %%%%.              
                  %%%%%                  
                                         

  `,
  'help': () => `
  fastfetch(info about OS)
  gustos(info about me)
  clear(just clear dude)`
};

function procesarComando(cmd) {
  imprimirTexto(`AngelOS@user:-$ ${cmd}`);
  
  if (comandos[cmd]) {
    const respuesta = comandos[cmd]();
    if (respuesta) imprimirTexto(respuesta);
  } else {
    imprimirTexto(`Comando no encontrado: ${cmd}. Escribe "help" para ver opciones.`);
  }
}
