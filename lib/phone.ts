export function isOrange(phone: string){
    const normalized = normalizeNumber(phone);
    if (!isValidMobileCM(normalized)) return false;
    const prefix = normalized.substring(0, 3);
    return ['655', '656', '657', '658', '659', '686', '687', '688', '689', '640'].includes(prefix) ||
        /^69[0-9]{8}/.test(normalized);
}

export function isMTN(phone: string){
    const normalized = normalizeNumber(phone);
    if (!isValidMobileCM(normalized)) return false;
    const prefix = normalized.substring(0, 3);
    return ['650', '651', '652', '653', '654', '680', '681', '682', '683'].includes(prefix) ||
        /^67[0-9]/.test(normalized);
}


export function normalizeNumber(phone: string){
    return phone.replace(/\D/g, '').replace(/^237/, '');
}

export function isValidMobileCM(phone: string){
    const normalized = normalizeNumber(phone);
    return /^6\d{8}$/.test(normalized);
}
