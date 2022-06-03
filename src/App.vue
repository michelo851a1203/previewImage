<script setup lang="ts">
  import { storeToRefs } from 'pinia';
import { Ref, ref, watch } from 'vue';
  import TrimImageConverter from './components/TrimImageConverter.vue';
import { useTrimImageStore } from './store/trimImageStore';
  const cool = ref(false);
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
  async function getFetchImageToBase64() {
    const imageUrl = 'https://pbs.twimg.com/media/DfkhrO1XUAEYkdw.jpg';
    const response = await fetch(imageUrl);
    const blobData = await response.blob();
    // console.log(blobData);
    const url = URL.createObjectURL(blobData);
    console.log(url);
    // const reader = new FileReader();
    // reader.onload = () => {
    //   const base64Str = <string>reader.result;
    //   originalUrl.value = base64Str;
    //   const testImage = new Image()
    //   testImage.src = base64Str;
    //   // const resizeResult = resizeImage(testImage, 100, 100);
    //   // if (resizeResult === '') return;
    //   // resizeUrl.value = resizeResult;
    //   // trim 
    //   const resizeTrim = trimImage(testImage, testImage.width, testImage.height);
    //   if (resizeTrim === '') return;
    //   trimUrl.value = resizeTrim;
    // }

    // reader.readAsDataURL(blobData);
  }

  function resizeImage(img: HTMLImageElement, width: number, height: number): string {
    const canvas = <HTMLCanvasElement>(document.createElement('canvas'));
    const ctx = canvas.getContext('2d');
    if (ctx === null) return '';
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0 ,width, height);
    return canvas.toDataURL();
  }

  function trimImage(img: HTMLImageElement, width: number, height: number): string {
    const canvas = <HTMLCanvasElement>(document.createElement('canvas'));
    const ctx = canvas.getContext('2d');
    if (ctx === null) return '';
    canvas.width = width /2;
    canvas.height = height/ 2;
    // ctx.drawImage(img, sx, sy ,sw, sh, dx, dy, dw, dh);
    // reference : https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(img, 0, 0 ,width, height, -width/2, -height/2, width, height);
    return canvas.toDataURL();
  }

  const {
    transferImage
  } = storeToRefs(useTrimImageStore());

  function changeToImage(event: Event) {
    const uploader = <HTMLInputElement>(event.target);
    const fileList = uploader.files;
    if (fileList === null || fileList.length === 0) return;
    const imageFile = fileList[0];
    const imageRegExp = new RegExp('^image/', 'g');
    if (!imageRegExp.test(imageFile.type)) return;
    transferImage.value = imageFile;
  }

</script>

<template>
  <input @change="changeToImage" type="file" accept="image/*">
  <TrimImageConverter></TrimImageConverter>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
