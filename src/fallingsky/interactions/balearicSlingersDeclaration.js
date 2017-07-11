import PlayerInteraction from 'common/playerInteraction';

class BalearicSlingersDeclaration extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'BalearicSlingersDeclaration';
        super(definition);
        this.regionId = definition.regionId;
        this.defendingFactionId = definition.defendingFactionId;
    }
}

export default BalearicSlingersDeclaration;