import _ from '../../../lib/lodash';

class SubornResults {
    constructor(definition) {
        this.region = definition.region;
        this.canPlaceAlly = definition.canPlaceAlly;
        this.alliedFactions = definition.alliedFactions;
        this.mobileFactions = definition.mobileFactions;
        this.priority = definition.priority;
    }

    logResults() {
        console.log('*** Aedui Suborn in region ' + this.region.name + (this.priority ? ' with priority ' + this.priority : ''));
        if (this.canPlaceAlly) {
            console.log('Can result in Ally placed');
        }
        if (this.alliedFactions.length > 0) {
            console.log('Can result in Ally removal from possible factions: ' + _.join(this.alliedFactions));
        }
        if (this.mobileFactions.length > 0) {
            console.log('Can result in Warband/Auxilia removal from possible factions: ' + _.join(this.mobileFactions));
        }
    }
}

export default SubornResults;