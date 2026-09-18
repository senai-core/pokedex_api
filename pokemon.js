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

function mostrarAviso(texto) {
    carregando.hidden = true;
    ficha.hidden = true;
    avisoTexto.textContent = texto;
    aviso.hidden = false;
}

function formatarNome(nome) {
    return nome
        .split("-")
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
}

function formatarDecimal(valor) {
    return valor.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatarNumero(id) {
    return `Nº ${String(id).padStart(4, "0")}`;
}

function textoEmPortuguesOuIngles(lista, campo) {
    const emPortugues = lista.find((item) => item.language.name === "pt-br");
    const emIngles = lista.find((item) => item.language.name === "en");
    const escolhido = emPortugues ?? emIngles;

    if (!escolhido) {
        return "";
    }

    return escolhido[campo].replace(/\s+/g, " ").trim();
}

async function buscarEspecie(url) {
    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            return null;
        }

        return await resposta.json();
    } catch (erro) {
        return null;
    }
}

function preencherIdentidade(pokemon) {
    const nome = formatarNome(pokemon.name);
    const arte = document.getElementById("arte");

    arte.src = pokemon.sprites.other["official-artwork"].front_default ?? pokemon.sprites.front_default ?? "";
    arte.alt = `Arte oficial de ${nome}`;

    document.title = `${nome} | Pokédex`;
    document.getElementById("numero").textContent = formatarNumero(pokemon.id);
    document.getElementById("nome").textContent = nome;
}

function preencherTipos(tipos) {
    const listaTipos = document.getElementById("tipos");

    tipos.forEach(({ type }) => {
        const etiqueta = document.createElement("span");
        etiqueta.classList.add("tipo", `tipo-${type.name}`);
        etiqueta.textContent = NOMES_DOS_TIPOS[type.name] ?? formatarNome(type.name);
        listaTipos.appendChild(etiqueta);
    });

    document.body.classList.add(`tema-${tipos[0].type.name}`);
}

function preencherMedidas(pokemon) {
    document.getElementById("altura").textContent = `${formatarDecimal(pokemon.height / 10)} m`;
    document.getElementById("peso").textContent = `${formatarDecimal(pokemon.weight / 10)} kg`;
    document.getElementById("experiencia").textContent = pokemon.base_experience ?? "—";
}

function preencherStatus(stats) {
    const listaStatus = document.getElementById("lista-status");
    let total = 0;

    stats.forEach(({ stat, base_stat }) => {
        const info = INFO_DOS_STATUS[stat.name] ?? { nome: formatarNome(stat.name), icone: "fa-circle" };
        total += base_stat;

        const linha = document.createElement("div");
        linha.classList.add("status");

        const icone = document.createElement("i");
        icone.classList.add("fa-solid", info.icone, "status-icone");

        const nome = document.createElement("span");
        nome.classList.add("status-nome");
        nome.textContent = info.nome;

        const valor = document.createElement("span");
        valor.classList.add("status-valor");
        valor.textContent = base_stat;

        const trilho = document.createElement("div");
        trilho.classList.add("status-trilho");

        const barra = document.createElement("div");
        barra.classList.add("status-barra");
        barra.style.width = `${Math.min(base_stat / STATUS_MAXIMO, 1) * 100}%`;

        trilho.appendChild(barra);
        linha.append(icone, nome, valor, trilho);
        listaStatus.appendChild(linha);
    });

    document.getElementById("status-total").textContent = total;
}

function preencherHabilidades(habilidades) {
    const lista = document.getElementById("habilidades");

    habilidades.forEach(({ ability, is_hidden }) => {
        const item = document.createElement("li");
        item.classList.add("habilidade");
        item.textContent = formatarNome(ability.name);

        if (is_hidden) {
            const selo = document.createElement("span");
            selo.classList.add("habilidade-oculta");
            selo.textContent = "oculta";
            item.appendChild(selo);
        }

        lista.appendChild(item);
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

async function carregarPokemon() {
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id) {
        mostrarAviso("Nenhum Pokémon foi informado. Volte e faça uma busca.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/pokemon/${encodeURIComponent(id)}`);

        if (resposta.status === 404) {
            mostrarAviso(`Não existe Pokémon com o identificador "${id}".`);
            return;
        }

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status}`);
        }

        const pokemon = await resposta.json();
        const especie = await buscarEspecie(pokemon.species.url);

        preencherIdentidade(pokemon);
        preencherTipos(pokemon.types);
        preencherMedidas(pokemon);
        preencherStatus(pokemon.stats);
        preencherHabilidades(pokemon.abilities);
        preencherEspecie(especie);

        carregando.hidden = true;
        ficha.hidden = false;
    } catch (erro) {
        mostrarAviso("Não foi possível carregar os dados da PokéAPI. Confira sua internet e tente de novo.");
    }
}

carregarPokemon();
