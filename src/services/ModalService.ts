class ModalService {
    private currentModal : {
        promise: Promise<any>,
        dismiss: (arg: any) => void,
        dimissToken: any
    };

    constructor(private modalContainer: HTMLElement) { }

    show(controller: (container: HTMLElement, close: (arg: any) => void, dismiss: (arg: any) => void) => void) : Promise<any> {
        if (this.currentModal) {
            this.currentModal.dismiss(this.currentModal.dimissToken);
            this.currentModal = undefined;
            this.modalContainer.innerHTML = '';
        }
        let dismissToken = {};
        let promise = new Promise((resolve, reject) => {
            document.body.style.overflow = 'hidden';
            this.modalContainer.classList.add('visible');
            this.currentModal = {
                promise: null,
                dismiss: reject,
                dimissToken: dismissToken
            };
            controller(this.modalContainer, resolve, reject);
        });
        this.currentModal.promise = promise;
        let after = (arg) => {
            if (arg !== dismissToken) {
                this.currentModal = undefined;
                document.body.style.overflow = '';
                this.modalContainer.classList.remove('visible');
                this.modalContainer.innerHTML = '';
            }
        };
        promise.then(after, after);
        return promise;
    }
}