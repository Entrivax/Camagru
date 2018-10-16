/// <reference path="../api/ApiPost.ts"/>

class Webcam {
    private inputModeTemplate =
        `
        <div id="camera-container"></div>
        <div id="select-file-container">
            <label id="select-file">If you want to take a file from your device, select a file! <input type="file"></label>
        </div>
        `;

    private cameraTemplate =
        `
        <video id="camera" autoplay></video>
        <i class="far fa-dot-circle fa-3x" id="take-photo-button"></i>
        `;

    private editModeTemplate =
        `
        <div id="edit-canvas-container">
            <button id="back-button">Back</button>
            <button id="confirm-button" disabled>Confirm</button>
            <div class="edition-container">
                <canvas></canvas>
                <div id="handles" class="handles-container" style="display: none;">
                    <div id="top-left-handle" class="handle"></div>
                    <div id="top-right-handle" class="handle"></div>
                    <div id="middle-handle" class="handle"></div>
                    <div id="bottom-left-handle" class="handle"></div>
                    <div id="bottom-right-handle" class="handle"></div>
                </div>
            </div>
            <div style="display: none;">
                <div class="loading-bar" style="height: 20px;"></div>
            </div>
            <div class="row" id="images-selection"></div>
        </div>
        `;

    constructor(private container: HTMLElement, private httpRequestFactory: HttpRequestFactory) {
        this.images = {
            images: [],
            promise: new ApiPostEffects(httpRequestFactory).get()
        };
        this.images.promise.then((effects) => {
            effects.content.images.forEach((image) => {
                let img = new Image();
                let imgToPush = {
                    file: image.file,
                    promise: null,
                };
                imgToPush.promise = new Promise<HTMLImageElement>((resolve, reject) => {
                    img.onload = () => {
                        resolve(img);
                    };
                    img.src = './images/' + image.file;
                });
                this.images.images.push(imgToPush);
            });
        });
    }
        
    private uploadListener: () => void;

    private webcamStream: MediaStream;

    private images: {
        promise: Promise<ApiPostEffectsResponse>,
        images: {
            file: string,
            promise: Promise<HTMLImageElement>
        }[]
    };

