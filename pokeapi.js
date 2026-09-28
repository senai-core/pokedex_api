const URL_DA_API = "https://pokeapi.co/api/v2";

class PokemonNaoEncontrado extends Error {}

async function buscarPokemon(termo) {
    const resposta = await fetch(`${URL_DA_API}/pokemon/${encodeURIComponent(termo)}`);

    if (resposta.status === 404) {
        throw new PokemonNaoEncontrado();
    }

    if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}`);
    }

    return resposta.json();
}

async function buscarEspecie(url) {
    try {
        const resposta = await fetch(url);

        if (!resposta.ok) {
            return null;
        }

        return await resposta.json();
    } catch {
        return null;
    }
}
