import _ from '../../lib/lodash';

class RaidResults {
    constructor(definition) {
        this.region = definition.region;
        this.faction = definition.faction;
        this.raidableFactions = definition.raidableFactions;
        this.priority = definition.priority;
        this.resourcesGained = 0;
    }

    logResults() {
        console.log('*** Raid - ' + this.faction.name + ' is raiding in region ' + this.region.name + (this.priority ? ' with priority ' + this.priority : ''));
        if (this.raidableFactions.length > 0) {
            console.log('Can raid ' + _.join(this.raidableFactions));
        }
        else {
            console.log('Can not raid any specific factions');
        }
    }
}

export default RaidResults;