    showInputMode() {
        this.container.innerHTML = this.inputModeTemplate;

        let cameraContainer = this.container.querySelector('#camera-container');
        navigator.getUserMedia({ video: {
            width: { ideal: 9999 }
        }, audio: false },
            (localMediaStream: MediaStream) => {
                cameraContainer.innerHTML = this.cameraTemplate;
                this.webcamStream = localMediaStream;
                (<HTMLVideoElement>this.container.querySelector('#camera')).srcObject = localMediaStream;
                
                this.container.querySelector('#take-photo-button').addEventListener('click', () => {
                    let tempCanvas = document.createElement('canvas');
                    let tempContext = tempCanvas.getContext('2d');
                    let camera = (<HTMLVideoElement>this.container.querySelector('#camera'));
                    tempCanvas.width = camera.videoWidth;
                    tempCanvas.height = camera.videoHeight;
                    tempContext.drawImage(camera, 0, 0);
                    this.showEditMode(tempCanvas, true);
                });
            }, (error) => {
                if (error.name === 'NotFoundError') {
                    cameraContainer.innerHTML = '<div>No camera found!</div>';
                }
                console.error('Error occured while retrieving user media: ' + error);
            });

        let input = <HTMLInputElement>this.container.querySelector('#select-file-container input[type=file]');
        input.addEventListener('change', (ev: Event) => {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
        
                reader.onload = () => {
                    let image = new Image();
                    image.src = <string>reader.result;
                    
                    image.onload = () => {
                        this.showEditMode(image, input.files[0].type === 'image/jpeg');
                    };
                }
        
                reader.readAsDataURL(input.files[0]);
            }
        });
    }

    showEditMode(img: HTMLCanvasElement | HTMLImageElement, useJpeg: boolean) {
        this.stop();
        let imagesToAdd: ImageEffect[] = [];
        let selectedImageIndex = -1;
        this.container.innerHTML = this.editModeTemplate;

        this.container.querySelector('#back-button').addEventListener('click', () => {
            this.showInputMode();
        });

        let confirmButton = <HTMLButtonElement>this.container.querySelector('#confirm-button');
        confirmButton.addEventListener('click', () => {
            if (confirmButton.disabled) {
                return;
            }
            if (imagesToAdd.length === 0) {
                return;
            }
            let apiPost = new ApiPost(this.httpRequestFactory);
            let tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = img.width;
            tmpCanvas.height = img.height;
            let tmpContext = tmpCanvas.getContext('2d');
            tmpContext.drawImage(img, 0, 0);
            let loadingBar = <HTMLElement>this.container.querySelector('.loading-bar');
            loadingBar.parentElement.style.display = 'block';
            confirmButton.disabled = true;
            apiPost.post(tmpCanvas.toDataURL(useJpeg ? 'image/jpeg' : undefined, useJpeg ? 0.88 : undefined).split('base64,')[1], imagesToAdd, (progressEvent: ProgressEvent) => {
                loadingBar.style.width = (progressEvent.loaded / progressEvent.total * 100) + '%';
            }).then(() => {
                this.uploadListener();
                this.showInputMode();
            }, () => {
                confirmButton.disabled = false;
            });
        });

        let editionContainer = <HTMLDivElement>this.container.querySelector('.edition-container');
        let handlesContainer = <HTMLDivElement>this.container.querySelector('#handles');
        let topLeftHandler = <HTMLDivElement>handlesContainer.querySelector('#top-left-handle');
        let topRightHandler = <HTMLDivElement>handlesContainer.querySelector('#top-right-handle');
        let middleHandler = <HTMLDivElement>handlesContainer.querySelector('#middle-handle');
        let bottomLeftHandler = <HTMLDivElement>handlesContainer.querySelector('#bottom-left-handle');
        let bottomRightHandler = <HTMLDivElement>handlesContainer.querySelector('#bottom-right-handle');

        let startedToDragTopLeft = false;
        topLeftHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragTopLeft = true;
        });
        let startedToDragTopRight = false;
        topRightHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragTopRight = true;
        }, false);
        let startedToDragBottomLeft = false;
        bottomLeftHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragBottomLeft = true;
        }, false);
        let startedToDragBottomRight = false;
        bottomRightHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragBottomRight = true;
        }, false);
        let startedToDragMiddle = false;
        middleHandler.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            startedToDragMiddle = true;
        }, false);

        function updateHandles() {
            if (selectedImageIndex < 0) {
                handlesContainer.style.display = 'none';
                return;
            }
            handlesContainer.style.display = 'block';
            handlesContainer.style.top = (imagesToAdd[selectedImageIndex].y) + '%';
            handlesContainer.style.left = (imagesToAdd[selectedImageIndex].x) + '%';
            handlesContainer.style.right = (100 - (imagesToAdd[selectedImageIndex].x + imagesToAdd[selectedImageIndex].width)) + '%';
            handlesContainer.style.bottom = (100 - (imagesToAdd[selectedImageIndex].y + imagesToAdd[selectedImageIndex].height)) + '%';
        }

        let clicking = false;
        editionContainer.addEventListener('mousedown', (evt: MouseEvent) => {
            evt.preventDefault();
            clicking = true;
        });
        editionContainer.addEventListener('mouseup', (evt: MouseEvent) => {
            evt.preventDefault();
            if (clicking) {
                let box = editionContainer.getBoundingClientRect();
                let x = ((evt.clientX - box.left) / (box.right - box.left)) * 100;
                let y = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100;
                selectedImageIndex = -1;
                for (let i = imagesToAdd.length - 1; i >= 0; i--) {
                    if (x >= imagesToAdd[i].x && x <= imagesToAdd[i].x + imagesToAdd[i].width &&
                        y >= imagesToAdd[i].y && y <= imagesToAdd[i].y + imagesToAdd[i].height) {
                        selectedImageIndex = i;
                        break;
                    }
                }
                updateHandles();
            }
            clicking = false;
        });

        editionContainer.addEventListener('mousemove', (evt: MouseEvent) => {
            clicking = false;
            evt.preventDefault();
            if (!startedToDragBottomLeft && !startedToDragBottomRight && !startedToDragMiddle && !startedToDragTopLeft && !startedToDragTopRight) {
                return;
            }
            let selectedImage = imagesToAdd[selectedImageIndex];
            let box = editionContainer.getBoundingClientRect();
            if (startedToDragTopLeft) {
                let newX = ((evt.clientX - box.left) / (box.right - box.left)) * 100;
                let newWidth = (selectedImage.width + selectedImage.x - newX);
                if (newWidth < 0) {
                    newWidth = 0;
                    newX = selectedImage.x + selectedImage.width;
                }
                selectedImage.x = newX;
                selectedImage.width = newWidth;

                let newY = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100;
                let newHeight = (selectedImage.height + selectedImage.y - newY);
                if (newHeight < 0) {
                    newHeight = 0;
                    newY = selectedImage.y + selectedImage.height;
                }
                selectedImage.y = newY;
                selectedImage.height = newHeight;
            } else if (startedToDragTopRight) {
                let newWidth = ((evt.clientX - box.left) / (box.right - box.left)) * 100 - selectedImage.x;
                if (newWidth < 0) {
                    newWidth = 0;
                }
                selectedImage.width = newWidth;

                let newY = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100;
                let newHeight = (selectedImage.height + selectedImage.y - newY);
                if (newHeight < 0) {
                    newHeight = 0;
                    newY = selectedImage.y + selectedImage.height;
                }
                selectedImage.y = newY;
                selectedImage.height = newHeight;
            } else if (startedToDragMiddle) {
                selectedImage.x = ((evt.clientX - box.left) / (box.right - box.left)) * 100 - selectedImage.width / 2;
                selectedImage.y = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100 - selectedImage.height / 2;
            } else if (startedToDragBottomLeft) {
                let newX = ((evt.clientX - box.left) / (box.right - box.left)) * 100;
                let newWidth = (selectedImage.width + selectedImage.x - newX);
                if (newWidth < 0) {
                    newWidth = 0;
                    newX = selectedImage.x + selectedImage.width;
                }
                selectedImage.x = newX;
                selectedImage.width = newWidth;

                let newHeight = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100 - selectedImage.y;
                if (newHeight < 0) {
                    newHeight = 0;
                }
                selectedImage.height = newHeight;
            } else if (startedToDragBottomRight) {
                let newWidth = ((evt.clientX - box.left) / (box.right - box.left)) * 100 - selectedImage.x;
                if (newWidth < 0) {
                    newWidth = 0;
                }
                selectedImage.width = newWidth;

                let newHeight = ((evt.clientY - box.top) / (box.bottom - box.top)) * 100 - selectedImage.y;
                if (newHeight < 0) {
                    newHeight = 0;
                }
                selectedImage.height = newHeight;
            }

            updateHandles();
            this.redrawCanvas(canvas, context, img, imagesToAdd);
        });

        editionContainer.addEventListener('mouseup', (evt) => {
            evt.preventDefault();
            startedToDragTopLeft = false;
            startedToDragTopRight = false;
            startedToDragMiddle = false;
            startedToDragBottomLeft = false;
            startedToDragBottomRight = false;
        });

        this.images.promise.then(() => {
            Promise.all(this.images.images.map((i) => i.promise)).then((images) => {
                let imagesContainer = this.container.querySelector('#images-selection');
                images.forEach((i, index) => {
                    let imageSelectionContainer = document.createElement('div');
                    imageSelectionContainer.classList.add('col-xs-4');
                    imageSelectionContainer.classList.add('col-md-3');
                    imageSelectionContainer.classList.add('col-lg-2');
                    let imageSelection = document.createElement('div');
                    imageSelection.classList.add('image-selection');
                    imageSelection.appendChild(i);
                    imageSelectionContainer.appendChild(imageSelection);
                    imagesContainer.appendChild(imageSelectionContainer);

                    imageSelection.addEventListener('click', () => {
                        confirmButton.removeAttribute('disabled');
                        let canvasRatio = canvas.width / canvas.height;
                        let imgRatio = images[index].width / images[index].height;
                        let sw = canvasRatio > imgRatio ? (images[index].width * canvas.height / images[index].height) : (canvas.width);
                        let sh = canvasRatio > imgRatio ? (canvas.height) : (images[index].height * canvas.width / images[index].width);
                        imagesToAdd.push(new ImageEffect(
                            images[index],
                            index,
                            100 * ((canvas.width - sw) / 2) / canvas.width,
                            100 * ((canvas.height - sh) / 2) / canvas.height,
                            100 * sw / canvas.width,
                            100 * sh / canvas.height
                        ));
                        selectedImageIndex = imagesToAdd.length - 1;
                        updateHandles();
                        this.redrawCanvas(canvas, context, img, imagesToAdd);
                    });
                });
            });
        });

        let canvas = <HTMLCanvasElement>this.container.querySelector('canvas');
        let context = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
    }

    redrawCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, originalImage: HTMLCanvasElement | HTMLImageElement, overlayImages: ImageEffect[]) {
        context.drawImage(originalImage, 0, 0);
        for (let overlayImage of overlayImages) {
            context.drawImage(overlayImage.img, canvas.width * overlayImage.x / 100, canvas.height * overlayImage.y / 100, canvas.width * overlayImage.width / 100, canvas.height * overlayImage.height / 100);
        }
    }

    stop() {
        if (this.webcamStream) {
            let camera = (<HTMLVideoElement>this.container.querySelector('#camera'));
            this.webcamStream.getTracks().forEach(track => track.stop());
            if (camera) {
                camera.srcObject = null;
            }
            this.webcamStream = undefined;
        }
    }

    setUploadListener(listener: () => void) {
        this.uploadListener = listener;
    }
}

class ImageEffect {
    img: HTMLImageElement;
    /**
     * Position x in percentage of the canvas
     */
    x: number;
    /**
     * Position y in percentage of the canvas
     */
    y: number;
    /**
     * Width in percentage of the canvas
     */
    width: number;
    /**
     * Height in percentage of the canvas
     */
    height: number;

    effectId: number;

    constructor(img: HTMLImageElement, effectId: number, x: number, y: number, width: number, height: number) {
        this.img = img;
        this.effectId = effectId;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}