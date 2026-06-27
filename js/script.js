const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function createCharacterSidebar() {
  if (document.querySelector(".character-sidebar")) return;
  const script = document.querySelector('script[src$="js/script.js"]');
  const root = script ? new URL("../", script.src) : new URL("./", window.location.href);
  const characters = [
    { name: "Yuji Itadori", href: "pages/pg1.html", image: "images/Itadori1.jpg", folder: "/pages/" },
    { name: "Megumi Fushiguro", href: "pagesMegumi/pg1.html", image: "images/megumi.jpg", folder: "/pagesMegumi/" },
    { name: "Nobara Kugisaki", href: "pagesNobara/pg1.html", image: "images/nobara.jpg", folder: "/pagesNobara/" },
    { name: "Satoru Gojo", href: "pages/gojo.html", image: "images/gojo.jpg", folder: "/pages/gojo.html" },
    { name: "Suguru Geto", href: "pages/geto.html", folder: "/pages/geto.html" }
  ];
  const aside = document.createElement("aside");
  aside.className = "character-sidebar";
  aside.setAttribute("aria-label", "Navegação entre personagens");
  const homeCurrent = window.location.pathname.endsWith("/") || window.location.pathname.endsWith("/index.html");
  const items = characters.map((character) => {
    const current = window.location.pathname.includes(character.folder);
    const visual = character.image
      ? `<img src="${new URL(character.image, root)}" alt="" width="38" height="38">`
      : `<span class="character-initial" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/></svg></span>`;
    return `<li><a href="${new URL(character.href, root)}"${current ? ' aria-current="page"' : ""}>
      ${visual}
      <span>${character.name}</span></a></li>`;
  }).join("");
  aside.innerHTML = `<h2>Personagens</h2><nav aria-label="Personagens">
    <a class="inicio-link" href="${new URL("index.html", root)}"${homeCurrent ? ' aria-current="page"' : ""}>
      <svg class="sidebar-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9.5 20v-6h5v6"/></svg><span>Início</span></a><ul>${items}</ul></nav>`;
  document.body.prepend(aside);
  document.body.classList.add("has-sidebar");
}

function replaceBrokenImage(image) {
  if (!image || image.dataset.fallbackReady) return;
  image.dataset.fallbackReady = "true";
  const replace = () => {
    if (!image.isConnected) return;
    const defaultSource = image.dataset.defaultSrc;
    if (defaultSource && image.src !== defaultSource && image.dataset.defaultTried !== "true") {
      image.dataset.defaultTried = "true";
      image.src = defaultSource;
      return;
    }
    const fallback = document.createElement("span");
    const isProfile = image.classList.contains("profile-avatar");
    fallback.className = isProfile ? "profile-avatar profile-avatar-fallback" : "character-initial";
    fallback.setAttribute("role", "img");
    fallback.setAttribute("aria-label", "Sem foto de perfil");
    fallback.innerHTML = `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/></svg>`;
    image.replaceWith(fallback);
  };
  image.addEventListener("error", replace, { once: true });
  if (image.complete && image.naturalWidth === 0) replace();
}

function setupImageFallbacks() {
  document.querySelectorAll(".character-sidebar img, .profile-avatar, .home-character img").forEach(replaceBrokenImage);
}

