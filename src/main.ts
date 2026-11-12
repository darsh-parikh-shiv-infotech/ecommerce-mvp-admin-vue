import { createApp } from "vue";
import { createPinia } from "pinia";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";

import App from "./App.vue";

import { useAuthStore } from "./store/auth.store.ts";
import router from "./router/index.ts";
import { createVuetify } from "vuetify";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const authStore = useAuthStore(pinia);
authStore.initializeAuth();

app.use(
  createVuetify({
    theme: {
      defaultTheme: "light",
    },
  }),
);
app.use(router);
app.mount("#app");
