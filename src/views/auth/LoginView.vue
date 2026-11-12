<script setup lang="ts">
import { computed, ref } from "vue";
import AnimatedAvatar from "../../components/common/AnimatedAvatar.vue";
import { useRouter } from "vue-router";
import { useAuthStore, type LoginCredentials } from "../../store/auth.store.ts";
import { toTypedSchema } from "@vee-validate/yup";
import { loginSchema } from "../../utils/validations/auth.validation.ts";
import { ROUTE_NAMES } from "../../utils/constants.ts";
import { useForm } from "vee-validate";
import { VAlert, VBtn, VForm, VIcon, VTextField } from "vuetify/components";

const router = useRouter();
const authStore = useAuthStore();

const loginVisualPanel = ref<HTMLElement | null>(null);
const showPassword = ref(false);

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: "",
    password: "",
  },
});

const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const hasError = computed(() => Boolean(authStore.error));

const submitLogin = handleSubmit(async (values: LoginCredentials) => {
  authStore.clearError();

  try {
    await authStore.login(values);
    await router.replace({ name: ROUTE_NAMES.DASHBOARD });
  } catch {
    // The auth store already normalizes and exposes the API error.
  }
});
</script>

<template>
  <main class="login-demo">
    <section class="login-form-panel">
      <div class="login-form-content">
        <p class="login-eyebrow">Ecommerce MVP</p>
        <h1>Welcome back</h1>
        <p class="login-description">Sign in to pick up where you left off.</p>

        <v-form class="login-form" @submit.prevent="submitLogin">
          <v-text-field
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            name="email"
            label="Email address"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :error-messages="errors.email"
          />

          <v-text-field
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            name="password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your password"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            :error-messages="errors.password"
          >
            <template #append-inner>
              <v-btn
                class="password-toggle"
                icon
                variant="text"
                density="compact"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <v-icon :icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" />
              </v-btn>
            </template>
          </v-text-field>

          <v-alert
            v-if="hasError"
            type="error"
            variant="tonal"
            density="compact"
            class="login-error"
          >
            {{ authStore.error }}
          </v-alert>
          <v-btn
            class="login-submit"
            type="submit"
            color="#282735"
            variant="flat"
            size="large"
            block
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Sign in
          </v-btn>
        </v-form>

        <p class="login-nav-links">
          <a href="#forgot-password">Forgot password?</a>
        </p>
      </div>
    </section>

    <section class="login-visual-panel" aria-label="Interactive avatar preview">
      <AnimatedAvatar :tracking-target="loginVisualPanel" variant="login" />

      <div class="float-card float-card--welcome">
        <div class="card-icon card-icon--sun">✳</div>
        <div class="card-copy">
          <strong>Good things ahead.</strong>
          <span class="card-subtitle">Let's make it happen.</span>
        </div>
      </div>

      <div class="float-card float-card--stats">
        <strong>One step at a time.</strong>
        <div class="progress-track">
          <span></span>
        </div>
        <div class="stats-bottom">
          <span>FOCUS ON WHAT MATTERS</span>
          <span>01 / 03</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.login-demo {
  display: grid;
  min-height: 100vh;
  min-height: 100svh;
  grid-template-columns: minmax(340px, 0.9fr) minmax(0, 1.1fr);
  overflow: hidden;
  background: #f6f5f2;
  color: #24242d;
}

.login-form-panel {
  display: grid;
  align-items: center;
  justify-items: center;
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

.login-form {
  display: grid;
  gap: 16px;
  margin-top: 40px;
}

.login-form :deep(.v-field) {
  border-radius: 12px;
  background: #fffefa;
}

.login-form :deep(.v-field__input) {
  min-height: 56px;
  font-size: 13px;
}

.login-form :deep(.v-field__outline) {
  color: #e9e6e2;
}

.login-form :deep(.v-field--focused .v-field__outline) {
  color: #a495cf;
}

.login-form :deep(.v-label) {
  font-size: 13px;
}

.login-form :deep(.v-messages__message) {
  font-size: 11px;
}

.password-toggle {
  color: #99939e;
}

.password-toggle:hover {
  color: #7765a8;
}

.login-error {
  margin-top: 2px;
}

.login-submit {
  height: 52px !important;
  margin-top: 4px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
}

.login-nav-links {
  margin-top: 24px;
  color: #77747b;
  font-size: 13px;
  text-align: center;
}

.login-nav-links a {
  color: #6d64b0;
  text-decoration: none;
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
  display: flex;
  align-items: center;
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
  gap: 12px;
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
  display: grid;
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
  flex-direction: column;
  align-items: stretch;
  gap: 11px;
  padding: 16px;
  animation-delay: -2.4s;
}

.stats-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

  .login-form-content h1 {
    margin-top: 32px;
  }

  .login-visual-panel {
    height: min(68vh, 480px);
    min-height: 320px;
  }

  .float-card {
    width: min(200px, 38%);
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .float-card {
    animation: none;
  }
}
</style>
