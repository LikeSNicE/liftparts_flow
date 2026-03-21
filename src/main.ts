import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { router } from "./router/router";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import { setup } from "./service/setupInstance";

const pinia = createPinia();
const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: "none",
    },
  },
});

app.use(pinia);
app.use(router);

app.mount("#app");

setup();
