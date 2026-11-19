<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import AnimatedAvatar from "../../components/common/AnimatedAvatar.vue";
import { useRouter } from "vue-router";
import { VIcon } from "vuetify/components";
import { useAuthStore, type LoginCredentials } from "../../store/auth.store";
import { toTypedSchema } from "@vee-validate/yup";
import { loginSchema } from "../../utils/validations/auth.validation";
import { ROUTE_NAMES, UI_STRINGS } from "../../utils/constants";
import { useForm } from "vee-validate";
import { VForm, VSnackbar } from "vuetify/components";
import BaseButton from "../../components/common/BaseButton.vue";
import BaseTextField from "../../components/common/BaseTextField.vue";
import { getPlaceholder } from "../../utils/placeholder.utils";

const router = useRouter();
const authStore = useAuthStore();

const loginVisualPanel = ref<HTMLElement | null>(null);
const showPassword = ref(false);
const showErrorSnackbar = ref(false);

const isMobileViewport = ref(
  typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches,
);

let mobileViewportQuery: MediaQueryList | null = null;

function handleMobileViewportChange(event: MediaQueryListEvent): void {
  isMobileViewport.value = event.matches;
}

onMounted(() => {
  mobileViewportQuery = window.matchMedia("(max-width: 760px)");
  mobileViewportQuery.addEventListener("change", handleMobileViewportChange);
  isMobileViewport.value = mobileViewportQuery.matches;
});

onBeforeUnmount(() => {
  mobileViewportQuery?.removeEventListener("change", handleMobileViewportChange);
});

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: "",
    password: "",
  },
});

const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const submitLogin = handleSubmit(async (values: LoginCredentials) => {
  authStore.clearError();
  showErrorSnackbar.value = false;

  try {
    await authStore.login(values);
    await router.replace({ name: ROUTE_NAMES.DASHBOARD });
  } catch {
    showErrorSnackbar.value = Boolean(authStore.error);
  }
});
</script>

<template>
  <main class="login-demo">
    <section class="login-form-panel d-grid align-center justify-center">
      <div class="login-form-content">
        <p class="login-eyebrow">
          {{ UI_STRINGS.LOGIN.EYEBROW }}
        </p>

        <h1>{{ UI_STRINGS.LOGIN.TITLE }}</h1>

        <p class="login-description">
          {{ UI_STRINGS.LOGIN.DESCRIPTION }}
        </p>

        <v-form class="login-form mt-10" @submit.prevent="submitLogin">
          <BaseTextField
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            name="email"
            :label="UI_STRINGS.LOGIN.EMAIL_LABEL"
            type="email"
            autocomplete="email"
            :placeholder="getPlaceholder(UI_STRINGS.LOGIN.EMAIL_LABEL)"
            :error-messages="errors.email"
          />

          <BaseTextField
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            name="password"
            :label="UI_STRINGS.LOGIN.PASSWORD_LABEL"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :placeholder="getPlaceholder(UI_STRINGS.LOGIN.PASSWORD_LABEL)"
            :error-messages="errors.password"
          >
            <template #append-inner>
              <BaseButton
                icon
                variant="text"
                density="compact"
                size="small"
                :block="false"
                :aria-label="
                  showPassword ? UI_STRINGS.LOGIN.HIDE_PASSWORD : UI_STRINGS.LOGIN.SHOW_PASSWORD
                "
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" />
              </BaseButton>
            </template>
          </BaseTextField>

          <BaseButton type="submit" :loading="isSubmitting" :disabled="isSubmitting">
            {{ UI_STRINGS.LOGIN.SUBMIT }}
          </BaseButton>
        </v-form>
      </div>
    </section>

    <section
      v-if="!isMobileViewport"
      ref="loginVisualPanel"
      class="login-visual-panel"
      :aria-label="UI_STRINGS.LOGIN.VISUAL_PANEL_LABEL"
    >
      <AnimatedAvatar :tracking-target="loginVisualPanel" variant="login" />

      <div class="float-card float-card--welcome d-flex align-center ga-3">
        <div class="card-icon card-icon--sun">✳</div>

        <div class="card-copy d-flex flex-column">
          <strong>{{ UI_STRINGS.LOGIN.WELCOME_CARD_TITLE }}</strong>
          <span class="card-subtitle">
            {{ UI_STRINGS.LOGIN.WELCOME_CARD_DESCRIPTION }}
          </span>
        </div>
      </div>

      <div class="float-card float-card--stats d-flex flex-column">
        <strong>{{ UI_STRINGS.LOGIN.STATS_CARD_TITLE }}</strong>

        <div class="progress-track">
          <span></span>
        </div>

        <div class="stats-bottom d-flex align-center justify-space-between">
          <span>{{ UI_STRINGS.LOGIN.STATS_FOOTER }}</span>
          <span>{{ UI_STRINGS.LOGIN.STATS_PROGRESS }}</span>
        </div>
      </div>
    </section>
  </main>

  <v-snackbar v-model="showErrorSnackbar" color="error" location="top end" :timeout="4000">
    {{ authStore.error }}
  </v-snackbar>
