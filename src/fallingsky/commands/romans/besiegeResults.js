
class BesiegeResults {
    constructor(definition) {
        this.region = definition.region;
        this.battle = definition.battle;

        this.willRemoveExtraAlly = definition.willRemoveExtraAlly;
        this.willRemoveExtraCitadel = definition.willRemoveExtraCitadel;
    }
}

export default BesiegeResults