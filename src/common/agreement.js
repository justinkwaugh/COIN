class Agreement {
    constructor(definition) {
        this.type = definition.type || 'Agreement';
        this.requestingFactionId = definition.requestingFactionId;
        this.respondingFactionId = definition.respondingFactionId;
        this.status = definition.status || 'requested';
    }
}

export default Agreement;