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

let modalTimer = null; 

function showSuccessModal(text, duration, onComplete) {
    const overlay = document.getElementById('custom-modal-overlay');
    const modalText = document.getElementById('custom-modal-text');
    const modalBtns = document.getElementById('custom-modal-btns');

    if (!overlay || !modalText) return;

    if (modalTimer) {
        clearTimeout(modalTimer);
        modalTimer = null;
    }

    modalText.innerHTML = text;
    if (modalBtns) modalBtns.style.display = 'none';

    overlay.style.display = 'flex';
    overlay.style.opacity = '1'; 
    overlay.style.zIndex = '99999';

    modalTimer = setTimeout(() => {
        overlay.style.display = 'none';
        
        if (onComplete) {
            onComplete(); 
        }
    }, duration);
}
window.closeCustomModal = closeCustomModal;
window.showConfirmModal = showConfirmModal;
window.showLoadingModal = showLoadingModal;
window.showSuccessModal = showSuccessModal;