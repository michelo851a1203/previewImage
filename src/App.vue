<script setup lang="ts">
  import { computed, Ref, ref, watch } from 'vue';
  import TrimImageConverter from './components/TrimImageConverter.vue';
  import { useTrimImageStore } from './store/trimImageStore';
  const currentImageUrl = ref('');
  const fileUrlArray: Ref<string[]> = ref([]);

  const originalUrl = ref('');
  const resizeUrl = ref('');
  const trimUrl = ref('');

  function changeFile(event: Event) {
    const element = <HTMLInputElement>(event.target);
    const fileList = element.files;
    if (fileList === null) return;
    const singleFile = fileList[0];
    // this method to get blob
    // get image url to add tag here
    // const blobUrl = URL.createObjectURL(singleFile);
    // fileUrlArray.value.push(blobUrl);
    // console.log(fileUrlArray.value);

    // const reader = new FileReader();
    // reader.readAsDataURL(singleFile);
    // reader.onload = () => {
    //   const base64str = reader.result;
    //   currentImageUrl.value = <string>base64str;
    // }
  }
  // async function getFetchImageToBase64() {
  //   const imageUrl = 'https://pbs.twimg.com/media/DfkhrO1XUAEYkdw.jpg';
  //   const response = await fetch(imageUrl);
  //   const blobData = await response.blob();
  //   // console.log(blobData);
  //   // const url = URL.createObjectURL(blobData);
  //   //  console.log(url);
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     const base64Str = <string>reader.result;
  //     originalUrl.value = base64Str;
  //     const testImage = new Image()
  //     testImage.onload = () => {
  //       const resizeTrim = trimTestImage(testImage, testImage.width, testImage.height);
  //       trimUrl.value = resizeTrim;

  //       // const resizeResult = resizeImage(testImage, 100, 100);
  //       // if (resizeResult === '') return;
  //       // resizeUrl.value = resizeResult;
  //       // trim 
  //       // const resizeTrim = trimImage(testImage, testImage.width, testImage.height);
  //       // if (resizeTrim === '') return;
  //       // trimUrl.value = resizeTrim;

  //     }
  //     testImage.src = base64Str;
  //   }
  //   reader.readAsDataURL(blobData);
  // }

  // function resizeImage(img: HTMLImageElement, width: number, height: number): string {
  //   const canvas = <HTMLCanvasElement>(document.createElement('canvas'));
  //   const ctx = canvas.getContext('2d');
  //   if (ctx === null) return '';
  //   canvas.width = width;
  //   canvas.height = height;
  //   ctx.drawImage(img, 0, 0 ,width, height);
  //   return canvas.toDataURL();
  // }

  // function trimTestImage(img: HTMLImageElement, width: number, height: number): string {
  //   const canvas = <HTMLCanvasElement>(document.createElement('canvas'));
  //   const ctx = canvas.getContext('2d');
  //   if (ctx === null) return '';
  //   // catch width
  //   canvas.width = width /3;
  //   // catch height
  //   canvas.height = height/ 3;
  //   // ctx.drawImage(img, sx, sy ,sw, sh, dx, dy, dw, dh);
  //   // reference : https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage
  //   // ctx.drawImage(img, 0, 0 ,width, height, -width/2, -height/2, width, height);
  //   ctx.drawImage(img, 0, 0 ,width, height, -width/3, -height/3, width, height);
  //   return canvas.toDataURL();
  // }

  const {
    setTransferImage,
    exportImageBase64,
    enableConstraint,
  } = useTrimImageStore();

  const currentImage = ref('');

  function changeToImage(event: Event) {
    const uploader = <HTMLInputElement>(event.target);
    const fileList = uploader.files;
    if (fileList === null || fileList.length === 0) return;
    const imageFile = fileList[0];
    setTransferImage(imageFile);
  }
  async function sureToGetImage() {
    enableConstraint(true);
    const getAns = await exportImageBase64();
    if (getAns) {
      currentImage.value = getAns;
    }
  }

  const currentShowFile = ref(false);
  function dropHandler(event: DragEvent) {
    const transferObject = event.dataTransfer;
    if (transferObject === null) return;
    if (transferObject.items[0].kind === 'file') {
      const file = transferObject.items[0].getAsFile();
      if (file === null) return;
      const imageRegExp = new RegExp('image/*','g')
      if (!imageRegExp.test(file.type)) return;
      const result = URL.createObjectURL(file);
      console.log(result);
      currentShowFile.value = false;
    }
  }

  function detectDragHandler(event: DragEvent) {
    const transferObject = event.dataTransfer;
    if (transferObject === null) return;
    if (transferObject.items[0].kind === 'file') {
      currentShowFile.value = true;
    }
  }
  function leaveHandler() {
    currentShowFile.value = false;
  }
  const dragFileZoneEvent = computed(() => {
    return {
      drop: (event: DragEvent) => {
        event.preventDefault();
        dropHandler(event);
      },
      dragover: (event: DragEvent) => {
        event.preventDefault();
        detectDragHandler(event);
      },
      dragleave: () => leaveHandler(),
    };
  })

</script>

<template>
  <div 
    v-on="dragFileZoneEvent"
    class="w-64 h-64 rounded-xl bg-blue-300 flex items-center justify-center "
  >
  <div v-if="currentShowFile" class="w-16 h-16 rounded-full bg-green-800 animate-bounce"></div>
  </div>

  <input @change="changeToImage" type="file" accept="image/*">
  <TrimImageConverter></TrimImageConverter>
  <button @click="sureToGetImage">test click</button>
  <img class="border border-black" v-if="currentImage !== ''" :src="currentImage" alt="">


</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
