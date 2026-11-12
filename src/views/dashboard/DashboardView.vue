<script setup lang="ts">
import { ref } from "vue";
import AnimatedAvatar from "../../components/common/AnimatedAvatar.vue";

const avatarCard = ref<HTMLElement | null>(null);
</script>

<template>
  <main class="dashboard-demo">
    <header class="dashboard-heading">
      <div>
        <p class="dashboard-eyebrow">COMPONENT PLAYGROUND</p>
        <h1>Avatar placements</h1>
        <p>Same reusable avatar, sized by its parent container.</p>
      </div>
      <span class="dashboard-mode">CARD-SCOPED TRACKING</span>
    </header>

    <section class="dashboard-content">
      <article class="profile-card">
        <div ref="avatarCard" class="profile-card-visual">
          <AnimatedAvatar variant="login" :tracking-target="avatarCard" />
          <span class="profile-card-badge">MOVE YOUR CURSOR HERE</span>
        </div>

        <div class="profile-card-details">
          <div>
            <p class="profile-card-label">YOUR GUIDE</p>
            <h2>Remy</h2>
          </div>
          <span class="profile-card-status"><i></i> Online</span>
        </div>
      </article>

      <aside class="placement-note">
        <span class="note-icon">↗</span>
        <p class="dashboard-eyebrow">LOCAL INTERACTION</p>
        <h2>Only follows inside the card.</h2>
        <p>
          The avatar fills this card's visual area. Its gaze tracks the cursor while it is over the
          card, and returns to center when the cursor leaves.
        </p>
        <div class="size-example">
          <span>Parent width</span>
          <code>100% / fixed / vw</code>
        </div>
      </aside>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.dashboard-demo {
  min-height: 100vh;
  min-height: 100svh;
  box-sizing: border-box;
  padding: clamp(28px, 6vw, 76px);
  background: #f5f5f8;
  color: #292832;
}

.dashboard-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  max-width: 980px;
  margin: 0 auto 44px;
}

.dashboard-eyebrow,
.profile-card-label {
  margin: 0;
  color: #77747f;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.dashboard-heading h1 {
  margin: 12px 0 8px;
  font-size: clamp(32px, 5vw, 48px);
  letter-spacing: -0.06em;
}

.dashboard-heading p:last-child {
  margin: 0;
  color: #77747f;
}

.dashboard-mode {
  flex: 0 0 auto;
  border: 1px solid #e3e1e9;
  border-radius: 99px;
  padding: 10px 14px;
  color: #7168ae;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.dashboard-content {
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(260px, 1fr);
  align-items: center;
  gap: clamp(24px, 6vw, 72px);
  max-width: 980px;
  margin: 0 auto;
}

.profile-card {
  overflow: hidden;
  border: 1px solid #e8e7ed;
  border-radius: 22px;
  background: white;
  box-shadow: 0 18px 50px #2928320d;
}

.profile-card-visual {
  position: relative;
  height: 320px;
  overflow: hidden;
  background: #252535;
}

.profile-card-badge {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 1;
  border: 1px solid #ffffff35;
  border-radius: 99px;
  padding: 8px 11px;
  background: #171722b8;
  color: white;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.09em;
  pointer-events: none;
  backdrop-filter: blur(8px);
}

.profile-card-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
}

.profile-card-label {
  font-size: 9px;
}

.profile-card-details h2 {
  margin: 5px 0 0;
  font-size: 22px;
  letter-spacing: -0.04em;
}

.profile-card-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #77747f;
  font-size: 12px;
}

.profile-card-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #65b992;
}

.placement-note {
  position: relative;
  max-width: 380px;
  padding: 30px 0;
}

.note-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 30px;
  place-items: center;
  border-radius: 13px;
  background: #e9e7f6;
  color: #6c63ad;
  font-size: 22px;
}

.placement-note h2 {
  margin: 12px 0;
  font-size: clamp(25px, 4vw, 36px);
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.placement-note > p:not(.dashboard-eyebrow) {
  color: #77747f;
  font-size: 14px;
  line-height: 1.7;
}

.size-example {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 32px;
  border-top: 1px solid #e5e3eb;
  padding-top: 18px;
  color: #77747f;
  font-size: 12px;
}

.size-example code {
  color: #514a8c;
  font-family: inherit;
  font-weight: 700;
}

@media (max-width: 700px) {
  .dashboard-heading {
    align-items: start;
    flex-direction: column;
  }

  .dashboard-content {
    grid-template-columns: minmax(0, 1fr);
    max-width: 420px;
  }

  .profile-card-visual {
    height: min(320px, 80vw);
  }
}
</style>