</template>

<style scoped>
.login-demo {
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(340px, 0.9fr) minmax(0, 1.1fr);
  overflow: hidden;
  background: #f6f5f2;
  color: #24242d;
}

.login-form {
  display: grid;
  gap: 16px;
}

.login-form-panel {
  display: grid;
  align-items: center;
  justify-content: center;
  padding: clamp(28px, 6vw, 88px);
}

.login-form-content {
  width: min(420px, 100%);
}

.login-eyebrow {
  margin: 0;
  color: #807d79;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.login-form-content h1 {
  margin: 42px 0 10px;
  font-size: clamp(38px, 5vw, 58px);
  letter-spacing: -0.06em;
  line-height: 1;
}

.login-description {
  margin: 0;
  color: #77747b;
  font-size: 15px;
}

.login-visual-panel {
  position: relative;
  height: 100vh;
  height: 100svh;
  min-width: 0;
  overflow: hidden;
  background: #252535;
}

.float-card {
  position: absolute;
  z-index: 4;
  border: 1px solid #ffffff22;
  border-radius: 13px;
  background: #ffffffed;
  box-shadow: 0 18px 55px #14131f4d;
  color: #302d38;
  backdrop-filter: blur(18px);
  animation: card-float 6s ease-in-out infinite;
}

.float-card--welcome {
  top: 17%;
  left: 7%;
  padding: 14px 16px;
}

.card-icon {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  place-items: center;
  border-radius: 10px;
  background: #eee8f4;
  color: #8e72ae;
  font-size: 20px;
}

.card-copy {
  gap: 5px;
}

.card-copy strong {
  font-family: Georgia, serif;
  font-size: 14px;
  font-weight: 500;
}

.card-subtitle {
  color: #99929e;
  font-size: 9px;
}

.float-card--stats {
  right: 7%;
  bottom: 14%;
  width: min(215px, 60%);
  align-items: stretch;
  gap: 11px;
  padding: 16px;
  animation-delay: -2.4s;
}

.stats-bottom {
  color: #aaa3ae;
  font-size: 6px;
}

.float-card--stats strong {
  font-family: Georgia, serif;
  font-size: 16px;
  font-weight: 500;
}

.progress-track {
  height: 4px;
  overflow: hidden;
  border-radius: 10px;
  background: #ece8f0;
}

.progress-track span {
  display: block;
  width: 68%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #9278b8, #c2a8d6);
}

.float-card strong {
  font-size: clamp(13px, 1.35vw, 17px);
  letter-spacing: -0.03em;
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }

  50% {
    transform: translateY(-12px) rotate(1deg);
  }
}

@media (max-width: 760px) {
  .login-demo {
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .login-form-panel {
    padding: 56px 24px;
  }

  .login-form-content,
  .login-form {
    min-width: 0;
  }

  .login-form-content h1 {
    margin-top: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .float-card {
    animation: none;
  }
}
</style>
