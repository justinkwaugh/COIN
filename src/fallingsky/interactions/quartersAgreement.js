import PlayerInteraction from 'common/playerInteraction';

class QuartersAgreement extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'QuartersAgreement';
        super(definition);
    }
}

export default QuartersAgreement;