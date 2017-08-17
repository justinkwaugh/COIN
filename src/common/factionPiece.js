import COINObject from 'common/coinObject';

class FactionPiece extends COINObject {
    constructor(definition) {
        super(definition);

        this.factionId = definition.factionId;
        this.type = definition.type;
        this.isMobile = definition.isMobile;
        this.canRoll = definition.canRoll;
    }

    identifier() {
        return this.factionId + '|' + this.type;
    }
}

FactionPiece.registerClass();

export default FactionPiece;