const API_URL = "https://pokeapi.co/api/v2";

const campoBusca = document.getElementById("campo-busca");
const botaoBusca = document.getElementById("botao-busca");
const mensagemErro = document.getElementById("mensagem-erro");

function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.hidden = false;
}

function esconderErro() {
    mensagemErro.textContent = "";
    mensagemErro.hidden = true;
}

function normalizarBusca(texto) {
    const termo = texto.trim().toLowerCase().replace(/\s+/g, "-");

    if (/^\d+$/.test(termo)) {
        return String(Number(termo));
    }

    return termo;
}

async function buscarPokemon() {
    const digitado = campoBusca.value.trim();
    const termo = normalizarBusca(digitado);

    if (termo === "") {
        mostrarErro("Digite o nome ou o número de um Pokémon.");
        campoBusca.focus();
        return;
    }

    esconderErro();
    botaoBusca.disabled = true;

    try {
        const resposta = await fetch(`${API_URL}/pokemon/${encodeURIComponent(termo)}`);

        if (resposta.status === 404) {
            mostrarErro(`Nenhum Pokémon encontrado para "${digitado}".`);
            return;
        }

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        const pokemon = await resposta.json();

        window.location.href = `pokemon.html?id=${pokemon.id}`;
    } catch (erro) {
        mostrarErro("Não foi possível falar com a PokéAPI. Confira sua internet e tente de novo.");
    } finally {
        botaoBusca.disabled = false;
    }
}

botaoBusca.addEventListener("click", buscarPokemon);

campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        buscarPokemon();
    }
});

document.querySelectorAll(".sugestao").forEach((botao) => {
    botao.addEventListener("click", () => {
        campoBusca.value = botao.dataset.busca;
        buscarPokemon();
    });
});
