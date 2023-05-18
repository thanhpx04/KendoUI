import { showFlag } from '@forge/bridge';

export const showErrorFlag = (message) => {
    showFlag({
        id: 'error-flag',
        title: 'Error',
        type: 'error',
        description: message,
        isAutoDismiss: true,
    });
}

export const showWarningFlag = (message) => {
    showFlag({
        id: 'warning-flag',
        title: 'Note',
        type: 'warning',
        description: message,
        isAutoDismiss: true,
    });
} 

export const showSuccessFlag = (message) => {
    showFlag({
        id: 'success-flag',
        title: 'Note',
        type: 'success',
        description: message,
        isAutoDismiss: true,
    });
} 