function setupCharacterProfile() {
  const path = window.location.pathname;
  const profileKey = path.includes("pagesMegumi/pg1") ? "megumi"
    : path.includes("pagesNobara/pg1") ? "nobara"
    : path.includes("pages/gojo") ? "gojo"
    : path.includes("pages/geto") ? "geto"
    : path.includes("pages/pg1") ? "yuji" : null;
  if (!profileKey) return;

  const script = document.querySelector('script[src$="js/script.js"]');
  const root = script ? new URL("../", script.src) : new URL("./", window.location.href);
  const profiles = {
    yuji: { name: "Yuji Itadori", handle: "@receptaculo-de-sukuna", avatar: "images/Itadori1.jpg", cover: "images/itadori4.jpg", tags: ["Protagonista", "Primeiro ano", "Força física"], bio: "Quero ajudar as pessoas e garantir que tenham uma morte digna.", reputation: "15.8K", followers: "4.2K", visitors: "8.7K" },
    megumi: { name: "Megumi Fushiguro", handle: "@dez-sombras", avatar: "images/megumi.jpg", cover: "images/megumi3.jpg", tags: ["Feiticeiro grau 2", "Dez Sombras", "Clã Zenin"], bio: "Eu salvo pessoas de forma desigual — seguindo a minha própria consciência.", reputation: "13.4K", followers: "3.9K", visitors: "7.2K" },
    nobara: { name: "Nobara Kugisaki", handle: "@ressonancia", avatar: "images/nobara.jpg", cover: "images/nobara3.jpg", tags: ["Primeiro ano", "Ressonância", "Autêntica"], bio: "Eu amo a versão de mim que é forte e também a versão que gosta de se arrumar.", reputation: "12.9K", followers: "4.1K", visitors: "7.8K" },
    gojo: { name: "Satoru Gojo", handle: "@o-mais-forte", avatar: "images/gojo.jpg", cover: "images/gojo.jpg", tags: ["Classe especial", "Seis Olhos", "Ilimitado"], bio: "Vou criar uma nova geração capaz de transformar o mundo jujutsu.", reputation: "99.9K", followers: "31K", visitors: "52K" },
    geto: { name: "Suguru Geto", handle: "@manipulacao-de-maldicoes", avatar: "", cover: "", tags: ["Classe especial", "Maldições", "Idealista"], bio: "Convicções profundas podem colocar grandes amigos em caminhos opostos.", reputation: "88.4K", followers: "24K", visitors: "41K" }
  };
  const defaults = profiles[profileKey];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(`profile-${profileKey}`) || "{}"); } catch { saved = {}; }
  const data = { ...defaults, ...saved };
  const validImageValue = (value) => typeof value === "string" && (value.startsWith("data:image/") || /\.(jpe?g|png|webp)(\?.*)?$/i.test(value));
  if (!validImageValue(data.avatar)) data.avatar = defaults.avatar;
  if (!validImageValue(data.cover)) data.cover = defaults.cover;
  if (profileKey === "yuji" && localStorage.getItem("yuji-image-fix-v1") !== "done") {
    data.avatar = defaults.avatar;
    data.cover = defaults.cover;
    localStorage.setItem(`profile-${profileKey}`, JSON.stringify(data));
    localStorage.setItem("yuji-image-fix-v1", "done");
  }
  const main = document.querySelector(".container");
  if (!main) return;
  document.body.classList.add("profile-mode");
  const section = document.createElement("section");
  section.className = "profile-hero";
  section.setAttribute("aria-label", `Perfil de ${data.name}`);
  const defaultAvatarUrl = defaults.avatar ? new URL(defaults.avatar, root).href : "";
  const avatar = data.avatar
    ? `<img class="profile-avatar" src="${data.avatar.startsWith("data:") ? data.avatar : new URL(data.avatar, root)}" data-default-src="${defaultAvatarUrl}" alt="Foto de perfil de ${data.name}">`
    : `<span class="profile-avatar profile-avatar-fallback" role="img" aria-label="Sem foto de perfil"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5C21 16.5 17 14 12 14Z"/></svg></span>`;
  const coverStyle = data.cover ? ` style="background-image:url('${data.cover.startsWith("data:") ? data.cover : new URL(data.cover, root)}')"` : "";
  section.innerHTML = `<div class="profile-cover"${coverStyle}>
    <div class="profile-avatar-wrap">${avatar}</div><span class="profile-status">Online</span>
    <h1 class="profile-name">${data.name}</h1><p class="profile-handle">${data.handle}</p>
    <div class="profile-tags">${data.tags.map(tag => `<span class="profile-tag">${tag}</span>`).join("")}</div>
    <button class="profile-edit-button" type="button" aria-expanded="false"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>Editar perfil</button>
  </div><div class="profile-stats" aria-label="Estatísticas do perfil">
    <div class="profile-stat"><strong>${data.reputation}</strong><span>Reputação</span></div>
    <div class="profile-stat"><strong>${data.followers}</strong><span>Seguidores</span></div>
    <div class="profile-stat"><strong>${data.visitors}</strong><span>Visitantes</span></div>
  </div><div class="profile-bio"><h2>Bio</h2><p>${data.bio}</p></div>`;

  const editor = document.createElement("form");
  editor.className = "profile-editor";
  editor.innerHTML = `<h2>Editar perfil</h2><div class="profile-form-grid">
    <label class="profile-field">Nome<input name="name" maxlength="40" value="${data.name}"></label>
    <label class="profile-field">Identificador<input name="handle" maxlength="50" value="${data.handle}"></label>
    <label class="profile-field full">Etiquetas, separadas por vírgula<input name="tags" maxlength="100" value="${data.tags.join(", ")}"></label>
    <label class="profile-field full">Bio<textarea name="bio" maxlength="220">${data.bio}</textarea></label>
    <label class="profile-field">Nova capa<input name="cover" type="file" accept="image/png,image/jpeg,image/webp"></label>
    <label class="profile-field">Novo avatar<input name="avatar" type="file" accept="image/png,image/jpeg,image/webp"></label>
  </div><div class="profile-editor-actions"><button type="button" class="restore-images">Usar imagens originais</button><button type="button" class="reset-profile">Restaurar tudo</button><button type="button" class="cancel-profile">Cancelar</button><button type="submit" class="save-profile">Salvar mudanças</button></div>`;
  main.prepend(editor); main.prepend(section);
  section.querySelectorAll(".profile-avatar").forEach(replaceBrokenImage);

  const editButton = section.querySelector(".profile-edit-button");
  const closeEditor = () => { editor.classList.remove("open"); editButton.setAttribute("aria-expanded", "false"); };
  editButton.addEventListener("click", () => { const open = !editor.classList.contains("open"); editor.classList.toggle("open", open); editButton.setAttribute("aria-expanded", String(open)); if (open) editor.querySelector("input").focus(); });
  editor.querySelector(".cancel-profile").addEventListener("click", closeEditor);
  editor.querySelector(".reset-profile").addEventListener("click", () => { localStorage.removeItem(`profile-${profileKey}`); window.location.reload(); });
  editor.querySelector(".restore-images").addEventListener("click", () => {
    const restored = { ...data, avatar: defaults.avatar, cover: defaults.cover };
    localStorage.setItem(`profile-${profileKey}`, JSON.stringify(restored));
    window.location.reload();
  });
  const readImage = (file) => new Promise((resolve) => { if (!file) return resolve(null); const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(file); });
  editor.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(editor);
    const cover = await readImage(form.get("cover")); const avatarValue = await readImage(form.get("avatar"));
    const updated = { ...data, name: form.get("name").trim() || defaults.name, handle: form.get("handle").trim() || defaults.handle,
      tags: form.get("tags").split(",").map(tag => tag.trim()).filter(Boolean).slice(0, 5), bio: form.get("bio").trim() || defaults.bio };
    if (cover) updated.cover = cover; if (avatarValue) updated.avatar = avatarValue;
    try { localStorage.setItem(`profile-${profileKey}`, JSON.stringify(updated)); window.location.reload(); }
    catch { alert("A imagem é grande demais para ser salva. Tente uma imagem menor."); }
  });
}

