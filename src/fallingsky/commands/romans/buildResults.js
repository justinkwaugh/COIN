class BuildResults {
    constructor(definition) {
        this.region = definition.region;
        this.agreementsNeeded = definition.agreementsNeeded;
        this.canPlaceFort = definition.canPlaceFort;
        this.canRemoveAlly = definition.canRemoveAlly;
        this.canPlaceAlly = definition.canPlaceAlly;
        this.requiresFortForControl = definition.requiresFortForControl;
    }
}

export default BuildResults