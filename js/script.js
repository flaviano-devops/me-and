document.body.classList.add("entrando");

window.addEventListener("load", () => {
    document.body.classList.remove("entrando");
});


// Mostrar página com fade quando carregar
window.addEventListener("load", () => {
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
});


// Mostrar data atual (se existir o elemento)
const dataElemento = document.getElementById("data");

if (dataElemento) {
    const data = new Date();
    dataElemento.textContent =
    "Hoje é " + data.toLocaleDateString("pt-BR");
}


// Efeito de digitação no título (se existir h1)
const titulo = document.getElementById("titulo");

if (titulo) {

    const texto = "Bem-vindo ao sistema!";
    let i = 0;

    titulo.textContent = "";

    function escrever() {
        if (i < texto.length) {
            titulo.textContent += texto.charAt(i);
            i++;
            setTimeout(escrever, 60);
        }
    }

    escrever();
}


// Aplicar tema salvo em qualquer página
const botaoTema = document.getElementById("tema");

// Aplicar tema salvo
const temaSalvo = localStorage.getItem("tema");

if (temaSalvo === "light") {
    document.body.classList.add("light");
    if(botaoTema) botaoTema.textContent = "☽";
} else {
    if(botaoTema) botaoTema.textContent = "☼︎";
}


// Trocar tema
if (botaoTema) {

    botaoTema.addEventListener("click", () => {
        
        botaoTema.classList.add("animacao-tema");

        setTimeout(() => {
            botaoTema.classList.remove("animacao-tema");
        }, 300);


        document.body.classList.toggle("light");

        if (document.body.classList.contains("light")) {

            localStorage.setItem("tema", "light");
            botaoTema.textContent = "☽";

        } else {

            localStorage.setItem("tema", "dark");
            botaoTema.textContent = "☼︎";

        }

    });

}

// animação suave ao trocar de página
const links = document.querySelectorAll("a");

links.forEach(link => {

    link.addEventListener("click", function(e) {

        const destino = this.href;

        if(destino.startsWith("#") || this.target === "_blank") return;

        e.preventDefault();

        document.body.classList.add("saindo");

        setTimeout(() => {
            window.location.href = destino;
        }, 350);

    });

});

const canvas = document.getElementById("particulas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particulas = [];

for (let i = 0; i < 60; i++) {
    particulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedY: Math.random() * 0.5 + 0.2
    });
}

function animarParticulas() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(229,9,20,0.8)";

    particulas.forEach(p => {

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;

        if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
        }

    });

    requestAnimationFrame(animarParticulas);
}

animarParticulas();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function toggleMenu(){

const menu = document.getElementById("listaPersonagens")

if(menu.style.display === "flex"){
menu.style.display = "none"
}else{
menu.style.display = "flex"
}

}