class PlayerInteraction {
    constructor(definition) {
        this.type = definition.type || 'PlayerInteraction';
        this.requestingFactionId = definition.requestingFactionId;
        this.respondingFactionId = definition.respondingFactionId;
        this.status = definition.status || 'requested';
    }
}

export default PlayerInteraction;