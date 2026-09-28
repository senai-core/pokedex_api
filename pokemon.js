const STATUS_MAXIMO = 255;

const NOMES_DOS_TIPOS = {
    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    grass: "Planta",
    electric: "Elétrico",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Venenoso",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"
};

const INFO_DOS_STATUS = {
    hp: { nome: "HP", icone: "fa-heart" },
    attack: { nome: "Ataque", icone: "fa-hand-fist" },
    defense: { nome: "Defesa", icone: "fa-shield-halved" },
    "special-attack": { nome: "Ataque Esp.", icone: "fa-wand-sparkles" },
    "special-defense": { nome: "Defesa Esp.", icone: "fa-shield-heart" },
    speed: { nome: "Velocidade", icone: "fa-person-running" }
};

const carregando = document.getElementById("carregando");
const aviso = document.getElementById("aviso");
const avisoTexto = document.getElementById("aviso-texto");
const ficha = document.getElementById("ficha");

function criarElemento(tag, classes, texto = "") {
    const elemento = document.createElement(tag);

    elemento.className = classes;
    elemento.textContent = texto;

    return elemento;
}

function mostrarAviso(texto) {
    carregando.hidden = true;
    ficha.hidden = true;
    avisoTexto.textContent = texto;
    aviso.hidden = false;
}

function mostrarFicha() {
    carregando.hidden = true;
    ficha.hidden = false;
}

function formatarNome(nome) {
    return nome
        .split("-")
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
}

function formatarMedida(valor) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function emMetros(decimetros) {
    return formatarMedida(decimetros / 10);
}

function emQuilos(hectogramas) {
    return formatarMedida(hectogramas / 10);
}

function formatarNumeroDaPokedex(numero) {
    return `Nº ${String(numero).padStart(4, "0")}`;
}

function textoEmPortuguesOuIngles(textos, campoDeTexto) {
    const emPortugues = textos.find((texto) => texto.language.name === "pt-br");
    const emIngles = textos.find((texto) => texto.language.name === "en");
    const escolhido = emPortugues ?? emIngles;

    if (!escolhido) {
        return "";
    }

    return escolhido[campoDeTexto].replace(/\s+/g, " ").trim();
}

function preencherIdentidade(pokemon) {
    const nome = formatarNome(pokemon.name);
    const arte = document.getElementById("arte");

    arte.src = pokemon.sprites.other["official-artwork"].front_default ?? pokemon.sprites.front_default ?? "";
    arte.alt = `Arte oficial de ${nome}`;

    document.title = `${nome} | Pokédex`;
    document.getElementById("numero").textContent = formatarNumeroDaPokedex(pokemon.id);
    document.getElementById("nome").textContent = nome;
}

function preencherTipos(tipos) {
    const listaTipos = document.getElementById("tipos");

    tipos.forEach(({ type }) => {
        const nomeDoTipo = NOMES_DOS_TIPOS[type.name] ?? formatarNome(type.name);

        listaTipos.appendChild(criarElemento("span", `tipo tipo-${type.name}`, nomeDoTipo));
    });
}

function aplicarTemaDoTipo(tipoPrincipal) {
    document.body.classList.add(`tema-${tipoPrincipal}`);
}

function preencherMedidas(pokemon) {
    document.getElementById("altura").textContent = `${emMetros(pokemon.height)} m`;
    document.getElementById("peso").textContent = `${emQuilos(pokemon.weight)} kg`;
    document.getElementById("experiencia").textContent = pokemon.base_experience ?? "—";
}

function criarLinhaDeStatus(stat, valor) {
    const infoDoStatus = INFO_DOS_STATUS[stat.name] ?? { nome: formatarNome(stat.name), icone: "fa-circle" };
    const linha = criarElemento("div", "status");
    const trilho = criarElemento("div", "status-trilho");
    const barra = criarElemento("div", "status-barra");

    barra.style.width = `${Math.min(valor / STATUS_MAXIMO, 1) * 100}%`;
    trilho.appendChild(barra);

    linha.append(
        criarElemento("i", `fa-solid ${infoDoStatus.icone} status-icone`),
        criarElemento("span", "status-nome", infoDoStatus.nome),
        criarElemento("span", "status-valor", valor),
        trilho
    );

    return linha;
}

function somarStatus(stats) {
    return stats.reduce((total, { base_stat }) => total + base_stat, 0);
}

function preencherStatus(stats) {
    const listaStatus = document.getElementById("lista-status");

    stats.forEach(({ stat, base_stat }) => {
        listaStatus.appendChild(criarLinhaDeStatus(stat, base_stat));
    });

    document.getElementById("status-total").textContent = somarStatus(stats);
}

function preencherHabilidades(habilidades) {
    const listaHabilidades = document.getElementById("habilidades");

    habilidades.forEach(({ ability, is_hidden }) => {
        const item = criarElemento("li", "habilidade", formatarNome(ability.name));

        if (is_hidden) {
            item.appendChild(criarElemento("span", "habilidade-oculta", "oculta"));
        }

        listaHabilidades.appendChild(item);
    });
}

function preencherEspecie(especie) {
    const categoria = document.getElementById("categoria");
    const descricao = document.getElementById("descricao");

    if (!especie) {
        categoria.hidden = true;
        descricao.textContent = "Descrição indisponível no momento.";
        return;
    }

    categoria.textContent = textoEmPortuguesOuIngles(especie.genera, "genus");
    descricao.textContent = textoEmPortuguesOuIngles(especie.flavor_text_entries, "flavor_text") || "Sem descrição cadastrada.";
}

function preencherFicha(pokemon, especie) {
    preencherIdentidade(pokemon);
    preencherTipos(pokemon.types);
    aplicarTemaDoTipo(pokemon.types[0].type.name);
    preencherMedidas(pokemon);
    preencherStatus(pokemon.stats);
    preencherHabilidades(pokemon.abilities);
    preencherEspecie(especie);
}

function idDaUrl() {
    return new URLSearchParams(window.location.search).get("id");
}

async function carregarPokemon() {
    const id = idDaUrl();

    if (!id) {
        mostrarAviso("Nenhum Pokémon foi informado. Volte e faça uma busca.");
        return;
    }

    try {
        const pokemon = await buscarPokemon(id);
        const especie = await buscarEspecie(pokemon.species.url);

        preencherFicha(pokemon, especie);
        mostrarFicha();
    } catch (erro) {
        if (erro instanceof PokemonNaoEncontrado) {
            mostrarAviso(`Não existe Pokémon com o identificador "${id}".`);
        } else {
            mostrarAviso("Não foi possível carregar os dados da PokéAPI. Confira sua internet e tente de novo.");
        }
    }
}

carregarPokemon();
