# Pokédex

Busca um Pokémon pelo nome ou número e monta a ficha com dados da [PokéAPI](https://pokeapi.co/docs/v2).

![Ficha do Charizard](captura.png)

Cada ficha faz duas requisições:

1. `/pokemon/{id}`: arte, tipos, medidas, status e habilidades
2. `/pokemon-species/{id}`: categoria e descrição (vem em inglês, a API não tem pt-BR)

Abre o `index.html` com internet ligada. Não precisa instalar nada.
