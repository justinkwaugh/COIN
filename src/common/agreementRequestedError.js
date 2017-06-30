class AgreementRequestedError {
    constructor(message, agreement) {
        this.name = 'AgreementRequestedError';
        this.message = message;
        this.agreement = agreement;
    }
}

export default AgreementRequestedError;