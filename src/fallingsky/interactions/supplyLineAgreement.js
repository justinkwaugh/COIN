import PlayerInteraction from 'common/playerInteraction';

class SupplyLineAgreement extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'SupplyLineAgreement';
        super(definition);
    }
}

export default SupplyLineAgreement;