
class FactionPiece {
    constructor(definition) {
        this.factionId = definition.factionId;
        this.type = definition.type;
        this.isMobile = definition.isMobile;
    }

    identifier() {
        return this.factionId + '|' + this.type;
    }
}

export default FactionPiece;