<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { computed, watch } from 'vue';
  import { useTrimImageStore } from '../store/trimImageStore';
  const {
    generateBase64ImageUrl,
    moveClipEnter,
    clipMoving,
    moveClipLeave,
  } = useTrimImageStore();
  const {
    transferImage,
    transferImageUrl,
    frameAttribute,
    getBackgroundImage,
  } = storeToRefs(useTrimImageStore());

  watch(transferImage, async () => {
    generateBase64ImageUrl()
  });

  const currentEvent = computed(() => {
    return {
      mousedown: (event: MouseEvent) => moveClipEnter(event),
      mousemove: (event: MouseEvent) => clipMoving(event),
      mouseleave: () => moveClipLeave(),
      mouseup: () => moveClipLeave(),
    };
  });
</script>

<template>
  <section class="relative">
    <div 
      v-if="transferImage !== null" 
      :style="getBackgroundImage"
      class="image-overlay relative"
    >
      <div class="w-full h-full bg-gray-400 mix-blend-screen">
      </div>
      <img 
        v-on="currentEvent"
        :style="frameAttribute"
        class="absolute top-0 left-0 image-frame" 
        :src="transferImageUrl"
        draggable="false"
      >
    </div>

  </section>

</template>

<style scoped>
  .image-frame {
    clip-path: inset(var(--clipAttribute));
  }
  .image-overlay {
    width: var(--overlayWidth);
    height: var(--overlayHeight);
  }
</style>
