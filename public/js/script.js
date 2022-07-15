document.addEventListener("DOMContentLoaded", () => {
  const vueApp = {
    data() {
      return {
        pokemons: [],
      };
    },
    methods: {
      async fetchPokemons() {
        const res = await fetch("/pokemons");
        const pokemons = await res.json();
        this.pokemons = pokemons;
      },
    },
  };

  Vue.createApp(vueApp).mount("#vue_root");
});
