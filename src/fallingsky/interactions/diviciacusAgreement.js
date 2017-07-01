import PlayerInteraction from 'common/playerInteraction';

class DiviciacusAgreement extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'DiviciacusAgreement';
        super(definition);
    }
}

export default DiviciacusAgreement;