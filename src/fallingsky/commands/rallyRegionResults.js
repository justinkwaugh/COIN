import FactionIDs from 'fallingsky/config/factionIds';

class RallyRegionResults {
    constructor(definition) {
        this.region = definition.region;
        this.faction = definition.faction;
        this.cost = definition.cost;
        this.inSupplyLine = definition.inSupplyLine;
        this.canAddCitadel = definition.canAddCitadel;
        this.canAddAlly = definition.canAddAlly;
        this.canAddNumWarbands = definition.canAddNumWarbands;
        this.canAddNumAuxilia = definition.canAddNumAuxilia;
        this.addAlly = definition.addAlly;
        this.addCitadel = definition.addCitadel;
        this.addNumWarbands = definition.addNumWarbands;
        this.addNumAuxilia = definition.addNumAuxilia;
    }

    logResults() {
        console.log('*** ' + (this.faction.id === FactionIDs.ROMANS ? 'Recruit' : 'Rally') + ' - ' + this.faction.name + ' is ' + (this.faction.id === FactionIDs.ROMANS ? 'recruiting' : 'rallying') + ' in region ' + this.region.name + ' for cost ' + this.cost);
        console.log(
            'Results in ' + (this.addAlly ? '1' : 'no' ) + ' Ally added, ' +
            (this.addCitadel ? '1' : 'no' ) + ' Citadel added, ' +
            this.addNumWarbands + 'x Warbands added' +
            this.addNumAuxilia + 'x Auxilia added');
    }
}

export default RallyRegionResults;
