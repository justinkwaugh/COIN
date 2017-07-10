
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
}

export default FactionPiece;