import Agreement from 'common/agreement';

class SupplyLineAgreement extends Agreement {
    constructor(definition) {
        definition.type = 'SupplyLineAgreement';
        super(definition);
    }
}

export default SupplyLineAgreement;