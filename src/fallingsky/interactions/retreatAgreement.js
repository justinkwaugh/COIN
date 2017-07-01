import PlayerInteraction from 'common/playerInteraction';

class RetreatAgreement extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'RetreatAgreement';
        super(definition);
    }
}

export default RetreatAgreement;