<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { watch } from 'vue';
  import { useTrimImageStore } from '../store/trimImageStore';
  const {
    generateBase64ImageUrl,
  } = useTrimImageStore();
  const {
    transferImage,
    transferImageUrl,
    frameAttribute,
    limitSquareWidth,
    limitSquareHeight,
    currentImageWidth,
    currentImageHeight,
    overlayAttribute,
    getBackgroundImage,
  } = storeToRefs(useTrimImageStore());

  watch(transferImage, async () => {
    generateBase64ImageUrl()
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
        class="absolute top-0 left-0 image-frame" 
        :src="transferImageUrl"
      >
    </div>

  </section>

</template>

<style scoped>
  .image-frame {
    /* up right down left  */
    clip-path: inset(10px 50px 100px 120px);
  }
  /* .image-frame {
    left: var(--frameX);
    top: var(--frameY);
    width: var(--width);
    height: var(--height);
  } */
  .image-overlay {
    width: var(--overlayWidth);
    height: var(--overlayHeight);
  }
</style>