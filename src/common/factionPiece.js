
class FactionPiece {
    constructor(definition) {
        this.factionId = definition.factionId;
        this.type = definition.type;
        this.isMobile = definition.isMobile;
        this.canRoll = definition.canRoll;
    }

    identifier() {
        return this.factionId + '|' + this.type;
    }

    toJSON() {
        return {
            factionId: this.factionId,
            type: this.type,
            isMobile: this.isMobile,
            canRoll: this.canRoll
        };
    }

    loadGameState(json) {
        this.factionid = json.factionId;
        this.type = json.type;
        this.isMobile = json.isMobile || false;
        this.canRoll = json.canRoll || false;
    }
}

export default FactionPiece;