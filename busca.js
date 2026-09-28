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

async function abrirPokemonDigitado() {
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
        const pokemon = await buscarPokemon(termo);

        window.location.href = `pokemon.html?id=${pokemon.id}`;
    } catch (erro) {
        if (erro instanceof PokemonNaoEncontrado) {
            mostrarErro(`Nenhum Pokémon encontrado para "${digitado}".`);
        } else {
            mostrarErro("Não foi possível falar com a PokéAPI. Confira sua internet e tente de novo.");
        }
    } finally {
        botaoBusca.disabled = false;
    }
}

botaoBusca.addEventListener("click", abrirPokemonDigitado);

campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        abrirPokemonDigitado();
    }
});

document.querySelectorAll(".sugestao").forEach((botao) => {
    botao.addEventListener("click", () => {
        campoBusca.value = botao.dataset.busca;
        abrirPokemonDigitado();
    });
});
