function mostrarShikigami(nome){

const area = document.getElementById("area-shikigami")

if(nome === "lobo"){
area.innerHTML = `
<h2>Cães Divinos</h2>
<p>
Os Cães Divinos são os primeiros shikigamis de Megumi.
Eles rastreiam inimigos e atacam rapidamente.
</p>
<img src="../images/lobo.jpg" class="banner-anime">
`
}

if(nome === "nue"){
area.innerHTML = `
<h2>Nue</h2>
<p>
Nue é uma criatura voadora que utiliza ataques elétricos
e permite que Megumi ataque de longe.
</p>
<img src="../images/nue.jpg" class="banner-anime">
`
}

if(nome === "sapo"){
area.innerHTML = `
<h2>Sapo</h2>
<p>
O sapo pode capturar inimigos com sua língua
e ajudar Megumi em estratégias de captura.
</p>
<img src="../images/sapo.jpg" class="banner-anime">
`
}

if(nome === "elefante"){
area.innerHTML = `
<h2>Elefante Máximo</h2>
<p>
Um dos shikigamis mais pesados da técnica.
Ele pode liberar enormes quantidades de água.
</p>
<img src="../images/elefante.jpg" class="banner-anime">
`
}

if(nome === "mahoraga"){
area.innerHTML = `
<h2>Mahoraga</h2>
<p>
Mahoraga é o shikigami mais poderoso da Técnica das Dez Sombras.
Ele possui uma habilidade de adaptação quase imbatível.
</p>
<img src="../images/mahoraga.jpg" class="banner-anime">
`
}

}