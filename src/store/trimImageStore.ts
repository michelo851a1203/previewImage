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
  tempLocWidth: number;
  tempLocHeight: number;
  fixLocWidth: number;
  fixLocHeight: number;
  constraintBoundary: number;
  needTrimConstraint: boolean;
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
      tempLocWidth: 0,
      tempLocHeight: 0,
      fixLocWidth: 0,
      fixLocHeight: 0,
      constraintBoundary: 25,
      needTrimConstraint: false,
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
    enableConstraint(isEnable: boolean) {
      this.needTrimConstraint = isEnable;
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
      this.resetClipFrameLayout();
    },
    limitClipFrameLayout() {
      if (this.limitSquareWidth > this.currentImageWidth) {
        this.limitSquareWidth = this.currentImageWidth;
      }

      if (this.limitSquareHeight > this.currentImageHeight) {
        this.limitSquareHeight = this.currentImageHeight;
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
      this.tempLocWidth = this.limitSquareWidth;
      this.tempLocHeight = this.limitSquareHeight;
      this.fixLocWidth = this.limitSquareWidth + this.frameX;
      this.fixLocHeight = this.limitSquareHeight + this.frameY;
    },
    clipMoving(event: MouseEvent) {
      if (
        !this.isCurrentMoving || 
        this.tempLocX < 0  ||
        this.tempLocY < 0
      ) return;

      const edgeX = this.limitSquareWidth - this.constraintBoundary;
      const edgeY = this.limitSquareHeight - this.constraintBoundary;
      const currentLocX = event.pageX - this.frameX;
      const currentLocY = event.pageY - this.frameY;

      if (currentLocX < this.constraintBoundary && currentLocY < this.constraintBoundary) {
        this.expandLeftTopSquare(event);
        return;
      }

      if (currentLocX < this.constraintBoundary && currentLocY > edgeY) {
        this.expandLeftBottomSquare(event);
        return;
      }

      if (currentLocX > edgeX && currentLocY < this.constraintBoundary) {
        this.expandRightTopSquare(event);
        return;
      }

      if (currentLocX > edgeX && currentLocY > edgeY) {
        this.expandRightBottomSquare(event);
        return;
      }

      if (currentLocX < this.constraintBoundary) {
        this.expandLeftSquare(event);
        return;
      }

      if (currentLocY < this.constraintBoundary) {
        this.expandTopSquare(event);
        return;
      }

      if (currentLocX > edgeX) {
        this.expandRightSquare(event);
        return;
      }

      if (currentLocY > edgeY) {
        this.expandBottomSquare(event);
        return;
      }

      this.movingSquare(event);
    },
    expandLeftTopSquare(event: MouseEvent) {
      this.expandLeftSquare(event);
      this.expandTopSquare(event);
    },
    expandRightTopSquare(event: MouseEvent) {
      this.expandRightSquare(event);
      this.expandTopSquare(event);
    },
    expandRightBottomSquare(event: MouseEvent) {
      this.expandRightSquare(event);
      this.expandBottomSquare(event);
    },
    expandLeftBottomSquare(event: MouseEvent) {
      this.expandBottomSquare(event);
      this.expandLeftSquare(event);
    },
    expandLeftSquare(event: MouseEvent) {
      if (2 * this.constraintBoundary > this.currentImageWidth) {
        return;
      }
      let movingDiffX = event.pageX - this.tempLocX;
      this.frameX = movingDiffX;
      const setWidth = this.fixLocWidth - this.frameX;
      this.expandXConstraint(setWidth);
    },
    expandRightSquare(event: MouseEvent) {
      if (2 * this.constraintBoundary > this.currentImageWidth) {
        return;
      }
      let movingDiffX = event.pageX - this.tempLocX;
      const setWidth = movingDiffX + this.tempLocWidth - this.frameX;
      this.expandXConstraint(setWidth);
    },
    expandTopSquare(event: MouseEvent) {
      if (2 * this.constraintBoundary > this.currentImageHeight) {
        return;
      }

      let movingDiffY = event.pageY - this.tempLocY;
      this.frameY = movingDiffY;
      const setHeight = this.fixLocHeight - this.frameY;
      this.setExpandYConstraint(setHeight);
    },
    expandBottomSquare(event: MouseEvent) {
      if (2 * this.constraintBoundary > this.currentImageHeight) {
        return;
      }

      let movingDiffY = event.pageY - this.tempLocY;
      this.limitSquareHeight = movingDiffY + this.tempLocHeight - this.frameY;
      const setHeight = movingDiffY + this.tempLocHeight - this.frameY;
      this.setExpandYConstraint(setHeight);
    },
    expandXConstraint(setWidth: number) {
      if (setWidth > this.currentImageWidth) {
        this.limitSquareWidth = this.currentImageWidth;
        return;
      }
      if (setWidth < 3 * this.constraintBoundary) {
        this.limitSquareWidth = 3 * this.constraintBoundary;
        return;
      }
      this.limitSquareWidth = setWidth;
    },
    setExpandYConstraint(setHeight: number) {
      if (setHeight > this.currentImageHeight) {
        this.limitSquareHeight = this.currentImageHeight;
        return;
      }
      if (setHeight < 3 * this.constraintBoundary) {
        this.limitSquareHeight = 3 * this.constraintBoundary;
        return;
      }
      this.limitSquareHeight = setHeight;
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

      if (2 * this.constraintBoundary < this.currentImageWidth) {
        this.frameX = movingDiffX;
      }

      let movingDiffY = event.pageY - this.tempLocY;

      const upperYConstraint 
        = this.currentImageHeight - this.limitSquareHeight;

      if (movingDiffY < 0) {
        movingDiffY = 0;
      }

      if (movingDiffY > upperYConstraint) {
        movingDiffY = upperYConstraint;
      }

      if (3 * this.constraintBoundary < this.currentImageHeight) {
        this.frameY = movingDiffY;
      }
    },
    moveClipLeave() {
      this.isCurrentMoving = false;
      this.tempLocX = -1;
      this.tempLocY = -1;
      this.tempLocWidth = 0;
      this.tempLocHeight = 0;
      this.fixLocWidth = 0;
      this.fixLocHeight = 0;
    },
    resetClipFrameLayout() {
      this.frameX = 0;
      this.frameY = 0;
      this.limitSquareWidth = this.constraintSquareWidth;
      this.limitSquareHeight = this.constraintSquareHeight;
      this.limitClipFrameLayout();
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
    async resizeImage(
      imageUrl: string, 
      resizeWidth: number, 
      resizeHeight: number
    ): Promise<string> {
      if (
        this.constraintSquareWidth === this.limitSquareWidth &&
        this.constraintSquareHeight === this.limitSquareHeight
      ) {
        return '';
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
          canvas.width = resizeWidth;
          canvas.height = resizeHeight;
          ctx.drawImage(
            image, 
            0, 
            0 ,
            resizeWidth,
            resizeHeight,
          );
          const imageResult = canvas.toDataURL();
          image.remove();
          resolve(imageResult);
        }
        image.src = imageUrl;
      });
    },
    constraintSquareSize(): { resizeImageWidth: number, resizeImageHeight: number} {
      let resizeImageWidth = 0;
      let resizeImageHeight = 0;

      const imageXYRatio = this.limitSquareWidth / this.limitSquareHeight;
      if (imageXYRatio > 1) {
        resizeImageWidth = this.limitSquareWidth;
        resizeImageHeight = this.limitSquareWidth / imageXYRatio;
        if (resizeImageHeight > this.constraintSquareHeight) {
          resizeImageWidth = this.constraintSquareHeight * imageXYRatio;
          resizeImageHeight = this.constraintSquareHeight;
        }
      } else {
        resizeImageWidth = this.limitSquareHeight * imageXYRatio;
        resizeImageHeight = this.limitSquareHeight;
        if (resizeImageWidth > this.constraintSquareWidth) {
          resizeImageWidth = this.constraintSquareWidth;
          resizeImageHeight = this.constraintSquareWidth / imageXYRatio;
        }
      }

      return {
        resizeImageWidth,
        resizeImageHeight,
      }
    },
    async exportImageBase64() {
      try {
        if (!this.needTrimConstraint) {
          return await this.trimImage();
        }
        const trimImage = await this.trimImage();
        return await this.resizeImage(trimImage, this.constraintSquareWidth, this.constraintSquareHeight);
      } catch (error) {
        console.error(error);
      }
    },
  }
})