function prepareAccessibility() {
  document.documentElement.lang = "pt-BR";
  const main = document.querySelector(".container");
  if (main) { main.id = "conteudo-principal"; main.setAttribute("role", "main"); }
  if (!document.querySelector(".skip-link")) {
    const skipLink = document.createElement("a");
    skipLink.className = "skip-link";
    skipLink.href = "#conteudo-principal";
    skipLink.textContent = "Pular para o conteúdo";
    document.body.prepend(skipLink);
  }
  const canvas = document.getElementById("particulas");
  if (canvas) canvas.setAttribute("aria-hidden", "true");
  const labels = {
    "itadori.png": "Ilustração de Yuji Itadori", "itadori1.jpg": "Yuji Itadori",
    "itadori2.jpg": "Yuji Itadori sorrindo", "itadori5.jpg": "Yuji Itadori em cena do anime",
    "itadori6.jpg": "Retrato de Yuji Itadori", "megumi.jpg": "Megumi Fushiguro",
    "megumi2.jpg": "Retrato de Megumi Fushiguro", "megumi3.jpg": "Megumi usando a Técnica das Dez Sombras",
    "nobara.jpg": "Nobara Kugisaki", "nobara1.jpg": "Retrato de Nobara Kugisaki",
    "nobara3.jpg": "Nobara Kugisaki em cena do anime", "jujutsukaisen.jpg": "Personagens do anime Jujutsu Kaisen"
  };
  document.querySelectorAll("img").forEach((image, index) => {
    const filename = image.src.split("/").pop().toLowerCase();
    if (!image.hasAttribute("alt")) image.alt = labels[filename] || "Imagem de Jujutsu Kaisen";
    image.decoding = "async";
    if (index > 0) image.loading = "lazy";
  });
}

