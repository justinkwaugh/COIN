import PlayerInteraction from 'common/playerInteraction';

class RetreatDeclaration extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'RetreatDeclaration';
        super(definition);
    }
}

export default RetreatDeclaration;