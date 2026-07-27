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
  let pos1 = 0;
  let pos2 = 0;
  let pos3 = 0;
  let pos4 = 0;

  handle.addEventListener("mousedown", startDrag);

  function startDrag(event) {
    if (event.target.closest("button")) return;

    element.style.zIndex = String(++zIndex);
    pos3 = event.clientX;
    pos4 = event.clientY;
    document.onmouseup = stopDrag;
    document.onmousemove = dragWindow;
  }

  function dragWindow(event) {
    pos1 = pos3 - event.clientX;
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;

    const newTop = element.offsetTop - pos2;
    const newLeft = element.offsetLeft - pos1;

    element.style.top = `${newTop}px`;
    element.style.left = `${newLeft}px`;
    element.style.transform = "none";
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

dockList?.addEventListener("click", (event) => {
  const button = event.target.closest(".dock-button");
  if (!button) return;

  openWindow(button.dataset.window);
});