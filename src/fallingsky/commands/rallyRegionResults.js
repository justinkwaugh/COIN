
class RallyRegionResults {
    constructor(definition) {
        this.region = definition.region;
        this.faction = definition.faction;
        this.cost = definition.cost;
        this.canAddCitadel = definition.canAddCitadel;
        this.canAddAlly = definition.canAddAlly;
        this.canAddNumWarbands = definition.canAddNumWarbands;
        this.addAlly = definition.addAlly;
        this.addCitadel = definition.addCitadel;
        this.addNumWarbands = definition.addNumWarbands;
    }

    logResults() {
        console.log('*** Rally - ' + this.faction.name + ' is rallying in region ' + this.region.name + ' for cost ' + this.cost);
        console.log(
            'Results in ' + (this.addAlly ? '1' : 'no' ) + ' Ally added, ' +
            (this.addCitadel ? '1' : 'no' ) + ' Citadel added, ' +
            this.addNumWarbands + 'x Warbands added');
    }
}

export default RallyRegionResults;
