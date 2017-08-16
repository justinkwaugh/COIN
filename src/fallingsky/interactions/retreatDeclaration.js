import PlayerInteraction from 'common/playerInteraction';

class RetreatDeclaration extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'RetreatDeclaration';
        super(definition);

        this.regionId = definition.regionId;
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            regionId: this.regionId
        });
    }

    loadGameState(json) {
        super.loadGameState(json);

        this.regionId = json.regionId;
    }
}

export default RetreatDeclaration;