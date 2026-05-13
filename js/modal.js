// js/modal.js

let modalOverlay;
let modalText;
let modalBtns;
let modalYesBtn;

document.addEventListener('DOMContentLoaded', () => {

    modalOverlay = document.getElementById('custom-modal-overlay');
    modalText = document.getElementById('custom-modal-text');
    modalBtns = document.getElementById('custom-modal-btns');
    modalYesBtn = document.getElementById('custom-modal-yes-btn');

});

function closeCustomModal() {

    modalOverlay.classList.remove('show');

    setTimeout(() => {
        modalOverlay.style.display = 'none';
    }, 200);
}

function showConfirmModal(text, onConfirm) {

    modalText.innerHTML = text;

    modalBtns.style.display = 'flex';

    modalOverlay.style.display = 'flex';

    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);

    modalYesBtn.onclick = () => {
        onConfirm();
    };
}

function showLoadingModal(text, duration, onComplete) {

    modalText.innerHTML = text;

    modalBtns.style.display = 'none';

    if (!modalOverlay.classList.contains('show')) {

        modalOverlay.style.display = 'flex';

        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
    }

    if (duration) {

        setTimeout(() => {

            if (onComplete) {
                onComplete();
            }

        }, duration);
    }
}

function showSuccessModal(text, duration, onComplete) {

    modalText.innerHTML = text;

    modalBtns.style.display = 'none';

    setTimeout(() => {

        closeCustomModal();

        if (onComplete) {
            setTimeout(onComplete, 200);
        }

    }, duration);
}
window.closeCustomModal = closeCustomModal;
window.showConfirmModal = showConfirmModal;
window.showLoadingModal = showLoadingModal;
window.showSuccessModal = showSuccessModal;