function setupTheme() {
  let button = document.getElementById("tema");
  if (!button) {
    button = document.createElement("button");
    button.id = "tema"; button.className = "botao-tema"; button.type = "button";
    document.body.append(button);
  }
  const savedTheme = localStorage.getItem("tema");
  const useLight = savedTheme === "light" || (!savedTheme && window.matchMedia("(prefers-color-scheme: light)").matches);
  document.body.classList.toggle("light", useLight);
  const updateButton = () => {
    const isLight = document.body.classList.contains("light");
    button.textContent = isLight ? "☾" : "☀";
    button.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
    button.title = isLight ? "Ativar tema escuro" : "Ativar tema claro";
    button.setAttribute("aria-pressed", String(isLight));
  };
  updateButton();
  button.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("tema", document.body.classList.contains("light") ? "light" : "dark");
    updateButton();
  });
}

function setupMenu() {
  const menu = document.getElementById("listaPersonagens");
  const trigger = document.querySelector("[data-menu-personagens]");
  if (!menu || !trigger) return;
  trigger.setAttribute("aria-controls", menu.id); trigger.setAttribute("aria-expanded", "false"); menu.hidden = true;
  trigger.addEventListener("click", () => {
    const open = trigger.getAttribute("aria-expanded") !== "true";
    trigger.setAttribute("aria-expanded", String(open)); menu.hidden = !open; menu.classList.toggle("aberta", open);
  });
}

function setupPageTransitions() {
  if (prefersReducedMotion.matches) return;
  document.querySelectorAll("a[href]").forEach((link) => link.addEventListener("click", (event) => {
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || link.target === "_blank" || url.hash) return;
    event.preventDefault(); document.body.classList.add("saindo");
    window.setTimeout(() => { window.location.href = url.href; }, 180);
  }));
}

function setupParticles() {
  const canvas = document.getElementById("particulas");
  if (!canvas || prefersReducedMotion.matches) return;
  const context = canvas.getContext("2d"); let particles = []; let frameId;
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(window.innerWidth * ratio); canvas.height = Math.round(window.innerHeight * ratio);
    canvas.style.width = `${window.innerWidth}px`; canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(36, Math.round(window.innerWidth / 30)) }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5, speed: Math.random() * 0.28 + 0.08
    }));
  };
  const draw = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight); context.fillStyle = "rgba(255, 52, 69, 0.58)";
    particles.forEach((particle) => {
      context.beginPath(); context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2); context.fill();
      particle.y += particle.speed; if (particle.y > window.innerHeight + 4) particle.y = -4;
    });
    frameId = requestAnimationFrame(draw);
  };
  resize(); draw(); window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(frameId); else draw(); });
}

createCharacterSidebar(); setupCharacterProfile(); setupImageFallbacks(); prepareAccessibility(); setupTheme(); setupMenu(); setupPageTransitions(); setupParticles();
const dateElement = document.getElementById("data");
if (dateElement) dateElement.textContent = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date());
requestAnimationFrame(() => document.body.classList.add("ready"));
