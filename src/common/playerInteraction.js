class PlayerInteraction {
    constructor(definition) {
        this.type = definition.type || 'PlayerInteraction';
        this.requestingFactionId = definition.requestingFactionId;
        this.respondingFactionId = definition.respondingFactionId;
        this.status = definition.status || 'requested';
    }

    toJSON() {
        return {
            type: this.type,
            requestingFactionId: this.requestingFactionId,
            respondingFactionId: this.respondingFactionId,
            status: this.status
        };
    }

    loadGameState(json) {
        this.type = json.type;
        this.requestingFactionId = json.requestingFactionId;
        this.respondingFactionId = json.respondingFactionId;
        this.status = json.status;
    }
}

export default PlayerInteraction;