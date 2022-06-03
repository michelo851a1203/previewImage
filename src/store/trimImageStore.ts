import { defineStore } from 'pinia';

export interface UseTrimImageStoreType {
  transferImage: File | null,
  transferImageUrl: string;
  frameX: number;
  frameY: number;
  limitSquareWidth: number;
  limitSquareHeight: number;
  constraintSquareWidth: number;
  constraintSquareHeight: number;
  currentImageWidth: number;
  currentImageHeight: number;
  isCurrentMoving: boolean;
  tempLocX: number;
  tempLocY: number;
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
      constraintSquareWidth: 200,
      constraintSquareHeight: 200,
      currentImageWidth: 0,
      currentImageHeight: 0,
      isCurrentMoving: false,
      tempLocX: -1,
      tempLocY: -1,
    }
  },
  getters: {
    frameAttribute: (state) => {
      const top = state.frameY;
      const left = state.frameX;

      const right 
        = state.currentImageWidth 
          - state.limitSquareWidth
          - state.frameX;

      const bottom  
        = state.currentImageHeight 
          - state.limitSquareHeight
          - state.frameY;

      return `
        --clipAttribute: ${top}px ${right}px ${bottom}px ${left}px;
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
    setTransferImage(setFile: File) {
      const imageRegExp = new RegExp('^image/', 'g');
      if (!imageRegExp.test(setFile.type)) {
        throw 'set Transfer not image';
      }
      this.transferImage = setFile;
    },
    setConstraint(width: number, height: number) {
      this.constraintSquareWidth = width;
      this.constraintSquareHeight = height;
      this.limitSquareWidth = width;
      this.limitSquareHeight = height
    },
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
          transferImageElement.remove();

          resolve({
            width: imageWidth,
            height: imageHeight,
          });
        }

        transferImageElement.onerror = () => {
          transferImageElement.remove();
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
    },
    moveClipEnter(event: MouseEvent) {
      this.isCurrentMoving = true;
      this.tempLocX = event.pageX - this.frameX;
      this.tempLocY = event.pageY - this.frameY;
    },
    clipMoving(event: MouseEvent) {
      if (
        !this.isCurrentMoving || 
        this.tempLocX < 0  ||
        this.tempLocY < 0
      ) return;
      this.movingSquare(event);
    },
    movingSquare(event: MouseEvent) {
      let movingDiffX = event.pageX - this.tempLocX;

      const upperXConstraint 
        = this.currentImageWidth - this.limitSquareWidth;

      if (movingDiffX < 0) {
        movingDiffX = 0;
      }

      if (movingDiffX > upperXConstraint) {
        movingDiffX = upperXConstraint;
      }

      this.frameX = movingDiffX;

      let movingDiffY = event.pageY - this.tempLocY;

      const upperYConstraint 
        = this.currentImageHeight - this.limitSquareHeight;

      if (movingDiffY < 0) {
        movingDiffY = 0;
      }

      if (movingDiffY > upperYConstraint) {
        movingDiffY = upperYConstraint;
      }

      this.frameY = movingDiffY;
    },
    moveClipLeave() {
      this.isCurrentMoving = false;
      this.tempLocX = -1;
      this.tempLocY = -1;
    },
    resetImageConvert() {
      this.transferImage = null;
      this.transferImageUrl = '';
      this.frameX = 0;
      this.frameY = 0;
      this.limitSquareWidth = 200;
      this.limitSquareHeight = 200;
      this.currentImageWidth = 0;
      this.currentImageHeight = 0;
    },
    async trimImage(): Promise<string> {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = <HTMLCanvasElement>(document.createElement('canvas'));
          const ctx = canvas.getContext('2d');
          if (ctx === null) {
            image.remove();
            reject('context is null');
            return;
          }
          canvas.width = this.limitSquareWidth;
          canvas.height = this.limitSquareHeight;
          ctx.drawImage(
            image, 
            0, 
            0, 
            this.currentImageWidth,
            this.currentImageHeight,
            this.frameX * -1,
            this.frameY * -1,
            this.currentImageWidth,
            this.currentImageHeight,
          )
          const trimImageResult = canvas.toDataURL();
          image.remove();
          resolve(trimImageResult);
        }
        image.src = this.transferImageUrl;
      });
    },
    async resizeImage(imageUrl: string) {
      if (
        this.constraintSquareWidth === this.limitSquareWidth &&
        this.constraintSquareHeight === this.limitSquareHeight
      ) {
        return null;
      }
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const canvas = <HTMLCanvasElement>(document.createElement('canvas'));
          const ctx = canvas.getContext('2d');
          if (ctx === null) {
            reject('context nul');
            return;
          }
          canvas.width = this.constraintSquareWidth;
          canvas.height = this.constraintSquareHeight;
          ctx.drawImage(
            image, 
            0, 
            0 ,
            this.constraintSquareWidth, 
            this.constraintSquareHeight
          );
          const imageResult = canvas.toDataURL();
          image.remove();
          resolve(imageResult);
        }
        image.src = imageUrl;
      });
    },
  }
})
