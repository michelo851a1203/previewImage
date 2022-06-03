import { defineStore } from 'pinia';

export interface UseTrimImageStoreType {
  transferImage: File | null,
  transferImageUrl: string;
  frameX: number;
  frameY: number;
  limitSquareWidth: number;
  limitSquareHeight: number;
  currentImageWidth: number;
  currentImageHeight: number;
}
export interface ImageInfoType {
  width: number;
  height: number;
}

export const useTrimImageStore = defineStore('trimImage', {
  state: () => {
    return <UseTrimImageStoreType>{
      transferImage: null,
      transferImageUrl: '',
      frameX: 0,
      frameY: 0,
      limitSquareWidth: 200,
      limitSquareHeight: 200,
      currentImageWidth: 0,
      currentImageHeight: 0,
    }
  },
  getters: {
    frameAttribute: (state) => {
      // return `
      //   --width:${state.limitSquareWidth}px;
      //   --height:${state.limitSquareHeight}px;
      //   --frameX:${state.frameX}px;
      //   --frameY:${state.frameY}px;
      // `;
      return `

      `;
    },
    overlayAttribute: (state) => {
      return `
        --overlayWidth:${state.currentImageWidth}px;
        --overlayHeight:${state.currentImageHeight}px;
      `;
    },
    getBackgroundImage: (state) => {
      return `
        background-image: url("${state.transferImageUrl}");
        --overlayWidth:${state.currentImageWidth}px;
        --overlayHeight:${state.currentImageHeight}px;
      `;
    },
  },
  actions: {
    async getFileBase64String(imageFile: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(<string>reader.result);
        }

        reader.onerror = () => {
          reject('file reader error');
        }

        reader.readAsDataURL(imageFile);
      });
    },
    async getImageLoadInformation(imageUrl: string): Promise<ImageInfoType> {
      return new Promise((resolve, reject) => {
        const transferImageElement = new Image();
        transferImageElement.onload = () => {
          const imageWidth = transferImageElement.width;
          const imageHeight = transferImageElement.height;
          resolve({
            width: imageWidth,
            height: imageHeight,
          });
        }

        transferImageElement.onerror = () => {
          reject('(new Image)load image error');
        }

        transferImageElement.src = imageUrl;
      });
    },
    async getConstraint() {
      if (this.transferImageUrl.trim() === '') return;
      const imageInfo 
        = await this.getImageLoadInformation(this.transferImageUrl);

      this.currentImageWidth = imageInfo.width;
      this.currentImageHeight = imageInfo.height;

      if (this.limitSquareWidth > imageInfo.width) {
        this.limitSquareWidth = imageInfo.width;
      }

      if (this.limitSquareHeight > imageInfo.height) {
        this.limitSquareHeight = imageInfo.height;
      }
    },
    async generateBase64ImageUrl() {
      if (this.transferImage === null) {
        this.transferImageUrl = '';
        return;
      }
      this.transferImageUrl 
        = await this.getFileBase64String(this.transferImage);
      await this.getConstraint();
    }
  }
})