import PlayerInteraction from 'common/playerInteraction';

class GermanicHorseDeclaration extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'GermanicHorseDeclaration';
        super(definition);
        this.regionId = definition.regionId;
    }
}

export default GermanicHorseDeclaration;