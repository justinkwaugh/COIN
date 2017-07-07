import PlayerInteraction from 'common/playerInteraction';

class RetreatDeclaration extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'RetreatDeclaration';
        super(definition);

        this.regionId = definition.regionId;
    }
}

export default RetreatDeclaration;