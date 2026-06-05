// js/modal.js

let modalTimer = null;     
let fadeOutTimer = null;    

// 🌟 1. 모달창 닫기
function closeCustomModal() {
    const overlay = document.getElementById('custom-modal-overlay');
    if (!overlay) return;

    if (modalTimer) clearTimeout(modalTimer);
    if (fadeOutTimer) clearTimeout(fadeOutTimer);

    overlay.classList.remove('show');
    
    fadeOutTimer = setTimeout(() => {
        overlay.style.display = 'none';
    }, 200);
}

function prepareModal() {
    const overlay = document.getElementById('custom-modal-overlay');
    
    if (modalTimer) clearTimeout(modalTimer);
    if (fadeOutTimer) clearTimeout(fadeOutTimer);
    
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('show'), 10);
    }
}

function showConfirmModal(text, onConfirm) {
    const modalText = document.getElementById('custom-modal-text');
    const modalBtns = document.getElementById('custom-modal-btns');
    const modalYesBtn = document.getElementById('custom-modal-yes-btn');

    if (!modalText) return;

    prepareModal(); 

    modalText.innerHTML = text;
    if (modalBtns) modalBtns.style.display = 'flex';

    if (modalYesBtn) {
        modalYesBtn.onclick = () => {
            closeCustomModal(); 
            if (onConfirm) onConfirm();
        };
    }
}

function showLoadingModal(text, duration = 0, onComplete) {
    const modalText = document.getElementById('custom-modal-text');
    const modalBtns = document.getElementById('custom-modal-btns');

    if (!modalText) return;

    prepareModal();

    modalText.innerHTML = text;
    if (modalBtns) modalBtns.style.display = 'none'; 

    if (duration > 0) {
        modalTimer = setTimeout(() => {
            closeCustomModal();
            if (onComplete) onComplete();
        }, duration);
    }
}

function showSuccessModal(text, duration = 1500, onComplete) {
    const modalText = document.getElementById('custom-modal-text');
    const modalBtns = document.getElementById('custom-modal-btns');
    const overlay = document.getElementById('custom-modal-overlay');

    if (!modalText || !overlay) return;

    prepareModal();

    modalText.innerHTML = text;
    if (modalBtns) modalBtns.style.display = 'none';
    overlay.style.zIndex = '99999';

    modalTimer = setTimeout(() => {
        closeCustomModal();
        if (onComplete) onComplete();
    }, duration);
}

window.closeCustomModal = closeCustomModal;
window.showConfirmModal = showConfirmModal;
window.showLoadingModal = showLoadingModal;
window.showSuccessModal = showSuccessModal;