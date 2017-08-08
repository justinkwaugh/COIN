import PlayerInteraction from 'common/playerInteraction';

class RemovePieces extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'RemovePieces';
        super(definition);

        this.reason = definition.reason;
        this.regionId = definition.regionId;
        this.count = definition.count;

        this.removed = definition.removed;
    }
}

export default RemovePieces;